// =============================================================================
// Rate limiting — backed by Postgres (supabase/migrations/004_rate_limits.sql)
// =============================================================================
// This replaced an in-memory Map. That version could not work on Vercel: each
// lambda instance held its own counters, so "5 attempts per 15 minutes" was
// really "5 per warm instance", and the store was only attached to globalThis
// when NODE_ENV !== 'production' — inverted from the intent documented on it.
//
// Counters now live in a shared table, so the limit holds across instances,
// regions, and deploys.
//
// FAILURE POSTURE: every helper fails **open** and logs. A rate limiter is a
// mitigation, not an authorisation gate — the credential check and the session
// cookie are what actually protect /admin. Failing closed would convert a
// transient database blip into a total lockout of the admin portal, which is a
// worse outcome than briefly unthrottled attempts. Callers that want stricter
// behaviour can inspect `isDegraded`.

import { adminSupabase } from '@/utils/supabase/admin'

export interface RateLimitResult {
  isAllowed: boolean
  retryAfterSeconds?: number
  /** True when the check could not be evaluated and the request was let through. */
  isDegraded?: boolean
}

/** Admin login: 5 failed attempts per 15 minutes, then a 15 minute lockout. */
export const LOGIN_MAX_ATTEMPTS = 5
export const LOGIN_WINDOW_SECONDS = 15 * 60
export const LOGIN_LOCKOUT_SECONDS = 15 * 60

/**
 * Public lead form: 5 submissions per hour per IP. Generous for a human filling
 * in one enquiry (and duplicate submissions are collapsed separately in the
 * route), restrictive for a script.
 */
export const LEAD_MAX_SUBMISSIONS = 5
export const LEAD_WINDOW_SECONDS = 60 * 60

/** Aircraft lookup proxies a metered third-party API, so this guards spend. */
export const AIRCRAFT_SEARCH_MAX = 30
export const AIRCRAFT_SEARCH_WINDOW_SECONDS = 60

/**
 * Pricing quote calculator: 20 submissions per minute per IP.
 *
 * Same ceiling the route enforced before, now shared across instances. This
 * endpoint writes a lead on success, so it is a write path wearing a
 * calculator's clothes — the limit is the only thing between an unauthenticated
 * caller and unbounded inserts into `leads`.
 */
export const QUOTE_MAX_SUBMISSIONS = 20
export const QUOTE_WINDOW_SECONDS = 60

type RpcRow = { is_allowed: boolean; retry_after_seconds: number }

/**
 * The RPCs return a one-row table. supabase-js hands that back as an array, so
 * the shape is normalised in one place rather than at each call site.
 */
function firstRow(data: unknown): RpcRow | null {
  if (Array.isArray(data)) {
    return (data[0] as RpcRow | undefined) ?? null
  }
  if (data && typeof data === 'object' && 'is_allowed' in data) {
    return data as RpcRow
  }
  return null
}

function degraded(context: string, error: unknown): RateLimitResult {
  console.error(`[rate-limiter] ${context} failed; allowing request unthrottled:`, error)
  return { isAllowed: true, isDegraded: true }
}

/** Normalises an identity fragment so casing/padding cannot fork a bucket. */
function normalise(part: string): string {
  return part.trim().toLowerCase()
}

/**
 * Bucket key for a login attempt.
 *
 * Scoped to ip + email so that one attacker cannot lock a known admin out of
 * their own account by burning the attempt budget from a different address.
 */
export function loginKey(ip: string, email: string): string {
  return `login:${normalise(ip)}:${normalise(email)}`
}

/** Bucket key for a public lead submission — IP only; the form has no identity. */
export function leadKey(ip: string): string {
  return `lead:${normalise(ip)}`
}

/** Bucket key for the metered aircraft lookup proxy. */
export function aircraftSearchKey(ip: string): string {
  return `aircraft:${normalise(ip)}`
}

/** Bucket key for the public pricing quote calculator — IP only, like leads. */
export function quoteKey(ip: string): string {
  return `quote:${normalise(ip)}`
}

/**
 * Read-only lockout check — consumes no budget.
 *
 * Call this *before* validating credentials so a locked-out caller never reaches
 * the comparison.
 */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  try {
    const { data, error } = await adminSupabase.rpc('rate_limit_status', { p_key: key })
    if (error) return degraded('rate_limit_status', error)

    const row = firstRow(data)
    if (!row) return { isAllowed: true }

    return row.is_allowed
      ? { isAllowed: true }
      : { isAllowed: false, retryAfterSeconds: row.retry_after_seconds }
  } catch (err) {
    return degraded('rate_limit_status', err)
  }
}

/**
 * Records a failed credential attempt and reports whether the caller is now
 * locked out. Only failures count, so a user who mistypes once and then
 * succeeds carries no penalty forward.
 */
export async function recordFailedAttempt(
  key: string,
  max: number = LOGIN_MAX_ATTEMPTS,
  windowSeconds: number = LOGIN_WINDOW_SECONDS,
  lockoutSeconds: number = LOGIN_LOCKOUT_SECONDS
): Promise<RateLimitResult> {
  try {
    const { data, error } = await adminSupabase.rpc('rate_limit_record_failure', {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
      p_lockout_seconds: lockoutSeconds,
    })
    if (error) return degraded('rate_limit_record_failure', error)

    const row = firstRow(data)
    if (!row) return { isAllowed: true }

    return row.is_allowed
      ? { isAllowed: true }
      : { isAllowed: false, retryAfterSeconds: row.retry_after_seconds }
  } catch (err) {
    return degraded('rate_limit_record_failure', err)
  }
}

/**
 * Consumes one unit of budget for `key` and reports whether the request may
 * proceed. Unlike recordFailedAttempt this counts *every* call, which is the
 * right model for public endpoints where there is no success/failure distinction
 * — only volume.
 */
export async function consumeRateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const { data, error } = await adminSupabase.rpc('rate_limit_consume', {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    })
    if (error) return degraded('rate_limit_consume', error)

    const row = firstRow(data)
    if (!row) return { isAllowed: true }

    return row.is_allowed
      ? { isAllowed: true }
      : { isAllowed: false, retryAfterSeconds: row.retry_after_seconds }
  } catch (err) {
    return degraded('rate_limit_consume', err)
  }
}

/** Clears a bucket. Called after a successful login. */
export async function clearRateLimit(key: string): Promise<void> {
  try {
    const { error } = await adminSupabase.rpc('rate_limit_clear', { p_key: key })
    if (error) console.error('[rate-limiter] rate_limit_clear failed:', error)
  } catch (err) {
    console.error('[rate-limiter] rate_limit_clear failed:', err)
  }
}

/**
 * Best-effort extraction of the caller's address.
 *
 * x-forwarded-for is attacker-controlled in general, but on Vercel the platform
 * overwrites it at the edge, so the leftmost entry is the real client. The
 * fallback groups every unidentifiable caller into one shared bucket rather than
 * exempting them — an absent header must not be a way around the limit.
 */
export function clientIpFrom(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}
