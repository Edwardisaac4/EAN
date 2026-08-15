import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { buildQuote } from '@/lib/pricing/calculations'
import { QuoteState } from '@/types/pricing'
import {
  addLeadNote,
  createLead,
  findRecentDuplicateLead,
  updateLead,
} from '@/lib/services/leads-service'
import { leadTrackingSchema } from '@/lib/services/lead-input'

// Simple IP rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string, limit = 20, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (record.count >= limit) {
    return true
  }

  record.count += 1
  return false
}

/**
 * Contact details. The sections calculator posts this as `contact` and the
 * pricing portal as `lead`, so both keys reuse one schema — they must stay
 * identical or the two calculators would validate differently.
 */
const leadContactSchema = z
  .object({
    // Accept either `name` or `fullName` so both calculator implementations work.
    name: z.string().min(1).optional(),
    fullName: z.string().min(1).optional(),
    email: z.string().email(),
    phone: z.string().optional().default(''),
    company: z.string().optional().default(''),
  })
  .refine((value) => Boolean(value.name || value.fullName), {
    message: 'Either name or fullName is required',
  })

const quoteRequestSchema = z.object({
  state: z.object({
    location: z.enum(['LOS', 'ABV']),
    operation: z.enum(['dom', 'intl']),
    stay: z.enum(['same', 'over']),
    nights: z.number().min(0),
    pax: z.number().min(0),
    day: z.enum(['wd', 'we']),
    handling: z.enum(['min', 'standard']),
    mode: z.enum(['client', 'staff']),
    aircraft: z.any().optional().nullable(),
    mtow_manual: z.number().optional().nullable(),
    addons: z.record(z.string(), z.boolean()).optional(),
    revealed: z.boolean().optional(),
  }),
  lead: leadContactSchema.optional(),
  /** Alias accepted for the same lead object. */
  contact: leadContactSchema.optional(),
  tracking: leadTrackingSchema.optional(),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded. Please wait before submitting again.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parseResult = quoteRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request payload', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { state, tracking } = parseResult.data
    // `contact` is the field name used by the sections calculator, `lead` by the portal.
    const lead = parseResult.data.lead ?? parseResult.data.contact
    const quote = buildQuote(state as unknown as QuoteState)

    // Persist the lead through the same service the rest of the site uses, so it
    // lands in the `leads` table the admin CRM reads. This previously wrote to a
    // non-existent `enquiries` table and swallowed the failure, silently losing
    // every lead captured here.
    let savedToDb = false
    let leadCode: string | null = null
    let saveError: string | null = null

    const leadName = lead ? lead.fullName ?? lead.name : undefined

    if (lead?.email && leadName) {
      const aircraftLabel = state.aircraft?.name || 'Unlisted aircraft (manual MTOW)'
      const locationLabel = state.location === 'LOS' ? 'Lagos MMIA' : 'Abuja NAIA'
      const operationLabel = state.operation === 'intl' ? 'International' : 'Domestic'

      const message = `Pricing Portal Quote Request:
- Aircraft: ${aircraftLabel} (${quote.bandLabel})
- Airport: ${locationLabel} | Operation: ${operationLabel}
- Passengers: ${state.pax} pax | Stay: ${state.stay === 'over' ? `${state.nights} night(s)` : 'Same-day turnaround'}
- Estimated Total: ${quote.totalDisplay}`

      const email = lead.email.trim().toLowerCase()
      const duplicate = await findRecentDuplicateLead(email, 'fbo')

      if (duplicate) {
        savedToDb = true
        leadCode = duplicate.lead_code

        // A repeat submission inside the duplicate window is normally a revised
        // quote — different aircraft, nights, or pax. Record it on the existing
        // lead so sales sees the latest request instead of only the first one.
        // An identical message means a double-click, which needs no second entry.
        if (message !== duplicate.message) {
          const { error: noteError } = await addLeadNote(
            duplicate.id,
            `Revised quote request:\n${message}`,
            'System (Pricing Portal)'
          )

          if (noteError) {
            console.error('Could not log revised quote on existing lead:', noteError)
          }
        }

        // Pipeline value tracks the largest quote this visitor asked for.
        const previousValue = Number(duplicate.estimated_value) || 0
        const revisedValue = Math.round(quote.usdTotal)

        if (Number.isFinite(revisedValue) && revisedValue > previousValue) {
          const { error: valueError } = await updateLead(duplicate.id, {
            estimated_value: revisedValue,
            author: 'System (Pricing Portal)',
          })

          if (valueError) {
            console.error('Could not update estimated value on existing lead:', valueError)
          }
        }
      } else {
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        const { lead: created, error } = await createLead(
          {
            fullName: leadName,
            email,
            phone: lead.phone || undefined,
            company: lead.company || undefined,
            service: 'fbo',
            message,
            estimatedValue: quote.usdTotal,
            tracking,
          },
          clientIp
        )

        if (error) {
          console.error('Could not store pricing quote lead:', error)
          saveError = 'Your quote was calculated but we could not save your details.'
        } else {
          savedToDb = true
          leadCode = created.lead_code
        }
      }
    }

    return NextResponse.json({
      success: true,
      quote,
      savedToDb,
      leadCode,
      ...(saveError ? { warning: saveError } : {}),
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error processing quote API route:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process quote' },
      { status: 500 }
    )
  }
}
