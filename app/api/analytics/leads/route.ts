// =============================================================================
// /api/analytics/leads — Aggregate lead analytics
// =============================================================================
// Reads live from Supabase. Access is gated by middleware.ts because the
// underlying figures describe real commercial pipeline.

import { NextResponse } from 'next/server';
import { getLeads } from '@/lib/services/leads-service';
import { mapLeadRowsToUiLeads } from '@/lib/mappers/lead-mapper';
import { getLeadStats } from '@/lib/admin-leads-data';
import { dbError } from '@/lib/supabase/helpers';

const MAX_LEADS_FOR_ANALYTICS = 500;

export async function GET() {
  try {
    const { leads, error } = await getLeads({ page: 1, limit: MAX_LEADS_FOR_ANALYTICS });

    if (error) {
      return dbError('Failed to compute lead analytics');
    }

    const stats = getLeadStats(mapLeadRowsToUiLeads(leads));

    return NextResponse.json({
      success: true,
      stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('GET /api/analytics/leads error:', err);
    return dbError('Failed to compute lead analytics');
  }
}
