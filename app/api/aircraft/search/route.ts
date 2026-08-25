import { NextRequest, NextResponse } from 'next/server'
import type { Aircraft } from '@/types/pricing'
import { AIRCRAFT_DATASET } from '@/lib/aircraftData'
import {
  consumeRateLimit,
  clientIpFrom,
  aircraftSearchKey,
  AIRCRAFT_SEARCH_MAX,
  AIRCRAFT_SEARCH_WINDOW_SECONDS,
} from '@/lib/rate-limiter'

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

/**
 * `degraded` is true when a provider *is* configured but the lookup failed, so
 * the route can say the live half of the search is missing. Returning a bare
 * empty array made an upstream outage indistinguishable from "no such
 * aircraft", and the caller then cached that emptiness as a valid answer.
 */
interface ApiNinjasResult {
  items: ApiNinjasAircraft[]
  degraded: boolean
}

async function fetchApiNinjas(q: string): Promise<ApiNinjasResult> {
  const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_AERODATABOX_KEY
  const apiNinjasKey = process.env.API_NINJAS_KEY

  const provider = rapidApiKey ? 'rapidapi' : apiNinjasKey ? 'apininjas' : null
  // No key is a deployment choice, not a failure: the curated dataset is the
  // whole answer, so nothing is degraded.
  if (!provider) return { items: [], degraded: false }

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

    let failures = 0

    const dataArrays = await Promise.all(
      responses.map(async r => {
        if (!r.ok) {
          failures += 1
          // A 401/429 here is the difference between an empty result and an
          // expired key or an exhausted quota. Log the status so it is
          // diagnosable from the server logs rather than only visible as
          // missing rows.
          console.error(`[aircraft-search] ${provider} responded ${r.status} ${r.statusText} for ${r.url}`)
          return []
        }

        try {
          const json = await r.json()
          return Array.isArray(json) ? json : []
        } catch (parseErr) {
          failures += 1
          console.error(`[aircraft-search] ${provider} returned an unreadable body for ${r.url}:`, parseErr)
          return []
        }
      })
    )

    return { items: dataArrays.flat(), degraded: failures === responses.length }
  } catch (err) {
    console.error('API Ninjas fetch error details:', err)
    return { items: [], degraded: true }
  }
}

export async function GET(req: NextRequest) {
  // This route is public and proxies a metered third-party API, so the limit is
  // protecting spend, not just load. It previously used a module-level Map,
  // which on Vercel meant one 30/min budget per warm lambda rather than one per
  // caller — the shared Postgres counter makes the cap actually hold.
  const rateCheck = await consumeRateLimit(
    aircraftSearchKey(clientIpFrom(req)),
    AIRCRAFT_SEARCH_MAX,
    AIRCRAFT_SEARCH_WINDOW_SECONDS
  )

  if (!rateCheck.isAllowed) {
    return NextResponse.json(
      { success: false, error: 'Too many search requests. Please wait a moment.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateCheck.retryAfterSeconds ?? 60) },
      }
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
    const { items: rawItems, degraded: liveSearchDegraded } = await fetchApiNinjas(query)

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

    // The curated matches are still a real answer, so this stays a 200 — but the
    // caller is told the live half is missing so it can say so instead of
    // presenting a short list as complete.
    return NextResponse.json({
      success: true,
      data: combined,
      count: combined.length,
      ...(liveSearchDegraded
        ? { liveSearchDegraded: true, warning: 'Live aircraft lookup is unavailable — showing curated fleet matches only.' }
        : {}),
    })

  } catch (err) {
    console.error('Error in aircraft search route:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to reach aircraft service' },
      { status: 500 }
    )
  }
}
