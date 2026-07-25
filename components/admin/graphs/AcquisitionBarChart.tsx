'use client';

import React from 'react';
import { Globe, Compass } from 'lucide-react';

export interface ChannelData {
  source: string;
  count: number;
  percentage: number;
}

export interface AcquisitionBarChartProps {
  sources: ChannelData[];
}

export function AcquisitionBarChart({ sources }: AcquisitionBarChartProps) {
  const maxCount = Math.max(...sources.map((s) => s.count), 1);

  return (
    <div className="p-6 rounded-2xl bg-ean-black-accent/90 border border-ean-border-dark space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-ean-border-dark pb-3">
        <h3 className="text-sm font-bold text-ean-white flex items-center gap-2 font-display">
          <Globe className="w-4 h-4 text-ean-gold" />
          Acquisition Channels & Traffic Sources Graph
        </h3>
        <span className="text-[11px] font-mono text-ean-gold">UTM Attribution</span>
      </div>

      <div className="space-y-4 pt-2">
        {sources.map((src) => {
          const barWidth = Math.max((src.count / maxCount) * 100, 4);

          return (
            <div key={src.source} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ean-white flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-ean-gold" />
                  {src.source}
                </span>
                <div className="font-mono text-xs flex items-center gap-2">
                  <span className="text-ean-muted-light">{src.count} leads</span>
                  <span className="text-ean-gold font-bold bg-ean-gold/10 px-2 py-0.5 rounded border border-ean-gold/20">
                    {src.percentage}%
                  </span>
                </div>
              </div>

              {/* Visual Bar Representation */}
              <div className="w-full h-3 bg-ean-black-pure rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-linear-to-r from-ean-navy via-ean-gold to-amber-300 rounded-full transition-all duration-700 group-hover:brightness-125"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
