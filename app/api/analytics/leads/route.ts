import { NextResponse } from 'next/server';
import { INITIAL_LEADS, getLeadStats } from '@/lib/admin-leads-data';

export async function GET() {
  try {
    const stats = getLeadStats(INITIAL_LEADS);

    return NextResponse.json({
      success: true,
      stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to compute lead analytics' },
      { status: 500 }
    );
  }
}
