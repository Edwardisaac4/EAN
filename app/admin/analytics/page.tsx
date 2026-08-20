'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { LeadStatCard } from '@/components/admin/LeadStatCard';
import type { LeadAnalytics, ServiceCategory } from '@/lib/admin-leads-data';
import { graphqlQuery, QUERY_GET_LEAD_STATS } from '@/lib/graphql-client';

// Visual Graph Components
import { LeadTrendChart } from '@/components/admin/graphs/LeadTrendChart';
import { ServiceDonutChart } from '@/components/admin/graphs/ServiceDonutChart';
import { AcquisitionBarChart } from '@/components/admin/graphs/AcquisitionBarChart';
import { FunnelGraph } from '@/components/admin/graphs/FunnelGraph';

import { BarChart3, TrendingUp, Clock, Globe, Target, Compass, Cpu, Monitor } from 'lucide-react';

/**
 * Stats as returned by the API: identical to `LeadAnalytics` except that
 * `serviceDistribution` arrives as an array so each entry can carry its display
 * label and share alongside the count.
 */
interface AnalyticsStats extends Omit<LeadAnalytics, 'serviceDistribution'> {
  serviceDistribution: Array<{
    category: string;
    label: string;
    count: number;
    percentage: number;
  }>;
}

const EMPTY_SERVICE_DISTRIBUTION: Record<ServiceCategory, number> = {
  fbo: 0,
  maintenance: 0,
  charter: 0,
  catering: 0,
  vip: 0,
  leasing: 0,
  flight_support: 0,
  aeroplex: 0,
  press: 0,
  general: 0,
};

const EMPTY_STATS: AnalyticsStats = {
  totalLeads: 0,
  spamLeads: 0,
  newLeads: 0,
  inProgressLeads: 0,
  qualifiedLeads: 0,
  closedWonLeads: 0,
  closedLostLeads: 0,
  dailyInquiryRate: 0,
  // null, not 0 — nothing has been measured before the first load resolves.
  avgResponseSlaMinutes: null,
  conversionRate: 0,
  totalEstimatedPipeline: 0,
  serviceDistribution: [],
  trackingDistribution: { topSources: [], topLandingPages: [], devices: {} },
  dailyTrend: [],
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>(EMPTY_STATS);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const res = await graphqlQuery<{ leadStats: AnalyticsStats }>(QUERY_GET_LEAD_STATS);
        if (cancelled) return;

        setStats(res.leadStats ?? EMPTY_STATS);
        setLoadState('ready');
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setStats(EMPTY_STATS);
        setLoadState('error');
        setLoadError(err instanceof Error ? err.message : 'Could not load analytics.');
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  // The donut chart wants a keyed record; the API sends an array with labels.
  const serviceDistributionRecord = useMemo(() => {
    const record = { ...EMPTY_SERVICE_DISTRIBUTION };
    stats.serviceDistribution.forEach((item) => {
      if (item.category in record) {
        record[item.category as ServiceCategory] = item.count;
      }
    });
    return record;
  }, [stats.serviceDistribution]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader />

      <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">

        {/* Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-ean-gold" />
              <h1 className="text-2xl font-bold font-display text-ean-white">Lead Demand & Acquisition Visual Analytics</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Live database ({loadState})
              </span>
            </div>
            <p className="text-xs text-ean-muted-light mt-0.5">
              Interactive SVG trend curves, service interest donut charts, referral channel bar graphs, and conversion funnels.
            </p>
          </div>
        </div>

        {loadError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300"
          >
            <p className="font-bold">Could not load analytics</p>
            <p className="text-rose-300/80 mt-0.5">{loadError}</p>
          </div>
        )}

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <LeadStatCard
            title="Lead Velocity (30D)"
            value={`+${stats.totalLeads} Inquiries`}
            change="Active"
            changeType="positive"
            icon={TrendingUp}
          />
          <LeadStatCard
            title="Qualified Funnel Rate"
            value={`${stats.conversionRate}%`}
            change="+4.2%"
            changeType="positive"
            icon={Target}
            accentColor="text-emerald-400"
          />
          <LeadStatCard
            title="First Contact SLA"
            value={
              stats.avgResponseSlaMinutes !== null
                ? `${stats.avgResponseSlaMinutes} mins`
                : 'No responses yet'
            }
            change="Target: < 45m"
            changeType={
              stats.avgResponseSlaMinutes !== null && stats.avgResponseSlaMinutes > 45
                ? 'negative'
                : 'positive'
            }
            icon={Clock}
            accentColor="text-sky-400"
          />
          <LeadStatCard
            title="Inquiries Rate (Daily)"
            value={
              stats.dailyInquiryRate !== undefined
                ? `${stats.dailyInquiryRate} / day`
                : `${(stats.totalLeads / 7).toFixed(1)} / day`
            }
            change={stats.dailyInquiryRate !== undefined ? 'Live Rate' : 'Target: 7-day Avg'}
            changeType="positive"
            icon={Globe}
            accentColor="text-amber-400"
          />
        </div>

        {/* VISUAL GRAPHS SECTION 1: Lead Trend Area Curve & Pipeline Conversion Funnel Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeadTrendChart data={stats.dailyTrend} />
          <FunnelGraph stats={stats} />
        </div>

        {/* VISUAL GRAPHS SECTION 2: Service Interest Donut Chart & Acquisition Channel Bar Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ServiceDonutChart
            distribution={serviceDistributionRecord}
            total={stats.totalLeads}
          />

          <AcquisitionBarChart sources={stats.trackingDistribution?.topSources || []} />
        </div>

        {/* VISUAL GRAPHS SECTION 3: Landing Pages & Device Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Landing Pages Performance */}
          <div className="p-6 rounded-2xl bg-ean-black-accent/90 border border-ean-border-dark space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ean-border-dark">
              <h3 className="text-sm font-bold text-ean-white flex items-center gap-2 font-display">
                <Compass className="w-4 h-4 text-ean-gold" />
                Top Landing Page Entry Points Graph
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {stats.trackingDistribution?.topLandingPages?.map((lp: { page: string; count: number }) => (
                <div key={lp.page} className="p-3.5 rounded-xl bg-ean-black-pure border border-ean-border-dark flex items-center justify-between">
                  <span className="font-mono text-ean-gold font-semibold">{lp.page}</span>
                  <span className="text-ean-muted-light font-mono font-bold">{lp.count} arrivals</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Type Distribution */}
          <div className="p-6 rounded-2xl bg-ean-black-accent/90 border border-ean-border-dark space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-ean-border-dark">
              <h3 className="text-sm font-bold text-ean-white flex items-center gap-2 font-display">
                <Monitor className="w-4 h-4 text-ean-gold" />
                Prospect Device Type Breakdown
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              {Object.entries(stats.trackingDistribution?.devices || {}).map(([dev, count]: [string, number]) => {
                const percentage = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0;
                return (
                  <div key={dev} className="p-4 rounded-xl bg-ean-black-pure border border-ean-border-dark space-y-1">
                    <span className="text-[10px] uppercase font-bold text-ean-muted-light tracking-wider block">{dev}</span>
                    <span className="text-xl font-bold font-mono text-ean-gold block">{count}</span>
                    <span className="text-[10px] text-ean-muted-light block">{percentage}% share</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
