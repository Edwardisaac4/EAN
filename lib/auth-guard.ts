// =============================================================================
// Admin route guard — the single in-route authentication check
// =============================================================================
// proxy.ts already refuses unauthenticated requests to /admin and /api/*, and
// that is the primary gate. This is the second one.
//
// Why two: proxy.ts decides what it inspects from one `matcher` array. Widening
// or narrowing that array — adding a public API, restructuring a prefix — can
// drop a route out of coverage, and nothing fails when it does. No error, no
// failed build. A route serving the entire lead table would simply start
// answering everyone. An unconditional check inside the handler cannot be
// switched off from another file.
//
// The logic here is not new. It is the four lines that were already copy-pasted
// into every /api/admin/* route, lifted into one place so the copies cannot
// drift apart.

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { SESSION_COOKIE_NAME, verifySessionToken, type SessionPayload } from '@/lib/auth'

/**
 * Discriminated rather than "returns the session or null" so a caller cannot
 * accidentally continue on a falsy value. `if (!guard.ok) return guard.response`
 * is the only correct use, and TypeScript will not narrow `guard.session` until
 * that early return exists.
 */
export type AdminGuardResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse }

/**
 * Requires a valid admin session on the current request.
 *
 * ```ts
 * export async function GET() {
 *   const guard = await requireAdmin()
 *   if (!guard.ok) return guard.response
 *   // …guard.session is available from here
 * }
 * ```
 *
 * Returns 401, never 403: the response body is identical whether the cookie is
 * absent, malformed, expired, retired by a credential rotation, or carries a
 * non-admin role. Distinguishing those would tell an attacker which half of the
 * problem to work on.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null

  if (!session || session.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized. Valid admin session required.' },
        { status: 401 }
      ),
    }
  }

  return { ok: true, session }
}
