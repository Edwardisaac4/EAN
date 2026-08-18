import React from 'react';
import SectionReveal from '@/components/shared/SectionReveal';
import { TRUST_STATS } from '@/lib/constants';

// Rules belong between cells, never around the band. The grid wraps to 2x2 below
// sm and runs four across above it, so which edge each cell rules on changes with
// the breakpoint — an index lookup is the only way to express that, since
// `divide-x` would draw a stray rule down the left of the second mobile row.
const CELL_RULES = [
  'border-r border-b sm:border-b-0',
  'border-b sm:border-b-0 sm:border-r',
  'border-r',
  '',
];

export default function TrustBar() {
  return (
    <section className="bg-ean-navy/95 dark:bg-ean-navy border-y border-ean-border-dark py-6 sm:py-8 relative z-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        <SectionReveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 sm:gap-y-0 gap-x-1 sm:gap-x-4 md:gap-x-6 text-center">
            {TRUST_STATS.map((stat, idx) => (
              <div
                key={stat.figure}
                className={`flex flex-col items-center justify-start space-y-1 sm:space-y-2 px-1 sm:px-3 pb-5 sm:pb-0 border-ean-border-dark/40 ${CELL_RULES[idx]}`}
              >
                {/* Steps up gently rather than jumping to text-5xl at md: four
                    columns at the md breakpoint leave ~156px per cell, which the
                    widest figure ("NCAA-AMO") overflows at that size. */}
                <div className="font-display text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-ean-gold tracking-tight leading-none">
                  <span>{stat.figure}</span>
                </div>
                <p className="font-ui text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider sm:tracking-widest text-ean-muted-light leading-tight text-balance">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
