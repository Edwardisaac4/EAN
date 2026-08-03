import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { buildQuote } from '@/lib/pricing/calculations'
import { QuoteState } from '@/types/pricing'
import { createClient } from '@/utils/supabase/server'

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
  lead: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional().default(''),
    company: z.string().optional().default(''),
  }).optional(),
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

    const { state, lead } = parseResult.data
    const quote = buildQuote(state as unknown as QuoteState)

    // Save lead/quote into Supabase if lead info provided
    let savedToDb = false
    if (lead?.email) {
      try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        if (supabase) {
          const { error } = await supabase.from('enquiries').insert({
            full_name: lead.name,
            email: lead.email,
            phone: lead.phone || '',
            company: lead.company || '',
            source: 'pricing_portal',
            service_type: 'fbo-ground-support',
            message: `Estimated Quote: ${quote.totalDisplay} | Aircraft: ${state.aircraft?.name || 'Manual MTOW'} (${quote.bandLabel}) | Location: ${state.location} | Pax: ${state.pax}`,
          })
          if (error) {
            console.warn('Could not store lead in Supabase:', { code: error.code, message: error.message })
          } else {
            savedToDb = true
          }
        }
      } catch (dbErr: any) {
        console.warn('Supabase DB exception during quote lead insert:', {
          code: dbErr?.code || 'UNKNOWN',
          message: dbErr?.message || String(dbErr)
        })
      }
    }

    return NextResponse.json({
      success: true,
      quote,
      savedToDb,
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
