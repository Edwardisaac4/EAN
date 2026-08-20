'use client';

import React, { useState } from 'react';
import { PieChart } from 'lucide-react';
import { SERVICE_LABELS, ServiceCategory } from '@/lib/admin-leads-data';

export interface ServiceDonutChartProps {
  distribution: Record<ServiceCategory, number>;
  total: number;
}

const COLOR_PALETTE: Record<ServiceCategory, string> = {
  fbo: '#c4952a', // Satin Gold
  maintenance: '#38bdf8', // Sky Blue
  charter: '#a855f7', // Purple
  leasing: '#f59e0b', // Amber
  catering: '#10b981', // Emerald
  vip: '#ec4899', // Pink
  flight_support: '#06b6d4', // Cyan
  aeroplex: '#eab308', // Yellow
  press: '#8b5cf6', // Violet
  general: '#64748b', // Slate
};

export function ServiceDonutChart({ distribution, total }: ServiceDonutChartProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | null>(null);

  const radius = 65;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  const segments = Object.entries(distribution).map(([catKey, count]) => {
    const percentage = total > 0 ? count / total : 0;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += percentage;

    return {
      category: catKey as ServiceCategory,
      count,
      percentage: Math.round(percentage * 100),
      strokeDasharray,
      strokeDashoffset,
      color: COLOR_PALETTE[catKey as ServiceCategory] || '#c4952a',
    };
  });

  return (
    <div className="p-6 rounded-2xl bg-ean-black-accent/90 border border-ean-border-dark space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-ean-border-dark pb-3">
        <h3 className="text-sm font-bold text-ean-white flex items-center gap-2 font-display">
          <PieChart className="w-4 h-4 text-ean-gold" />
          Service Interest Distribution Graph
        </h3>
        <span className="text-[11px] font-mono text-ean-gold">{total} Total Inquiries</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
        {/* SVG Donut Graphic */}
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-48 h-48 -rotate-90 transform">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="20"
            />
            {segments.map((seg) => (
              <circle
                key={seg.category}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={activeCategory === seg.category ? '24' : '20'}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActiveCategory(seg.category)}
                onMouseLeave={() => setActiveCategory(null)}
              />
            ))}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-bold font-display text-ean-white">
              {activeCategory ? distribution[activeCategory] : total}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-mono text-ean-gold">
              {activeCategory ? SERVICE_LABELS[activeCategory] : 'All Services'}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5 text-xs">
          {segments.map((seg) => (
            <div
              key={seg.category}
              onMouseEnter={() => setActiveCategory(seg.category)}
              onMouseLeave={() => setActiveCategory(null)}
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                activeCategory === seg.category
                  ? 'bg-white/10 border-ean-gold'
                  : 'bg-ean-black-pure/60 border-ean-border-dark/60 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-ean-white font-medium text-[11px]">
                  {SERVICE_LABELS[seg.category]}
                </span>
              </div>
              <span className="font-mono text-ean-gold font-bold text-[11px]">
                {seg.count} ({seg.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
