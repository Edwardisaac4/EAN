import { NextRequest, NextResponse } from 'next/server'
import type { Aircraft } from '@/types/pricing'

const POPULAR_FLEET_QUERIES = [
  'Gulfstream', 'Challenger', 'Falcon', 'Citation', 'Global', '737', 'A318', 'Embraer', 'Hawker', 'Learjet', 'Phenom'
]

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

async function fetchApiNinjas(q: string, apiKey: string): Promise<ApiNinjasAircraft[]> {
  const isRapidApi = apiKey.includes('jsn') || apiKey.length > 40
  
  const urls = isRapidApi
    ? [
        `https://aircraft-by-api-ninjas.p.rapidapi.com/v1/aircraft?model=${encodeURIComponent(q)}`,
        `https://aircraft-by-api-ninjas.p.rapidapi.com/v1/aircraft?manufacturer=${encodeURIComponent(q)}`
      ]
    : [
        `https://api.api-ninjas.com/v1/aircraft?model=${encodeURIComponent(q)}`,
        `https://api.api-ninjas.com/v1/aircraft?manufacturer=${encodeURIComponent(q)}`
      ]

  const headers: Record<string, string> = isRapidApi
    ? {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'aircraft-by-api-ninjas.p.rapidapi.com',
      }
    : {
        'X-Api-Key': apiKey,
      }

  try {
    const responses = await Promise.all(
      urls.map(url => fetch(url, { headers, next: { revalidate: 86400 } }))
    )

    const dataArrays = await Promise.all(
      responses.map(async r => {
        if (!r.ok) return []
        const json = await r.json()
        return Array.isArray(json) ? json : []
      })
    )

    return dataArrays.flat()
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')?.trim()

  try {
    const apiKey = process.env.API_NINJAS_KEY || process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_AERODATABOX_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Aircraft API key is missing' },
        { status: 500 }
      )
    }

    let rawItems: ApiNinjasAircraft[] = []

    if (!query || query.length < 2) {
      // Query default popular fleet
      const fleetResults = await Promise.all(
        POPULAR_FLEET_QUERIES.map(term => fetchApiNinjas(term, apiKey))
      )
      rawItems = fleetResults.flat()
    } else {
      rawItems = await fetchApiNinjas(query, apiKey)
    }

    // Deduplicate by manufacturer + model
    const seen = new Set<string>()
    const deduplicated: ApiNinjasAircraft[] = []

    for (const item of rawItems) {
      if (!item || !item.model) continue
      const key = `${item.manufacturer || ''}_${item.model}`.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        deduplicated.push(item)
      }
    }

    // Normalize into Aircraft type
    const normalized: Aircraft[] = deduplicated.map((a: ApiNinjasAircraft) => {
      const rawWeight = a.gross_weight_lbs || a.max_gross_weight_lbs || a.max_takeoff_weight_lbs
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

    // Filter out results with no MTOW
    const usable = normalized.filter((a: Aircraft) => a.mtow_kg !== null && a.mtow_kg > 0)

    return NextResponse.json({ success: true, data: usable })

  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to reach aircraft service' },
      { status: 500 }
    )
  }
}
