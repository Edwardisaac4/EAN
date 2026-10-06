'use client'

// =============================================================================
// Pricing reveal store — page-view gate, session-scoped lead capture
// =============================================================================
// Two facts with deliberately different lifetimes. They used to share one
// sessionStorage entry, which is why a refresh left the price unlocked:
//
//   `revealed` / `lead`   In memory only. Module state dies with the page, so a
//                         refresh drops the visitor back onto the default,
//                         gated calculator — every selection reset, the form to
//                         fill again before a price is shown.
//
//   captured emails       sessionStorage. Outlives the refresh so re-revealing
//                         does not file a second lead against someone sales has
//                         already been told about.
//
// Exposed as an external store (consumed via useSyncExternalStore) so the
// server render and the client's first paint agree on "not revealed".

import type { LeadDetails } from '@/types/pricing'

/** Emails already accepted by /api/leads in this tab. */
const CAPTURED_KEY = 'ean_pricing_captured_v1'

/**
 * Superseded by CAPTURED_KEY. It persisted `revealed` alongside the whole lead
 * — name, email and phone — which is both more than the duplicate check needs
 * and the thing that used to keep a refreshed page unlocked. Cleared on first
 * read so a visitor already mid-session is not left carrying it.
 */
const LEGACY_REVEAL_KEY = 'ean_pricing_reveal_v1'

export interface RevealState {
  revealed: boolean
  lead: LeadDetails | null
}

const UNREVEALED: RevealState = { revealed: false, lead: null }

/**
 * Authoritative state for this page view. Never read from storage — a refresh
 * is meant to re-gate, so starting `UNREVEALED` is the whole point.
 */
let state: RevealState = UNREVEALED

const listeners = new Set<() => void>()

let legacyCleared = false

function clearLegacyEntry(): void {
  if (legacyCleared) return
  legacyCleared = true
  try {
    sessionStorage.removeItem(LEGACY_REVEAL_KEY)
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

/** Matches the server's own normalisation in lib/services/leads-service.ts. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Storage is writable by anything running on the origin, so a malformed value
 * is treated as "nothing captured yet" rather than trusted. Erring this way
 * costs at most one extra POST, which the server's duplicate guard absorbs.
 */
function readCaptured(): string[] {
  if (typeof window === 'undefined') return []

  clearLegacyEntry()

  try {
    const raw = sessionStorage.getItem(CAPTURED_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed.filter((entry): entry is string => typeof entry === 'string')
  } catch {
    return []
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
  return state
}

/** Server/hydration snapshot — pricing always starts gated on the server. */
export function getRevealServerSnapshot(): RevealState {
  return UNREVEALED
}

/**
 * True when this email has already produced a lead in this tab, so the gate can
 * unlock the price again without POSTing a duplicate.
 *
 * Scoped to the email rather than to the tab as a whole: a second visitor on a
 * shared browser entering their own details is a genuinely new lead and must
 * still reach sales.
 */
export function isLeadAlreadyCaptured(email: string): boolean {
  return readCaptured().includes(normalizeEmail(email))
}

/** Records an accepted /api/leads POST so a later reveal does not repeat it. */
export function markLeadCaptured(email: string): void {
  if (typeof window === 'undefined') return

  const normalized = normalizeEmail(email)
  const captured = readCaptured()
  if (captured.includes(normalized)) return

  try {
    sessionStorage.setItem(CAPTURED_KEY, JSON.stringify([...captured, normalized]))
  } catch {
    // Storage unavailable (private browsing, quota). The reveal still works;
    // the server's email+service duplicate guard becomes the only defence, so
    // a re-reveal more than DUPLICATE_WINDOW_MINUTES later could file a second
    // lead. Accepted over losing the reveal entirely.
  }
}

/** Unlocks pricing for the rest of this page view after a successful submit. */
export function grantReveal(lead: LeadDetails): void {
  state = { revealed: true, lead }
  listeners.forEach((listener) => listener())
}
