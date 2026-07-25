'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface LeadStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon: React.ElementType;
  accentColor?: string;
}

export function LeadStatCard({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon: Icon,
  accentColor = 'text-ean-gold',
}: LeadStatCardProps) {
  return (
    <div className="p-5 rounded-xl bg-ean-black-accent/90 border border-ean-border-dark hover:border-ean-gold/40 transition-all group relative overflow-hidden shadow-lg">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-ean-gold/5 rounded-full filter blur-2xl group-hover:bg-ean-gold/10 transition-all pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-ean-muted-light/70 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <h3 className="text-2xl font-bold font-display text-ean-white tracking-tight">
            {value}
          </h3>
        </div>

        <div className={`p-2.5 rounded-lg bg-white/5 border border-white/10 ${accentColor} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-ean-border-dark/60 text-xs">
        {change && (
          <div className="flex items-center gap-1">
            {changeType === 'positive' && (
              <span className="flex items-center text-emerald-400 font-semibold gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {change}
              </span>
            )}
            {changeType === 'negative' && (
              <span className="flex items-center text-rose-400 font-semibold gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                {change}
              </span>
            )}
            {changeType === 'neutral' && (
              <span className="flex items-center text-ean-muted-light font-medium gap-0.5">
                <Minus className="w-3.5 h-3.5" />
                {change}
              </span>
            )}
            <span className="text-[11px] text-ean-muted-light/60">vs last month</span>
          </div>
        )}

        {subtitle && (
          <span className="text-[11px] text-ean-gold-light/80 font-medium ml-auto">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
