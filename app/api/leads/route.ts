// =============================================================================
// /api/leads — Public lead submission + Admin lead listing
// Connected to Supabase via leads-service
// =============================================================================

import { NextResponse } from 'next/server'
import { createLead, getLeads, findRecentDuplicateLead } from '@/lib/services/leads-service'
import { sendNewLeadAlert } from '@/lib/services/lead-notifications'
import { dbError, badRequest } from '@/lib/supabase/helpers'
import type { LeadSubmissionPayload, LeadServiceEnum, LeadStatusEnum, LeadPriorityEnum } from '@/types/database'

// ---------------------------------------------------------------------------
// GET /api/leads — fetch leads (admin, paginated, filterable)
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const status   = searchParams.get('status') as LeadStatusEnum | 'all' | null
    const service  = searchParams.get('service') as LeadServiceEnum | 'all' | null
    const priority = searchParams.get('priority') as LeadPriorityEnum | 'all' | null
    const search   = searchParams.get('q') || searchParams.get('search') || undefined
    const page     = Number(searchParams.get('page') ?? 1)
    const limit    = Number(searchParams.get('limit') ?? 20)

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
    } = body as Record<string, unknown>

    // Accept either fullName or name
    const leadName = (fullName || name) as string | undefined

    if (!leadName || !email || !message) {
      return badRequest('Missing required fields: name, email, and message are required')
    }

    const emailValue = String(email).trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue)) {
      return badRequest('Please provide a valid email address')
    }

    // Extract client IP for tracking
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined

    const serviceValue = ((service as string) || 'general') as LeadServiceEnum

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
      fullName: leadName as string,
      email: emailValue,
      phone: (phone as string) || undefined,
      company: (company as string) || undefined,
      service: serviceValue,
      message: message as string,
      estimatedValue:
        typeof estimatedValue === 'number' && Number.isFinite(estimatedValue)
          ? estimatedValue
          : undefined,
      tracking: tracking as LeadSubmissionPayload['tracking'],
    }

    const { lead, error } = await createLead(payload, clientIp)

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
