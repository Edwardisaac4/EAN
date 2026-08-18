// =============================================================================
// /api/graphql — Admin lead query & mutation endpoint
// =============================================================================
// Backed by Supabase via leads-service. This is a hand-rolled resolver that
// matches on operation name rather than a full GraphQL engine — the admin
// client in lib/graphql-client.ts is the only consumer and sends a fixed set
// of documents.
//
// Access is gated by middleware.ts (admin session required) because every
// response here contains lead PII.

import { NextResponse } from 'next/server'
import {
  getLeadAnalytics,
  getLeads,
  updateLead,
  addLeadNote,
  createLead,
  LEAD_NOT_FOUND,
} from '@/lib/services/leads-service'
import {
  optionalString,
  parseLeadService,
  parseTracking,
  requiredString,
} from '@/lib/services/lead-input'
import { mapLeadRowToUiLead, mapLeadRowsToUiLeads } from '@/lib/mappers/lead-mapper'
import { SERVICE_LABELS } from '@/lib/admin-leads-data';import type { ServiceCategory } from '@/lib/admin-leads-data'
import type {
  LeadPriorityEnum,
  LeadServiceEnum,
  LeadStatusEnum,
} from '@/types/database'

// Admin views page through the CRM table client-side; this is the ceiling on a
// single query. Surfaced in the response so the UI can warn when it is hit.
const MAX_LEADS_PER_QUERY = 500

interface GraphQLBody {
  query?: string
  variables?: Record<string, unknown>
}

function graphqlError(message: string, status = 400) {
  return NextResponse.json({ errors: [{ message }] }, { status })
}

/** Maps a service-layer failure to the right status and a human-readable message. */
function mutationError(error: string) {
  if (error === LEAD_NOT_FOUND) {
    return graphqlError(LEAD_NOT_FOUND, 404)
  }
  console.error('Lead mutation failed:', error)
  return graphqlError('Could not save the change. Please try again.', 500)
}

/** Re-reads a single lead so mutations can return the fully joined record. */
async function fetchUiLeadById(id: string) {
  const { leads } = await getLeads({ page: 1, limit: 1, id })
  return leads.length > 0 ? mapLeadRowToUiLead(leads[0]) : null
}

