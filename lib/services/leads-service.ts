// =============================================================================
// Leads Service — All lead CRUD operations via Supabase
// SERVER ONLY — this module uses the admin client (service_role)
// =============================================================================

import { adminSupabase } from '@/utils/supabase/admin'
import type {
  LeadRow,
  LeadWithDetails,
  LeadActivityRow,
  LeadNoteRow,
  NewLead,
  NewLeadTracking,
  NewLeadActivity,
  NewLeadNote,
  LeadUpdate,
  LeadSubmissionPayload,
  LeadServiceEnum,
  LeadPriorityEnum,
  LeadStatusEnum,
} from '@/types/database'

/** Sentinel error message callers can map to a 404. */
export const LEAD_NOT_FOUND = 'Lead not found'

// ---------------------------------------------------------------------------
// Helper: auto-assign priority based on service + message keywords
// ---------------------------------------------------------------------------

/**
 * Urgency is driven by intent expressed in the message, not by service type —
 * keying `urgent` off `service === 'fbo'` made every FBO/pricing-portal lead
 * urgent, which drained the flag of meaning. Service type only sets the
 * baseline, and time-critical language escalates it.
 */
const URGENT_INTENT_KEYWORDS = [
  'urgent',
  'aog',
  'asap',
  'today',
  'tonight',
  'tomorrow',
  'immediately',
  'emergency',
] as const

const SERVICE_BASELINE_PRIORITY: Record<string, LeadPriorityEnum> = {
  maintenance: 'high',   // AOG risk, high value
  leasing:     'high',   // largest contract value
  charter:     'high',
  fbo:         'normal',
  vip:         'normal',
  catering:    'normal',
  general:     'low',
}

function derivePriority(service: string, message: string): LeadPriorityEnum {
  const text = (message || '').toLowerCase()

  if (URGENT_INTENT_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return 'urgent'
  }

  const baseline = SERVICE_BASELINE_PRIORITY[service] ?? 'low'

  // A concrete quote/booking request nudges the baseline up one step.
  if (baseline === 'normal' && (text.includes('quote') || text.includes('booking'))) {
    return 'high'
  }

  return baseline
}

// ---------------------------------------------------------------------------
// Helper: estimate deal value based on service type
// ---------------------------------------------------------------------------

function estimateValue(service: string): number {
  const estimates: Record<string, number> = {
    fbo: 15000,
    maintenance: 35000,
    charter: 20000,
    catering: 5000,
    vip: 8000,
    leasing: 50000,
    general: 3000,
  }
  return estimates[service] ?? 3000
}

// ---------------------------------------------------------------------------
// Helper: derive human-readable source from tracking context
// ---------------------------------------------------------------------------

function deriveSource(tracking?: LeadSubmissionPayload['tracking']): string {
  if (!tracking) return 'Website Form'

  if (tracking.utmSource) {
    const src = tracking.utmSource.toLowerCase()
    if (src.includes('google'))
      return tracking.utmMedium === 'cpc' ? 'Google Ads' : 'Google Organic'
    if (src.includes('linkedin')) return 'LinkedIn Campaign'
    if (src.includes('facebook') || src.includes('instagram'))
      return 'Social Media'
    if (src.includes('newsletter') || src.includes('email'))
      return 'Email Marketing'
    if (src.includes('tiktok')) return 'TikTok'
    if (src.includes('whatsapp')) return 'WhatsApp'
    return `${tracking.utmSource} (${tracking.utmMedium || 'campaign'})`
  }

  if (
    tracking.referrerDomain &&
    tracking.referrerDomain !== 'Direct / None' &&
    tracking.referrerDomain !== 'Direct / Internal'
  ) {
    return `Referral (${tracking.referrerDomain})`
  }

  return 'Direct Visit'
}

// =============================================================================
// DUPLICATE GUARD — collapse accidental re-submissions
// =============================================================================

/** Window in which an identical email+service submission is treated as a repeat. */
const DUPLICATE_WINDOW_MINUTES = 10

/**
 * Finds a lead this person already submitted for the same service moments ago.
 *
 * Refreshing a gated pricing page or double-clicking submit would otherwise
 * create several identical records and inflate the pipeline count.
 */
export async function findRecentDuplicateLead(
  email: string,
  service: LeadServiceEnum
): Promise<LeadRow | null> {
  const cutoff = new Date(
    Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000
  ).toISOString()

  const { data, error } = await adminSupabase
    .from('leads')
    .select('*')
    .eq('email', email)
    .eq('service', service)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    // Non-fatal: fall through to creating the lead rather than losing it.
    console.error('Duplicate lead lookup failed:', error)
    return null
  }

  return data && data.length > 0 ? data[0] : null
}

