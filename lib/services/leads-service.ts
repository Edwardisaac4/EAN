// =============================================================================
// Leads Service — All lead CRUD operations via Supabase
// SERVER ONLY — this module uses the admin client (service_role)
// =============================================================================

import { adminSupabase } from '@/utils/supabase/admin'
import type {
  LeadRow,
  LeadWithDetails,
  LeadTrackingRow,
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

// ---------------------------------------------------------------------------
// Helper: auto-assign priority based on service + message keywords
// ---------------------------------------------------------------------------

function derivePriority(service: string, message: string): LeadPriorityEnum {
  const lowerMsg = message.toLowerCase()

  if (
    lowerMsg.includes('urgent') ||
    lowerMsg.includes('asap') ||
    lowerMsg.includes('immediately') ||
    lowerMsg.includes('tarmac') ||
    service === 'fbo'
  ) {
    return 'urgent'
  }

  if (service === 'charter' || service === 'maintenance') {
    return 'high'
  }

  return 'normal'
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
// CREATE LEAD — atomic insert of lead + tracking + activity
// =============================================================================

export async function createLead(
  payload: LeadSubmissionPayload,
  ipAddress?: string
): Promise<{ lead: LeadRow; error: string | null }> {
  const service = (payload.service || 'general') as LeadServiceEnum
  const priority = derivePriority(service, payload.message)
  const source = deriveSource(payload.tracking)
  const estimatedValue = estimateValue(service)

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
  page?:     number
  limit?:    number
}

export async function getLeads(options: GetLeadsOptions = {}) {
  const {
    status = 'all',
    service = 'all',
    priority = 'all',
    search,
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
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,lead_code.ilike.%${search}%`
    )
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
    .single()

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

  if (currentLead) {
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
