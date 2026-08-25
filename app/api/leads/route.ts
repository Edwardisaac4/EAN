// =============================================================================
// /api/leads — Public lead submission + Admin lead listing
// Connected to Supabase via leads-service
// =============================================================================

import { NextResponse } from 'next/server'
import { createLead, getLeads, findRecentDuplicateLead } from '@/lib/services/leads-service'
import {
  optionalString,
  parseLeadService,
  parseTracking,
  requiredString,
} from '@/lib/services/lead-input'
import { sendNewLeadAlert } from '@/lib/services/lead-notifications'
import {
  consumeRateLimit,
  clientIpFrom,
  leadKey,
  LEAD_MAX_SUBMISSIONS,
  LEAD_WINDOW_SECONDS,
} from '@/lib/rate-limiter'
import { dbError, badRequest } from '@/lib/supabase/helpers'
import { adminGuard } from '@/lib/api-auth'
import type { LeadSubmissionPayload, LeadServiceEnum, LeadStatusEnum, LeadPriorityEnum } from '@/types/database'

/** Ceiling on a single page of leads, so one request cannot pull the table. */
const MAX_PAGE_SIZE = 200

function clampInteger(
  raw: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.trunc(parsed), min), max)
}

// ---------------------------------------------------------------------------
// GET /api/leads — fetch leads (admin, paginated, filterable)
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  try {
    // Lead rows are PII. proxy.ts gates this prefix too; the check is repeated
    // here so the route is not left open by a matcher change or a proxy bypass.
    const denied = await adminGuard()
    if (denied) return denied

    const { searchParams } = new URL(request.url)

    const status   = searchParams.get('status') as LeadStatusEnum | 'all' | null
    const service  = searchParams.get('service') as LeadServiceEnum | 'all' | null
    const priority = searchParams.get('priority') as LeadPriorityEnum | 'all' | null
    const search   = searchParams.get('q') || searchParams.get('search') || undefined
    // Clamped: `?limit=1e9` reached the query builder as a range of that size,
    // and a non-numeric value produced NaN offsets.
    const page     = clampInteger(searchParams.get('page'), 1, 1, Number.MAX_SAFE_INTEGER)
    const limit    = clampInteger(searchParams.get('limit'), 20, 1, MAX_PAGE_SIZE)

    const { leads, total, error } = await getLeads({
      status:   status || 'all',
      service:  service || 'all',
      priority: priority || 'all',
      search,
      page,
      limit,
    })

    if (error) {
      return dbError('Failed to fetch leads')
    }

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      leads,
    })
  } catch (err) {
    console.error('GET /api/leads error:', err)
    return dbError('Internal server error fetching leads')
  }
}

// ---------------------------------------------------------------------------
// POST /api/leads — public contact form submission
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    // This is the only unauthenticated write path on the site (middleware.ts
    // exempts it deliberately) and every accepted submission sends an email, so
    // it is throttled before any parsing or database work happens.
    const clientIp = clientIpFrom(request)
    const rateCheck = await consumeRateLimit(
      leadKey(clientIp),
      LEAD_MAX_SUBMISSIONS,
      LEAD_WINDOW_SECONDS
    )

    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Too many enquiries submitted from this connection. Please try again shortly, or call our operations desk directly.',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSeconds ?? 3600) },
        }
      )
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON request body')
    }

    const {
      fullName,
      name,
      email,
      phone,
      company,
      service,
      message,
      estimatedValue,
      tracking,
      website,
    } = body as Record<string, unknown>

    // Honeypot. `website` is rendered as a visually hidden, aria-hidden,
    // autocomplete-off input that no sighted or screen-reader user is offered.
    // Bots that blindly fill every field in the DOM populate it; humans cannot.
    // Answered with the normal success shape so the bot has no signal to adapt to.
    if (typeof website === 'string' && website.trim() !== '') {
      console.warn('[leads] honeypot triggered, discarding submission')
      return NextResponse.json(
        {
          success: true,
          message: 'Your inquiry has been received. Our team will contact you shortly.',
        },
        { status: 201 }
      )
    }

    // This endpoint is public and unauthenticated, so every field is validated
    // as a string here rather than cast — a number or object reaching the insert
    // would either corrupt the row or fail with a raw Postgres error.
    const leadName = requiredString(fullName) ?? requiredString(name)
    const emailInput = requiredString(email)
    const messageValue = requiredString(message)

    if (!leadName || !emailInput || !messageValue) {
      return badRequest('Missing required fields: name, email, and message are required')
    }

    const emailValue = emailInput.toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue)) {
      return badRequest('Please provide a valid email address')
    }

    const serviceValue = parseLeadService(service)

    if (!serviceValue) {
      return badRequest('Unknown service. Please select one of the listed services.')
    }

    // Collapse accidental re-submissions (page refresh, double-click) instead of
    // creating duplicate pipeline records.
    const duplicate = await findRecentDuplicateLead(emailValue, serviceValue)

    if (duplicate) {
      return NextResponse.json(
        {
          success: true,
          duplicate: true,
          message: 'Your inquiry has already been received. Our team will contact you shortly.',
          lead: {
            id: duplicate.id,
            lead_code: duplicate.lead_code,
            status: duplicate.status,
          },
        },
        { status: 200 }
      )
    }

    const payload: LeadSubmissionPayload = {
      fullName: leadName,
      email: emailValue,
      phone: optionalString(phone),
      company: optionalString(company),
      service: serviceValue,
      message: messageValue,
      estimatedValue:
        typeof estimatedValue === 'number' && Number.isFinite(estimatedValue)
          ? estimatedValue
          : undefined,
      tracking: parseTracking(tracking),
    }

    // clientIpFrom collapses unidentifiable callers to the string 'unknown' so
    // they still share a rate-limit bucket, but that is not an address — store
    // NULL rather than writing the sentinel into the tracking record.
    const { lead, error } = await createLead(
      payload,
      clientIp === 'unknown' ? undefined : clientIp
    )

    if (error) {
      console.error('Failed to create lead:', error)
      return dbError('Failed to submit inquiry. Please try again.')
    }

    // Fire-and-forget email alert (non-blocking)
    sendNewLeadAlert(lead).catch((err) =>
      console.error('Lead email alert failed:', err)
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been received. Our team will contact you shortly.',
        lead: {
          id: lead.id,
          lead_code: lead.lead_code,
          status: lead.status,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/leads error:', err)
    return dbError('Internal server error submitting lead')
  }
}
