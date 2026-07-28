// =============================================================================
// Database Convenience Types
// Wraps auto-generated Supabase types into clean, importable aliases
// =============================================================================

import type { Database, LeadServiceEnum, LeadStatusEnum, LeadPriorityEnum } from './supabase'

// Re-export enum types
export type { LeadServiceEnum, LeadStatusEnum, LeadPriorityEnum }

// ---------------------------------------------------------------------------
// Table Row Types (what you GET from the database)
// ---------------------------------------------------------------------------

export type LeadRow          = Database['public']['Tables']['leads']['Row']
export type LeadTrackingRow  = Database['public']['Tables']['lead_tracking']['Row']
export type LeadActivityRow  = Database['public']['Tables']['lead_activities']['Row']
export type LeadNoteRow      = Database['public']['Tables']['lead_notes']['Row']

// ---------------------------------------------------------------------------
// Insert Types (what you SEND to create a new row)
// ---------------------------------------------------------------------------

export type NewLead          = Database['public']['Tables']['leads']['Insert']
export type NewLeadTracking  = Database['public']['Tables']['lead_tracking']['Insert']
export type NewLeadActivity  = Database['public']['Tables']['lead_activities']['Insert']
export type NewLeadNote      = Database['public']['Tables']['lead_notes']['Insert']

// ---------------------------------------------------------------------------
// Update Types (partial fields for PATCH operations)
// ---------------------------------------------------------------------------

export type LeadUpdate          = Database['public']['Tables']['leads']['Update']
export type LeadTrackingUpdate  = Database['public']['Tables']['lead_tracking']['Update']

// ---------------------------------------------------------------------------
// Composite Types — Lead with related data joined
// ---------------------------------------------------------------------------

export interface LeadWithDetails extends LeadRow {
  lead_tracking:   LeadTrackingRow | null
  lead_activities: LeadActivityRow[]
  lead_notes:      LeadNoteRow[]
}

// ---------------------------------------------------------------------------
// API Request / Response Shapes
// ---------------------------------------------------------------------------

/** Shape of the body when a public user submits a contact form */
export interface LeadSubmissionPayload {
  fullName:  string
  email:     string
  phone?:    string
  company?:  string
  service:   LeadServiceEnum | string
  message:   string
  tracking?: {
    utmSource?:        string | null
    utmMedium?:        string | null
    utmCampaign?:      string | null
    utmContent?:       string | null
    utmTerm?:          string | null
    referrerUrl?:      string | null
    referrerDomain?:   string | null
    landingPage?:      string | null
    formPage?:         string | null
    formId?:           string | null
    deviceType?:       string
    browserName?:      string
    userLanguage?:     string
    screenResolution?: string
    capturedAt?:       string
  }
}

/** Admin paginated leads list response */
export interface LeadsListResponse {
  success:  boolean
  total:    number
  page:     number
  limit:    number
  leads:    LeadWithDetails[]
}

/** Single lead detail response */
export interface LeadDetailResponse {
  success: boolean
  lead:    LeadWithDetails
}

// ---------------------------------------------------------------------------
// Human-Readable Labels
// ---------------------------------------------------------------------------

export const SERVICE_LABELS: Record<LeadServiceEnum, string> = {
  fbo:         'FBO & Ground Support',
  maintenance: 'Aircraft Maintenance (MRO)',
  charter:     'Aircraft Sales & Charter',
  catering:    'Wings™ VIP Catering',
  vip:         'VIP Lounge & Protocol',
  leasing:     'Leased Office Spaces',
  general:     'General Inquiry',
}

export const STATUS_LABELS: Record<LeadStatusEnum, string> = {
  new:           'New Lead',
  contacted:     'In Contact',
  qualified:     'Qualified',
  proposal_sent: 'Proposal Sent',
  closed_won:    'Closed (Won)',
  closed_lost:   'Closed (Lost)',
  spam:          'Spam',
}

export const PRIORITY_LABELS: Record<LeadPriorityEnum, string> = {
  urgent: 'Urgent (SLA < 1h)',
  high:   'High Priority',
  normal: 'Standard',
  low:    'Low',
}
