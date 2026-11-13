// =============================================================================
// POST /api/sales-leasing — the Aircraft Sales & Leasing enquiry on /find-aircraft
// =============================================================================
// Its own route rather than another shape for /api/leads: the answers have to
// be checked against the visitor's path and scored before the lead is written,
// and the alert goes to the sales team's list, not the general one. It shares
// /api/leads' rate-limit bucket, honeypot and duplicate guard, so one visitor
// has one budget across every enquiry form on the site.
//
// Public on purpose: proxy.ts only guards /api/leads, /api/graphql, /api/admin
// and /api/analytics.

import { NextResponse, after } from 'next/server'
import { createLead, findRecentDuplicateLead } from '@/lib/services/leads-service'
import { parseTracking } from '@/lib/services/lead-input'
import {
  SALES_LEASING_LEAD_SERVICE,
  TEMPERATURE_PRIORITY,
  composeEnquiryMessage,
  parseSalesLeasingEnquiry,
} from '@/lib/services/sales-leasing-lead'
import { sendSalesLeasingAlert } from '@/lib/services/sales-leasing-notifications'
import {
  clientIpFrom,
  consumeRateLimit,
  leadKey,
  LEAD_MAX_SUBMISSIONS,
  LEAD_WINDOW_SECONDS,
} from '@/lib/rate-limiter'
import { badRequest, dbError } from '@/lib/supabase/helpers'
import { LAGOS_HQ } from '@/lib/constants'

const RECEIVED_MESSAGE = 'Your enquiry has been received. Our sales and leasing team will contact you directly.'
const CALL_US = `call us on ${LAGOS_HQ.phone}`

export async function POST(request: Request) {
  try {
    const clientIp = clientIpFrom(request)
    const rateCheck = await consumeRateLimit(leadKey(clientIp), LEAD_MAX_SUBMISSIONS, LEAD_WINDOW_SECONDS)

    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many enquiries have been sent from this connection. Please try again later, or ${CALL_US}.`,
        },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfterSeconds ?? 3600) } },
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON request body')
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return badRequest('Invalid request body')
    }
    const fields = body as Record<string, unknown>

    // Honeypot, as on /api/leads: a bot that fills it gets the normal success
    // shape, so it has nothing to adapt to.
    if (typeof fields.website === 'string' && fields.website.trim() !== '') {
      console.warn('[sales-leasing] honeypot triggered, discarding submission')
      return NextResponse.json({ success: true, message: RECEIVED_MESSAGE }, { status: 201 })
    }

    const parsed = parseSalesLeasingEnquiry(fields)
    if (!parsed.ok) {
      return badRequest(parsed.error)
    }

    const { enquiry } = parsed
    const message = composeEnquiryMessage(enquiry)
    const email = enquiry.contact.email.toLowerCase()

    // Only a word-for-word repeat is collapsed — a double-click, or a refresh
    // that resent the request. The guard looks up email + service, and this
    // service is shared with the charter form, so a charter request sent minutes
    // earlier must not swallow a sales enquiry; neither may a second, different
    // enquiry (a jet and a helicopter, say). The name, phone and company are not
    // in the message, so they are compared as well: a resend that corrects the
    // phone number is a new lead, not a repeat that throws the correction away.
    // Every field was cleaned the same way before it was stored, so a true
    // resend matches exactly.
    const duplicate = await findRecentDuplicateLead(email, SALES_LEASING_LEAD_SERVICE)
    if (
      duplicate &&
      duplicate.message === message &&
      duplicate.full_name === enquiry.contact.fullName &&
      duplicate.phone === enquiry.contact.phone &&
      (duplicate.company ?? '') === enquiry.contact.company
    ) {
      return NextResponse.json(
        { success: true, duplicate: true, message: RECEIVED_MESSAGE, leadCode: duplicate.lead_code },
        { status: 200 },
      )
    }

    const { lead, error } = await createLead(
      {
        fullName: enquiry.contact.fullName,
        email,
        phone: enquiry.contact.phone,
        company: enquiry.contact.company || undefined,
        service: SALES_LEASING_LEAD_SERVICE,
        message,
        // Set from the score, so derivePriority's keyword rules never run on
        // this message: a typed answer that happened to say "urgent" or "today"
        // would otherwise flag the lead with a one-hour SLA.
        priority: TEMPERATURE_PRIORITY[enquiry.score.temperature],
        tracking: parseTracking(fields.tracking),
      },
      clientIp === 'unknown' ? undefined : clientIp,
    )

    if (error) {
      console.error('Failed to create sales & leasing lead:', error)
      return dbError(`We could not save your enquiry. Please try again, or ${CALL_US}.`)
    }

    // Sent after the response, so the visitor's confirmation does not wait on
    // the email. `after` keeps the function running until the send finishes; a
    // bare unawaited promise does not, because a serverless host may freeze the
    // function as soon as the response is out. The lead is already saved if the
    // email fails.
    after(() =>
      sendSalesLeasingAlert(lead, enquiry).catch((err) =>
        console.error('Sales & leasing email alert failed:', err),
      ),
    )

    return NextResponse.json(
      { success: true, message: RECEIVED_MESSAGE, leadCode: lead.lead_code },
      { status: 201 },
    )
  } catch (err) {
    console.error('POST /api/sales-leasing error:', err)
    return dbError(`Something went wrong sending your enquiry. Please try again, or ${CALL_US}.`)
  }
}
