// =============================================================================
// /api/leads/stats — Dashboard aggregation stats
// =============================================================================
// Thin alias over the same lead_analytics() aggregate that /api/analytics/leads
// serves. Both routes read one source so the CRM and the analytics page can
// never disagree on a number.

import { NextResponse } from 'next/server'
import { getLeadAnalytics } from '@/lib/services/leads-service'
import { dbError } from '@/lib/supabase/helpers'
import { adminGuard } from '@/lib/api-auth'

export async function GET() {
  try {
    const denied = await adminGuard()
    if (denied) return denied

    const { analytics, error } = await getLeadAnalytics()

    if (error || !analytics) {
      return dbError('Failed to fetch lead stats')
    }

    return NextResponse.json({
      success: true,
      stats: analytics,
    })
  } catch (err) {
    console.error('GET /api/leads/stats error:', err)
    return dbError('Failed to fetch lead stats')
  }
}
