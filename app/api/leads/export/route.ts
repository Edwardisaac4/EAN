// =============================================================================
// /api/leads/export — CSV export of filtered leads
// Admin-only endpoint
// =============================================================================

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { exportLeadsCSV } from '@/lib/services/leads-service'
import { dbError } from '@/lib/supabase/helpers'
import type { LeadStatusEnum, LeadServiceEnum, LeadPriorityEnum } from '@/types/database'

export async function GET(request: Request) {
  // This route returns every lead as a single downloadable file, so it is the
  // highest-value target on the API. It gets the same check as everything else,
  // not a lighter one.
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    // A CSV of every lead is the highest-value response on the site, so the
    // session is checked here as well as in proxy.ts.

    const { searchParams } = new URL(request.url)

    const status   = searchParams.get('status') as LeadStatusEnum | 'all' | null
    const service  = searchParams.get('service') as LeadServiceEnum | 'all' | null
    const priority = searchParams.get('priority') as LeadPriorityEnum | 'all' | null
    const search   = searchParams.get('q') || undefined

    const csv = await exportLeadsCSV({
      status:   status || 'all',
      service:  service || 'all',
      priority: priority || 'all',
      search,
    })

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `ean-leads-export-${timestamp}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('GET /api/leads/export error:', err)
    return dbError('Failed to export leads')
  }
}