// =============================================================================
// CREATE LEAD — atomic insert of lead + tracking + activity
// =============================================================================

export async function createLead(
  payload: LeadSubmissionPayload,
  ipAddress?: string
): Promise<{ lead: LeadRow; error: string | null }> {
  const service = (payload.service || 'general') as LeadServiceEnum
  const priority = payload.priority ?? derivePriority(service, payload.message)
  const source = deriveSource(payload.tracking)

  // Prefer a real figure computed by the submitting form (e.g. the pricing
  // portal quote total) over the coarse per-service estimate.
  const estimatedValue =
    typeof payload.estimatedValue === 'number' && payload.estimatedValue > 0
      ? Math.round(payload.estimatedValue)
      : estimateValue(service)

  // 1. Insert the lead
  const { data: lead, error: leadError } = await adminSupabase
    .from('leads')
    .insert({
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone || '',
      company: payload.company || null,
      service,
      message: payload.message,
      status: 'new',
      priority,
      estimated_value: estimatedValue,
      source,
    } satisfies NewLead)
    .select('*')
    .single()

  if (leadError || !lead) {
    console.error('Failed to insert lead:', leadError)
    return { lead: null as unknown as LeadRow, error: leadError?.message || 'Failed to insert lead' }
  }

  // 2. Insert tracking attribution (if provided)
  if (payload.tracking) {
    const t = payload.tracking
    const { error: trackingError } = await adminSupabase
      .from('lead_tracking')
      .insert({
        lead_id: lead.id,
        utm_source: t.utmSource || null,
        utm_medium: t.utmMedium || null,
        utm_campaign: t.utmCampaign || null,
        utm_content: t.utmContent || null,
        utm_term: t.utmTerm || null,
        referrer_url: t.referrerUrl || null,
        referrer_domain: t.referrerDomain || null,
        landing_page: t.landingPage || null,
        form_page: t.formPage || null,
        form_id: t.formId || null,
        device_type: t.deviceType || 'desktop',
        browser_name: t.browserName || null,
        user_language: t.userLanguage || null,
        screen_resolution: t.screenResolution || null,
        ip_address: ipAddress || null,
        captured_at: t.capturedAt || new Date().toISOString(),
      } satisfies NewLeadTracking)

    if (trackingError) {
      console.error('Failed to insert tracking:', trackingError)
      // Non-fatal — lead was already created
    }
  }

  // 3. Insert initial activity log
  const { error: activityError } = await adminSupabase
    .from('lead_activities')
    .insert({
      lead_id: lead.id,
      author: 'System (Form Engine)',
      action: `Lead captured via ${payload.tracking?.formPage || 'Website Form'}`,
    } satisfies NewLeadActivity)

  if (activityError) {
    console.error('Failed to insert activity:', activityError)
  }

  return { lead, error: null }
}

// =============================================================================
// GET LEADS — paginated, filterable list
// =============================================================================

export interface GetLeadsOptions {
  status?:   LeadStatusEnum | 'all'
  service?:  LeadServiceEnum | 'all'
  priority?: LeadPriorityEnum | 'all'
  search?:   string
  /** Restrict to a single lead by uuid — used to re-read a record after a mutation. */
  id?:       string
  page?:     number
  limit?:    number
}

