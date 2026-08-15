// =============================================================================
// /api/analytics/leads — Aggregate lead analytics
// =============================================================================
// Reads live from Supabase. Access is gated by middleware.ts because the
// underlying figures describe real commercial pipeline.
//
// Every figure is computed by the lead_analytics() Postgres function, so the
// numbers describe the whole leads table rather than a fetched page, and no lead
// PII crosses the wire to produce them.

import { NextResponse } from 'next/server';
import { getLeadAnalytics } from '@/lib/services/leads-service';
import { dbError } from '@/lib/supabase/helpers';

export async function GET() {
  try {
    const { analytics, error } = await getLeadAnalytics();

    if (error || !analytics) {
      return dbError('Failed to compute lead analytics');
    }

    return NextResponse.json({
      success: true,
      stats: analytics,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('GET /api/analytics/leads error:', err);
    return dbError('Failed to compute lead analytics');
  }
}
