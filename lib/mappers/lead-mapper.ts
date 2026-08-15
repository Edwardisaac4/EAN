// =============================================================================
// Lead Mapper — Supabase row shape (snake_case) → admin UI shape (camelCase)
// =============================================================================
// The admin dashboard components were built against the `Lead` interface in
// lib/admin-leads-data.ts. Supabase returns snake_case columns plus separate
// joined tables for tracking, activities, and notes. This module is the single
// translation layer between the two so no component needs to know about the
// database shape.

import type { LeadWithDetails } from '@/types/database'
import type {
  Lead,
  LeadActivity,
  LeadPriority,
  LeadStatus,
  LeadTrackingData,
  ServiceCategory,
} from '@/lib/admin-leads-data'

// ---------------------------------------------------------------------------
// Tracking: lead_tracking row → LeadTrackingData
// ---------------------------------------------------------------------------

function mapTracking(
  row: LeadWithDetails['lead_tracking']
): LeadTrackingData | undefined {
  if (!row) return undefined

  const deviceType = row.device_type
  const isKnownDevice =
    deviceType === 'mobile' || deviceType === 'tablet' || deviceType === 'desktop'

  return {
    utmSource:        row.utm_source,
    utmMedium:        row.utm_medium,
    utmCampaign:      row.utm_campaign,
    utmContent:       row.utm_content,
    utmTerm:          row.utm_term,
    referrerUrl:      row.referrer_url,
    referrerDomain:   row.referrer_domain,
    landingPage:      row.landing_page ?? '/',
    formPage:         row.form_page ?? '/',
    formId:           row.form_id ?? 'unknown-form',
    deviceType:       isKnownDevice ? deviceType : 'desktop',
    browserName:      row.browser_name ?? 'Unknown',
    userLanguage:     row.user_language ?? undefined,
    screenResolution: row.screen_resolution ?? undefined,
    capturedAt:       row.captured_at,
  }
}

// ---------------------------------------------------------------------------
// Activities: lead_activities rows → LeadActivity[]
// ---------------------------------------------------------------------------

function mapActivities(rows: LeadWithDetails['lead_activities']): LeadActivity[] {
  return (rows ?? []).map((row) => ({
    id:        row.id,
    timestamp: row.created_at,
    author:    row.author,
    action:    row.action,
    note:      row.note ?? undefined,
  }))
}

// ---------------------------------------------------------------------------
// Full lead
// ---------------------------------------------------------------------------

/**
 * Maps a joined Supabase lead row onto the `Lead` shape the admin UI renders.
 *
 * `id` stays the database uuid because every mutation keys off it. The
 * human-readable `EAN-LD-YYYY-NNN` code is exposed separately as `leadCode`
 * for display.
 */
export function mapLeadRowToUiLead(row: LeadWithDetails): Lead {
  return {
    id:             row.id,
    leadCode:       row.lead_code,
    fullName:       row.full_name,
    email:          row.email,
    phone:          row.phone ?? '',
    company:        row.company ?? undefined,
    service:        row.service as ServiceCategory,
    message:        row.message,
    status:         row.status as LeadStatus,
    priority:       row.priority as LeadPriority,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
    source:         row.source ?? 'Website Form',
    assignedTo:     row.assigned_to ?? undefined,
    notes:          (row.lead_notes ?? []).map((note) => note.content),
    activities:     mapActivities(row.lead_activities),
    estimatedValue: Number(row.estimated_value ?? 0),
    tracking:       mapTracking(row.lead_tracking),
  }
}

export function mapLeadRowsToUiLeads(rows: LeadWithDetails[]): Lead[] {
  return rows.map(mapLeadRowToUiLead)
}
