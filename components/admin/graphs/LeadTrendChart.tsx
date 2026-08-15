'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

export interface TrendPoint {
  label: string;
  count: number;
}

export interface LeadTrendChartProps {
  data?: TrendPoint[];
}

export function LeadTrendChart({ data }: LeadTrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);

  // No sample-data fallback: a placeholder curve on an admin dashboard is
  // indistinguishable from real volume. With nothing to plot, say so instead.
  const trendData = data ?? [];
  const maxCount = Math.max(...trendData.map((d) => d.count), 1);
  const chartHeight = 160;
  const chartWidth = 500;
  // Guards the single-point case, where the divisor would otherwise be zero.
  const lastIndex = Math.max(trendData.length - 1, 1);

  const pointFor = (d: TrendPoint, index: number) => ({
    x: (index / lastIndex) * chartWidth,
    y: chartHeight - (d.count / maxCount) * chartHeight,
  });

  // Calculate SVG curve points
  const points = trendData.map((d, index) => {
    const { x, y } = pointFor(d, index);
    return `${x},${y}`;
  }).join(' ');

  // Smooth Area Fill Path
  const areaPath = `M 0,${chartHeight} L ${points} L ${chartWidth},${chartHeight} Z`;

  return (
    <div className="p-6 rounded-2xl bg-ean-black-accent/90 border border-ean-border-dark space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-ean-border-dark pb-3">
        <div>
          <h3 className="text-sm font-bold text-ean-white flex items-center gap-2 font-display">
            <TrendingUp className="w-4 h-4 text-ean-gold" />
            Daily Inquiries Trend Graph
          </h3>
          <p className="text-[11px] text-ean-muted-light">7-day daily inquiry arrival rate and influx trend.</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] bg-ean-black-pure px-3 py-1.5 rounded-lg border border-ean-border-dark text-ean-gold">
          <Calendar className="w-3 h-3 text-ean-gold" />
          <span>Last 7 Days</span>
        </div>
      </div>

      {trendData.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center gap-2 text-center">
          <TrendingUp className="w-8 h-8 text-ean-muted-light/30" />
          <p className="text-xs text-ean-muted-light">No daily volume to plot yet.</p>
        </div>
      ) : (
      /* SVG Trend Graph */
      <div className="relative pt-4">
        {/* Tooltip Hover Overlay */}
        {hoveredPoint && (
          <div className="absolute top-0 right-4 px-3 py-1.5 rounded-lg bg-ean-navy border border-ean-gold/40 text-xs text-ean-white font-mono shadow-xl z-20">
            <span className="text-ean-gold font-bold">{hoveredPoint.label}: </span>
            <span>{hoveredPoint.count} Inquiries / Day</span>
          </div>
        )}

        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c4952a" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#c4952a" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                y1={chartHeight * ratio}
                x2={chartWidth}
                y2={chartHeight * ratio}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
            ))}

            {/* Gradient Area Fill */}
            <path d={areaPath} fill="url(#goldGradient)" />

            {/* Smooth Trend Polyline */}
            <polyline
              fill="none"
              stroke="#c4952a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />

            {/* Data Point Circles */}
            {trendData.map((d, index) => {
              const { x, y } = pointFor(d, index);
              return (
                <g key={d.label} className="cursor-pointer group" onMouseEnter={() => setHoveredPoint(d)}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#050102"
                    stroke="#c4952a"
                    strokeWidth="3"
                    className="transition-transform group-hover:scale-150"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between font-mono text-[10px] text-ean-muted-light mt-2 pt-2 border-t border-ean-border-dark/40">
          {trendData.map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
