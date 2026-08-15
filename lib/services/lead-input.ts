// =============================================================================
// Lead input validation — shared by every route that accepts a lead payload
// =============================================================================
// The public contact form, the pricing portal, and the admin GraphQL endpoint
// all hand untrusted JSON to `createLead`. Casting those fields to `string`
// (or to `never`) let a number, object, or array reach the database insert, so
// every entry point coerces through the guards below instead.

import { z } from 'zod'
import type { LeadServiceEnum, LeadSubmissionPayload } from '@/types/database'

export type LeadTrackingPayload = NonNullable<LeadSubmissionPayload['tracking']>

/** Mirrors the `lead_service` Postgres enum — anything else is rejected. */
export const LEAD_SERVICE_VALUES = [
  'fbo',
  'maintenance',
  'charter',
  'catering',
  'vip',
  'leasing',
  'general',
] as const

export function isLeadService(value: unknown): value is LeadServiceEnum {
  return (
    typeof value === 'string' &&
    (LEAD_SERVICE_VALUES as readonly string[]).includes(value)
  )
}

/** Accepts a service value, falling back to `general` when absent. */
export function parseLeadService(value: unknown): LeadServiceEnum | null {
  if (value === undefined || value === null || value === '') return 'general'
  return isLeadService(value) ? value : null
}

/** Strings only — a trimmed value, or undefined when blank or another type. */
export function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

/** Strings only — a trimmed value, or null when blank or another type. */
export function requiredString(value: unknown): string | null {
  return optionalString(value) ?? null
}

const nullableText = z.string().trim().max(2048).nullish()
/** Columns typed `string` (not nullable) in the payload — null collapses to undefined. */
const plainText = z
  .string()
  .trim()
  .max(2048)
  .nullish()
  .transform((value) => value ?? undefined)

/**
 * Attribution context captured client-side by `getTrackingContext`. Unknown
 * keys are stripped so a tampered payload cannot smuggle extra columns into the
 * `lead_tracking` insert.
 */
export const leadTrackingSchema = z.object({
  utmSource:        nullableText,
  utmMedium:        nullableText,
  utmCampaign:      nullableText,
  utmContent:       nullableText,
  utmTerm:          nullableText,
  referrerUrl:      nullableText,
  referrerDomain:   nullableText,
  landingPage:      nullableText,
  formPage:         nullableText,
  formId:           nullableText,
  deviceType:       plainText,
  browserName:      plainText,
  userLanguage:     plainText,
  screenResolution: plainText,
  capturedAt:       plainText,
})

/**
 * Normalises tracking context to the shape `createLead` expects. Attribution is
 * best-effort metadata, so a malformed object is dropped rather than failing the
 * submission the visitor actually cares about.
 */
export function parseTracking(value: unknown): LeadTrackingPayload | undefined {
  if (value === undefined || value === null) return undefined

  const result = leadTrackingSchema.safeParse(value)
  return result.success ? result.data : undefined
}