export async function POST(request: Request) {
  try {
    let body: GraphQLBody
    try {
      body = (await request.json()) as GraphQLBody
    } catch {
      return graphqlError('Invalid JSON request body')
    }

    const { query, variables } = body

    if (!query) {
      return graphqlError('No GraphQL query provided')
    }

    const cleanQuery = query.replace(/\s+/g, ' ').trim()
    const vars = variables ?? {}

    const asFilter = <T extends string>(value: unknown): T | 'all' => {
      if (typeof value !== 'string' || value === '' || value === 'all') return 'all'
      return value.toLowerCase() as T
    }

    // ------------------------------------------------------------------------
    // QUERY: leadStats
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('query') && cleanQuery.includes('leadStats')) {
      // Aggregated in Postgres, so these figures cover every lead rather than the
      // first MAX_LEADS_PER_QUERY rows the table view happens to load.
      const { analytics: stats, error } = await getLeadAnalytics()

      if (error || !stats) {
        return graphqlError('Failed to fetch lead stats', 500)
      }

      const serviceDistribution = Object.entries(stats.serviceDistribution).map(
        ([category, count]) => ({
          category,
          label: SERVICE_LABELS[category as ServiceCategory] ?? category,
          count,
          percentage:
            stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0,
        })
      )

      return NextResponse.json({
        data: {
          leadStats: {
            totalLeads:             stats.totalLeads,
            newLeads:               stats.newLeads,
            inProgressLeads:        stats.inProgressLeads,
            qualifiedLeads:         stats.qualifiedLeads,
            closedWonLeads:         stats.closedWonLeads,
            avgResponseSlaMinutes:  stats.avgResponseSlaMinutes,
            conversionRate:         stats.conversionRate,
            totalEstimatedPipeline: stats.totalEstimatedPipeline,
            dailyInquiryRate:       stats.dailyInquiryRate,
            spamLeads:              stats.spamLeads,
            closedLostLeads:        stats.closedLostLeads,
            dailyTrend:             stats.dailyTrend,
            serviceDistribution,
            trackingDistribution:   stats.trackingDistribution,
          },
        },
      })
    }

    // ------------------------------------------------------------------------
    // QUERY: single lead by id
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('query') && cleanQuery.includes('lead(')) {
      const id = typeof vars.id === 'string' ? vars.id : null
      if (!id) return graphqlError('lead(id:) requires an id variable')

      return NextResponse.json({ data: { lead: await fetchUiLeadById(id) } })
    }

    // ------------------------------------------------------------------------
    // QUERY: leads (filtered + searched)
    // ------------------------------------------------------------------------
    if (
      cleanQuery.includes('query') &&
      (cleanQuery.includes('leads') || cleanQuery.includes('getLeads'))
    ) {
      const { leads, total, error } = await getLeads({
        search:   typeof vars.search === 'string' && vars.search ? vars.search : undefined,
        status:   asFilter<LeadStatusEnum>(vars.status),
        service:  asFilter<LeadServiceEnum>(vars.service),
        priority: asFilter<LeadPriorityEnum>(vars.priority),
        page:     1,
        limit:    MAX_LEADS_PER_QUERY,
      })

      if (error) {
        return graphqlError('Failed to fetch leads', 500)
      }

      return NextResponse.json({
        data: {
          leads: mapLeadRowsToUiLeads(leads),
          leadsTotal: total,
          leadsTruncated: total > leads.length,
        },
      })
    }

    // ------------------------------------------------------------------------
    // MUTATION: updateLeadStatus
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('mutation') && cleanQuery.includes('updateLeadStatus')) {
      const id = typeof vars.id === 'string' ? vars.id : null
      const status = typeof vars.status === 'string' ? vars.status.toLowerCase() : null
      if (!id || !status) return graphqlError('updateLeadStatus requires id and status')

      const { error } = await updateLead(id, {
        status: status as LeadStatusEnum,
        author: 'Admin Dashboard',
      })
      if (error) return mutationError(error)

      return NextResponse.json({ data: { updateLeadStatus: await fetchUiLeadById(id) } })
    }

    // ------------------------------------------------------------------------
    // MUTATION: updateLeadPriority
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('mutation') && cleanQuery.includes('updateLeadPriority')) {
      const id = typeof vars.id === 'string' ? vars.id : null
      const priority = typeof vars.priority === 'string' ? vars.priority.toLowerCase() : null
      if (!id || !priority) return graphqlError('updateLeadPriority requires id and priority')

      const { error } = await updateLead(id, {
        priority: priority as LeadPriorityEnum,
        author: 'Admin Dashboard',
      })
      if (error) return mutationError(error)

      return NextResponse.json({ data: { updateLeadPriority: await fetchUiLeadById(id) } })
    }

    // ------------------------------------------------------------------------
    // MUTATION: assignLead
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('mutation') && cleanQuery.includes('assignLead')) {
      const id = typeof vars.id === 'string' ? vars.id : null
      const staffName = typeof vars.staffName === 'string' ? vars.staffName : null
      if (!id || !staffName) return graphqlError('assignLead requires id and staffName')

      const { error } = await updateLead(id, {
        assigned_to: staffName,
        author: 'Admin Dashboard',
      })
      if (error) return mutationError(error)

      return NextResponse.json({ data: { assignLead: await fetchUiLeadById(id) } })
    }

    // ------------------------------------------------------------------------
    // MUTATION: addLeadNote
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('mutation') && cleanQuery.includes('addLeadNote')) {
      const id = typeof vars.id === 'string' ? vars.id : null
      const note = typeof vars.note === 'string' ? vars.note.trim() : null
      if (!id || !note) return graphqlError('addLeadNote requires id and a non-empty note')

      const { error } = await addLeadNote(id, note, 'Admin Dashboard')
      if (error) return mutationError(error)

      return NextResponse.json({ data: { addLeadNote: await fetchUiLeadById(id) } })
    }

    // ------------------------------------------------------------------------
    // MUTATION: createLead — manual entry logged by an admin
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('mutation') && cleanQuery.includes('createLead')) {
      const input = (vars.input ?? {}) as Record<string, unknown>
      const fullName = requiredString(input.fullName) ?? requiredString(input.name)
      const email = requiredString(input.email)

      if (!fullName || !email) {
        return graphqlError('createLead requires fullName and email')
      }

      const service = parseLeadService(input.service)

      if (!service) {
        return graphqlError('createLead received an unknown service')
      }

      const { lead, error } = await createLead({
        fullName,
        email,
        phone:    optionalString(input.phone),
        company:  optionalString(input.company),
        service,
        message:  optionalString(input.message) ?? '',
        tracking: parseTracking(input.tracking),
        estimatedValue:
          typeof input.estimatedValue === 'number' ? input.estimatedValue : undefined,
      })

      if (error) return mutationError(error)

      return NextResponse.json({ data: { createLead: await fetchUiLeadById(lead.id) } })
    }

    return graphqlError(`Unsupported GraphQL operation`, 400)
  } catch (error) {
    console.error('GraphQL API Error:', error)
    return graphqlError('Internal GraphQL processing error', 500)
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'EAN Aviation admin lead API endpoint',
    schema: {
      queries: ['leads(search, status, service, priority)', 'lead(id)', 'leadStats'],
      mutations: [
        'updateLeadStatus(id, status)',
        'updateLeadPriority(id, priority)',
        'assignLead(id, staffName)',
        'addLeadNote(id, note)',
        'createLead(input)',
      ],
    },
    documentation: 'Send POST requests with { query, variables } payload.',
  })
}
