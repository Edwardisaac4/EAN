'use client'

// =============================================================================
// Pricing reveal store — session-scoped gate state
// =============================================================================
// Once a visitor submits the lead gate, the price stays revealed for the rest of
// their browsing session. Persisting this is what stops a page refresh from
// re-gating them and submitting a second, duplicate lead.
//
// Exposed as an external store (consumed via useSyncExternalStore) so the
// initial server render is always "not revealed" and the client can restore the
// real value after hydration without a mismatch.

import type { LeadDetails } from '@/types/pricing'

const STORAGE_KEY = 'ean_pricing_reveal_v1'

export interface RevealState {
  revealed: boolean
  lead: LeadDetails | null
}

const UNREVEALED: RevealState = { revealed: false, lead: null }

/**
 * Authoritative in-memory state. Stays `null` until first read so the value can
 * be lazily restored from sessionStorage, and remains correct even when storage
 * is unavailable (private browsing, quota exceeded).
 */
let state: RevealState | null = null

const listeners = new Set<() => void>()

/**
 * Storage is writable by anything running on the origin, so the restored lead is
 * shape-checked before it reaches the UI — a malformed value would otherwise
 * render as `undefined` in the revealed quote summary.
 */
function isLeadDetails(value: unknown): value is LeadDetails {
  if (!value || typeof value !== 'object') return false
  const lead = value as Record<string, unknown>
  return (
    typeof lead.name === 'string' &&
    typeof lead.email === 'string' &&
    typeof lead.phone === 'string' &&
    typeof lead.company === 'string'
  )
}

function parseStored(raw: string | null): RevealState {
  if (!raw) return UNREVEALED
  try {
    const parsed = JSON.parse(raw) as Partial<RevealState> | null
    if (!parsed || typeof parsed.revealed !== 'boolean') return UNREVEALED

    const lead = parsed.lead
    if (lead !== null && lead !== undefined && !isLeadDetails(lead)) return UNREVEALED

    return { revealed: parsed.revealed, lead: lead ?? null }
  } catch {
    return UNREVEALED
  }
}

export function subscribeToReveal(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Client snapshot. Returns a stable reference between mutations, as
 * useSyncExternalStore requires.
 */
export function getRevealSnapshot(): RevealState {
  if (state) return state
  if (typeof window === 'undefined') return UNREVEALED

  try {
    state = parseStored(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    state = UNREVEALED
  }

  return state
}

/** Server/hydration snapshot — pricing always starts gated on the server. */
export function getRevealServerSnapshot(): RevealState {
  return UNREVEALED
}

/** Unlocks pricing for the rest of the session after a successful lead submit. */
export function grantReveal(lead: LeadDetails): void {
  state = { revealed: true, lead }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable — the reveal still holds in memory for this session.
  }

  listeners.forEach((listener) => listener())
}
