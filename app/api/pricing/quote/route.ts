import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { buildQuote } from '@/lib/pricing/calculations'
import { QuoteState } from '@/types/pricing'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { state, lead } = body as { state: QuoteState; lead?: { name: string; email: string; phone: string; company: string } }

    if (!state) {
      return NextResponse.json(
        { success: false, error: 'Quote state is required' },
        { status: 400 }
      )
    }

    const quote = buildQuote(state)

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
            phone: lead.phone,
            company: lead.company,
            source: 'pricing_portal',
            service_type: 'fbo-ground-support',
            message: `Estimated Quote: ${quote.totalDisplay} | Aircraft: ${state.aircraft?.name || 'Manual MTOW'} (${quote.bandLabel}) | Location: ${state.location} | Pax: ${state.pax}`,
          })
          if (!error) savedToDb = true
        }
      } catch (dbErr) {
        console.warn('Could not store lead in Supabase:', dbErr)
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
