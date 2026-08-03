import { NextRequest, NextResponse } from 'next/server'
import type { Aircraft } from '@/types/pricing'
import { AIRCRAFT_DATASET } from '@/lib/aircraftData'

// Simple IP rate limiter: max 30 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string, limit = 30, windowMs = 60000): boolean {
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

interface ApiNinjasAircraft {
  manufacturer?: string
  model?: string
  gross_weight_lbs?: string | number | null
  max_gross_weight_lbs?: string | number | null
  max_takeoff_weight_lbs?: string | number | null
  empty_weight_lbs?: string | number | null
  wing_span_ft?: string | number | null
  wingspan_ft?: string | number | null
  range_nautical_miles?: string | number | null
  max_altitude_ft?: string | number | null
  ceiling_ft?: string | number | null
  cruise_speed_knots?: string | number | null
  engine_type?: string | null
}

async function fetchApiNinjas(q: string): Promise<ApiNinjasAircraft[]> {
  const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_AERODATABOX_KEY
  const apiNinjasKey = process.env.API_NINJAS_KEY

  const provider = rapidApiKey ? 'rapidapi' : apiNinjasKey ? 'apininjas' : null
  if (!provider) return []

  const urls = provider === 'rapidapi'
    ? [
        `https://aircraft-by-api-ninjas.p.rapidapi.com/v1/aircraft?model=${encodeURIComponent(q)}`,
        `https://aircraft-by-api-ninjas.p.rapidapi.com/v1/aircraft?manufacturer=${encodeURIComponent(q)}`
      ]
    : [
        `https://api.api-ninjas.com/v1/aircraft?model=${encodeURIComponent(q)}`,
        `https://api.api-ninjas.com/v1/aircraft?manufacturer=${encodeURIComponent(q)}`
      ]

  const headers: Record<string, string> = provider === 'rapidapi'
    ? {
        'x-rapidapi-key': rapidApiKey!,
        'x-rapidapi-host': 'aircraft-by-api-ninjas.p.rapidapi.com',
      }
    : {
        'X-Api-Key': apiNinjasKey!,
      }

  try {
    const responses = await Promise.all(
      urls.map(url => fetch(url, { headers, signal: AbortSignal.timeout(8000), next: { revalidate: 86400 } }))
    )

    const dataArrays = await Promise.all(
      responses.map(async r => {
        if (!r.ok) return []
        const json = await r.json()
        return Array.isArray(json) ? json : []
      })
    )

    return dataArrays.flat()
  } catch (err) {
    console.error('API Ninjas fetch error details:', err)
    return []
  }
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many search requests. Please wait a moment.' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')?.trim()

  try {
    // Return full dataset if query is empty or short
    if (!query || query.length < 2) {
      const curated: Aircraft[] = AIRCRAFT_DATASET.map(fa => ({
        id: fa.id,
        name: fa.name,
        manufacturer: fa.manufacturer,
        mtow_kg: fa.mtowKg,
        mtow_lbs: Math.round(fa.mtowKg / 0.453592),
        category: fa.category,
        range_nm: fa.rangeNm,
        pax_max: fa.maxPassengers,
        icao_code: fa.icao,
        source: 'database' as const,
      }))

      return NextResponse.json({ success: true, data: curated, count: curated.length })
    }

    // 1. Local search from comprehensive dataset
    const qLower = query.toLowerCase()
    const localMatches: Aircraft[] = AIRCRAFT_DATASET
      .filter(fa => 
        fa.name.toLowerCase().includes(qLower) ||
        fa.manufacturer.toLowerCase().includes(qLower) ||
        fa.icao.toLowerCase().includes(qLower) ||
        fa.category.toLowerCase().includes(qLower)
      )
      .map(fa => ({
        id: fa.id,
        name: fa.name,
        manufacturer: fa.manufacturer,
        mtow_kg: fa.mtowKg,
        mtow_lbs: Math.round(fa.mtowKg / 0.453592),
        category: fa.category,
        range_nm: fa.rangeNm,
        pax_max: fa.maxPassengers,
        icao_code: fa.icao,
        source: 'database' as const,
      }))

    // 2. Fetch live API Ninjas search results
    const rawItems = await fetchApiNinjas(query)

    // Deduplicate by manufacturer + model
    const seen = new Set<string>(localMatches.map(m => m.name.toLowerCase()))
    const deduplicated: ApiNinjasAircraft[] = []

    for (const item of rawItems) {
      if (!item || !item.model) continue
      const key = item.model.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        deduplicated.push(item)
      }
    }

    // Normalize API Ninjas items
    const apiNormalized: Aircraft[] = deduplicated.map((a: ApiNinjasAircraft) => {
      const rawWeight = a.max_takeoff_weight_lbs || a.gross_weight_lbs || a.max_gross_weight_lbs
      const mtow_lbs = rawWeight ? parseFloat(String(rawWeight).replace(/,/g, '')) : null
      const mtow_kg = mtow_lbs && !isNaN(mtow_lbs) ? Math.round(mtow_lbs * 0.453592) : null

      const rawWingspan = a.wing_span_ft || a.wingspan_ft
      const wingspan_ft = rawWingspan ? parseFloat(String(rawWingspan)) : null
      const wingspan_m = wingspan_ft && !isNaN(wingspan_ft) ? Math.round(wingspan_ft * 0.3048 * 10) / 10 : null

      const rawRange = a.range_nautical_miles
      const range_nm = rawRange ? Math.round(parseFloat(String(rawRange))) : null

      return {
        id:           `${a.manufacturer || 'avia'}_${a.model || 'aircraft'}`.replace(/\s+/g, '_').toLowerCase(),
        name:         a.model || 'Unknown Aircraft',
        manufacturer: a.manufacturer || 'General Aviation',
        mtow_kg:      mtow_kg,
        mtow_lbs:     mtow_lbs ? Math.round(mtow_lbs) : null,
        wingspan_m:   wingspan_m,
        range_nm:     range_nm && !isNaN(range_nm) ? range_nm : null,
        ceiling_ft:   a.ceiling_ft ? Math.round(parseFloat(String(a.ceiling_ft))) : null,
        speed_kts:    a.cruise_speed_knots ? Math.round(parseFloat(String(a.cruise_speed_knots))) : null,
        engine_type:  a.engine_type ?? null,
        source:       'api' as const,
      }
    })

    const usableApi = apiNormalized.filter((a: Aircraft) => a.mtow_kg !== null && a.mtow_kg > 0)
    const combined = [...localMatches, ...usableApi]

    return NextResponse.json({ success: true, data: combined, count: combined.length })

  } catch (err) {
    console.error('Error in aircraft search route:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to reach aircraft service' },
      { status: 500 }
    )
  }
}
