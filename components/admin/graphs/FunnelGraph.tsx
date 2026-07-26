'use client';

import React from 'react';
import { Target } from 'lucide-react';
import { LeadStats } from '@/lib/admin-leads-data';

export interface FunnelGraphProps {
  stats: LeadStats;
}

export function FunnelGraph({ stats }: FunnelGraphProps) {
  const funnelStages = [
    { label: 'Total Inquiries', count: stats.totalLeads, color: 'from-sky-500 to-blue-600' },
    { label: 'In Contact', count: stats.inProgressLeads, color: 'from-indigo-500 to-purple-600' },
    { label: 'Qualified', count: stats.qualifiedLeads, color: 'from-purple-500 to-pink-600' },
    { label: 'Closed (Won)', count: stats.closedWonLeads, color: 'from-emerald-500 to-teal-600' },
  ];

  const maxCount = Math.max(stats.totalLeads, 1);

  return (
    <div className="p-6 rounded-2xl bg-ean-black-accent/90 border border-ean-border-dark space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-ean-border-dark pb-3">
        <h3 className="text-sm font-bold text-ean-white flex items-center gap-2 font-display">
          <Target className="w-4 h-4 text-ean-gold" />
          Lead Conversion Pipeline Funnel Graph
        </h3>
        <span className="text-[11px] font-mono text-emerald-400 font-bold">
          {stats.conversionRate}% Conversion
        </span>
      </div>

      <div className="space-y-3 pt-2">
        {funnelStages.map((stage, idx) => {
          const widthPercent = Math.max((stage.count / maxCount) * 100, 10);

          return (
            <div key={stage.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ean-white font-medium flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-ean-gold font-bold">
                    {idx + 1}
                  </span>
                  {stage.label}
                </span>
                <span className="text-ean-gold font-bold">{stage.count} Leads</span>
              </div>

              {/* Trapeze/Bar Funnel Graphic */}
              <div className="w-full flex justify-center">
                <div
                  className={`h-7 rounded-xl bg-linear-to-r ${stage.color} flex items-center justify-between px-3 text-white text-[11px] font-bold transition-all duration-500 shadow-lg`}
                  style={{ width: `${widthPercent}%` }}
                >
                  <span className="truncate">{stage.label}</span>
                  <span>{Math.round((stage.count / maxCount) * 100)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