export async function getLeads(options: GetLeadsOptions = {}) {
  const {
    status = 'all',
    service = 'all',
    priority = 'all',
    search,
    id,
    page = 1,
    limit = 20,
  } = options

  let query = adminSupabase
    .from('leads')
    .select(
      `
      *,
      lead_tracking (*),
      lead_activities (*, id, lead_id, author, action, note, created_at),
      lead_notes (*, id, lead_id, author, content, created_at)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (id) {
    query = query.eq('id', id)
  }
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (service && service !== 'all') {
    query = query.eq('service', service)
  }
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority)
  }
  if (search) {
    // Escape PostgREST `or()` metacharacters so a search term containing a comma
    // or parenthesis cannot break out of the filter expression.
    const safeSearch = search.replace(/[,()\\]/g, ' ').trim()
    if (safeSearch) {
      query = query.or(
        `full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,company.ilike.%${safeSearch}%,lead_code.ilike.%${safeSearch}%`
      )
    }
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Failed to fetch leads:', error)
    return { leads: [], total: 0, error: error.message }
  }

  // Normalize the join shape
  const leads: LeadWithDetails[] = (data || []).map((row) => ({
    ...row,
    lead_tracking: Array.isArray(row.lead_tracking)
      ? row.lead_tracking[0] || null
      : row.lead_tracking || null,
    lead_activities: Array.isArray(row.lead_activities)
      ? row.lead_activities.sort(
          (a: LeadActivityRow, b: LeadActivityRow) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : [],
    lead_notes: Array.isArray(row.lead_notes)
      ? row.lead_notes.sort(
          (a: LeadNoteRow, b: LeadNoteRow) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : [],
  }))

  return { leads, total: count ?? 0, error: null }
}

// =============================================================================
// GET LEAD BY ID — single lead with all related data
// =============================================================================

export async function getLeadById(id: string): Promise<{
  lead: LeadWithDetails | null
  error: string | null
}> {
  const { data, error } = await adminSupabase
    .from('leads')
    .select(
      `
      *,
      lead_tracking (*),
      lead_activities (*, id, lead_id, author, action, note, created_at),
      lead_notes (*, id, lead_id, author, content, created_at)
    `
    )
    .eq('id', id)
    .single()

  if (error || !data) {
    return { lead: null, error: error?.message || 'Lead not found' }
  }

  const lead: LeadWithDetails = {
    ...data,
    lead_tracking: Array.isArray(data.lead_tracking)
      ? data.lead_tracking[0] || null
      : data.lead_tracking || null,
    lead_activities: Array.isArray(data.lead_activities)
      ? data.lead_activities.sort(
          (a: LeadActivityRow, b: LeadActivityRow) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : [],
    lead_notes: Array.isArray(data.lead_notes)
      ? data.lead_notes.sort(
          (a: LeadNoteRow, b: LeadNoteRow) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : [],
  }

  return { lead, error: null }
}

// =============================================================================
// GET LEAD BY LEAD_CODE — e.g. EAN-LD-2026-001
// =============================================================================

export async function getLeadByCode(leadCode: string): Promise<{
  lead: LeadWithDetails | null
  error: string | null
}> {
  const { data, error } = await adminSupabase
    .from('leads')
    .select(
      `
      *,
      lead_tracking (*),
      lead_activities (*),
      lead_notes (*)
    `
    )
    .eq('lead_code', leadCode)
    .single()

  if (error || !data) {
    return { lead: null, error: error?.message || 'Lead not found' }
  }

  const lead: LeadWithDetails = {
    ...data,
    lead_tracking: Array.isArray(data.lead_tracking)
      ? data.lead_tracking[0] || null
      : data.lead_tracking || null,
    lead_activities: Array.isArray(data.lead_activities)
      ? data.lead_activities.sort(
          (a: LeadActivityRow, b: LeadActivityRow) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : [],
    lead_notes: Array.isArray(data.lead_notes)
      ? data.lead_notes.sort(
          (a: LeadNoteRow, b: LeadNoteRow) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : [],
  }

  return { lead, error: null }
}

// =============================================================================
// UPDATE LEAD — status, priority, assignment changes with audit trail
// =============================================================================

export async function updateLead(
  id: string,
  updates: LeadUpdate & { author?: string }
): Promise<{ lead: LeadRow | null; error: string | null }> {
  const { author, ...dbUpdates } = updates

  // Fetch current lead to compute delta for activity log
  const { data: currentLead } = await adminSupabase
    .from('leads')
    .select('status, priority, assigned_to')
    .eq('id', id)
    .maybeSingle()

  // Bail out with a clear message rather than letting the update below fail with
  // a raw Postgres coercion error that would surface in the admin UI.
  if (!currentLead) {
    return { lead: null, error: LEAD_NOT_FOUND }
  }

  // Apply the update
  const { data: updatedLead, error } = await adminSupabase
    .from('leads')
    .update(dbUpdates)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !updatedLead) {
    return { lead: null, error: error?.message || 'Failed to update lead' }
  }

  // Log activity entries for each changed field
  const activities: NewLeadActivity[] = []
  const actorName = author || 'Lead Admin'

  {
    if (dbUpdates.status && dbUpdates.status !== currentLead.status) {
      activities.push({
        lead_id: id,
        author: actorName,
        action: `Status updated from ${currentLead.status} to ${dbUpdates.status}`,
      })
    }
    if (dbUpdates.priority && dbUpdates.priority !== currentLead.priority) {
      activities.push({
        lead_id: id,
        author: actorName,
        action: `Priority updated from ${currentLead.priority} to ${dbUpdates.priority}`,
      })
    }
    if (dbUpdates.assigned_to !== undefined && dbUpdates.assigned_to !== currentLead.assigned_to) {
      activities.push({
        lead_id: id,
        author: actorName,
        action: dbUpdates.assigned_to
          ? `Lead assigned to ${dbUpdates.assigned_to}`
          : 'Lead unassigned',
      })
    }
  }

  if (activities.length > 0) {
    const { error: actErr } = await adminSupabase
      .from('lead_activities')
      .insert(activities)

    if (actErr) console.error('Failed to log activities:', actErr)
  }

  return { lead: updatedLead, error: null }
}

// =============================================================================
// ADD NOTE — insert internal rep note with activity log
// =============================================================================

export async function addLeadNote(
  leadId: string,
  content: string,
  author = 'Admin'
): Promise<{ note: LeadNoteRow | null; error: string | null }> {
  const { data: note, error } = await adminSupabase
    .from('lead_notes')
    .insert({ lead_id: leadId, author, content } satisfies NewLeadNote)
    .select('*')
    .single()

  if (error || !note) {
    // A foreign-key violation here means the lead id does not exist; report that
    // rather than the raw constraint message.
    if (error?.code === '23503') {
      return { note: null, error: LEAD_NOT_FOUND }
    }
    return { note: null, error: error?.message || 'Failed to add note' }
  }

  // Also log the activity
  await adminSupabase.from('lead_activities').insert({
    lead_id: leadId,
    author,
    action: 'Added internal note',
    note: content,
  } satisfies NewLeadActivity)

  return { note, error: null }
}

// =============================================================================
// LEAD STATS — dashboard aggregation
// =============================================================================

export interface LeadStats {
  totalLeads: number
  newLeads: number
  inProgressLeads: number
  qualifiedLeads: number
  closedWonLeads: number
  conversionRate: number
  totalEstimatedPipeline: number
}

export async function getLeadStats(): Promise<LeadStats> {
  const [totalRes, newRes, inProgressRes, qualifiedRes, closedWonRes] =
    await Promise.all([
      adminSupabase
        .from('leads')
        .select('*', { count: 'exact', head: true }),
      adminSupabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new'),
      adminSupabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('status', ['contacted', 'qualified', 'proposal_sent']),
      adminSupabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('status', ['qualified', 'proposal_sent']),
      adminSupabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'closed_won'),
    ])

  const total = totalRes.count ?? 0
  const newLeads = newRes.count ?? 0
  const inProgress = inProgressRes.count ?? 0
  const qualified = qualifiedRes.count ?? 0
  const closedWon = closedWonRes.count ?? 0

  // Pipeline value
  const { data: pipelineData } = await adminSupabase
    .from('leads')
    .select('estimated_value')
    .in('status', ['new', 'contacted', 'qualified', 'proposal_sent'])

  const totalEstimatedPipeline = (pipelineData || []).reduce(
    (sum, row) => sum + (Number(row.estimated_value) || 0),
    0
  )

  return {
    totalLeads: total,
    newLeads,
    inProgressLeads: inProgress,
    qualifiedLeads: qualified,
    closedWonLeads: closedWon,
    conversionRate: total > 0 ? Math.round((closedWon / total) * 100) : 0,
    totalEstimatedPipeline,
  }
}

// =============================================================================
// CSV EXPORT — returns leads as CSV string
// =============================================================================

export async function exportLeadsCSV(options: GetLeadsOptions = {}): Promise<string> {
  // Fetch all matching leads (no pagination)
  const { leads } = await getLeads({ ...options, page: 1, limit: 10000 })

  const headers = [
    'Lead Code',
    'Full Name',
    'Email',
    'Phone',
    'Company',
    'Service',
    'Status',
    'Priority',
    'Estimated Value',
    'Source',
    'Assigned To',
    'Landing Page',
    'Device',
    'Created At',
  ]

  const rows = leads.map((l) => [
    l.lead_code,
    `"${(l.full_name || '').replace(/"/g, '""')}"`,
    l.email,
    l.phone || '',
    `"${(l.company || '').replace(/"/g, '""')}"`,
    l.service,
    l.status,
    l.priority,
    l.estimated_value?.toString() || '0',
    `"${(l.source || '').replace(/"/g, '""')}"`,
    `"${(l.assigned_to || '').replace(/"/g, '""')}"`,
    l.lead_tracking?.landing_page || '',
    l.lead_tracking?.device_type || '',
    l.created_at,
  ])

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
