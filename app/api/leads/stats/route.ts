// =============================================================================
// /api/leads/stats — Dashboard aggregation stats
// =============================================================================

import { NextResponse } from 'next/server'
import { getLeadStats } from '@/lib/services/leads-service'
import { dbError } from '@/lib/supabase/helpers'

export async function GET() {
  try {
    const stats = await getLeadStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (err) {
    console.error('GET /api/leads/stats error:', err)
    return dbError('Failed to fetch lead stats')
  }
}
