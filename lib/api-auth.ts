// =============================================================================
// In-handler admin session guard
// =============================================================================
// proxy.ts already rejects unauthenticated calls to the protected /api prefixes,
// but a proxy is a single point of failure: a matcher edit, a route moved out
// from under a guarded prefix, or a framework-level proxy bypass removes the
// only check standing in front of lead PII. Every handler that reads or writes
// that data calls this as well, so authorisation travels with the route.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME, verifySessionToken, type SessionPayload } from '@/lib/auth'

const unauthorized = () =>
  NextResponse.json(
    { success: false, error: 'Unauthorized. Valid admin session required.', code: 'UNAUTHORIZED' },
    { status: 401 }
  )

/**
 * Resolves the caller's admin session.
 *
 * Returns the payload on success, or the 401 response to return as-is. Callers
 * branch on `'response' in result` so a thrown/forgotten check cannot be
 * mistaken for a pass.
 */
export async function requireAdminSession(): Promise<
  { payload: SessionPayload } | { response: NextResponse }
> {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  const payload = sessionCookie ? await verifySessionToken(sessionCookie) : null

  if (!payload || payload.role !== 'admin') {
    return { response: unauthorized() }
  }

  return { payload }
}

/** Convenience form for handlers that only need to gate, not read the session. */
export async function adminGuard(): Promise<NextResponse | null> {
  const result = await requireAdminSession()
  return 'response' in result ? result.response : null
}
