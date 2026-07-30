'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { LeadStatCard } from '@/components/admin/LeadStatCard';
import { getLeadStats } from '@/lib/admin-leads-data';
import { getAllLeadsFromStore } from '@/lib/leads-store';
import { graphqlQuery, QUERY_GET_LEAD_STATS } from '@/lib/graphql-client';

// Visual Graph Components
import { LeadTrendChart } from '@/components/admin/graphs/LeadTrendChart';
import { ServiceDonutChart } from '@/components/admin/graphs/ServiceDonutChart';
import { AcquisitionBarChart } from '@/components/admin/graphs/AcquisitionBarChart';
import { FunnelGraph } from '@/components/admin/graphs/FunnelGraph';

import { BarChart3, TrendingUp, Clock, Globe, Target, Compass, Cpu, Monitor } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(() => getLeadStats(getAllLeadsFromStore()));
  const [graphqlStatus, setGraphqlStatus] = useState<'connected' | 'loading' | 'fallback'>('loading');

  useEffect(() => {
    async function loadGraphQLStats() {
      try {
        const res = await graphqlQuery<{ leadStats: any }>(QUERY_GET_LEAD_STATS);
        if (res?.leadStats) {
          setStats(res.leadStats);
          setGraphqlStatus('connected');
          return;
        }
        setStats(getLeadStats(getAllLeadsFromStore()));
        setGraphqlStatus('connected');
      } catch (err) {
        console.warn('GraphQL Query fallback for analytics:', err);
        setStats(getLeadStats(getAllLeadsFromStore()));
        setGraphqlStatus('fallback');
      }
    }
    loadGraphQLStats();
  }, []);

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
                GraphQL Visual Graphs ({graphqlStatus})
              </span>
            </div>
            <p className="text-xs text-ean-muted-light mt-0.5">
              Interactive SVG trend curves, service interest donut charts, referral channel bar graphs, and conversion funnels.
            </p>
          </div>
        </div>

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
            value="24 mins"
            change="Target: < 45m"
            changeType="positive"
            icon={Clock}
            accentColor="text-sky-400"
          />
          <LeadStatCard
            title="Inquiries Rate (Daily)"
            value="14 / day"
            change="Strong Influx"
            changeType="positive"
            icon={Globe}
            accentColor="text-amber-400"
          />
        </div>

        {/* VISUAL GRAPHS SECTION 1: Lead Trend Area Curve & Pipeline Conversion Funnel Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeadTrendChart />
          <FunnelGraph stats={stats} />
        </div>

        {/* VISUAL GRAPHS SECTION 2: Service Interest Donut Chart & Acquisition Channel Bar Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ServiceDonutChart
            distribution={
              Array.isArray(stats.serviceDistribution)
                ? stats.serviceDistribution.reduce((acc: any, item: any) => {
                    acc[item.category] = item.count;
                    return acc;
                  }, {})
                : stats.serviceDistribution
            }
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
              {stats.trackingDistribution?.topLandingPages?.map((lp: any) => (
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
              {Object.entries(stats.trackingDistribution?.devices || {}).map(([dev, count]: [string, any]) => {
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
