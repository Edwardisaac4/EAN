import React from 'react';
import StatCounter from '@/components/shared/StatCounter';
import SectionReveal from '@/components/shared/SectionReveal';
import { TRUST_STATS } from '@/lib/constants';

export default function TrustBar() {
  return (
    <section className="bg-ean-navy/95 dark:bg-ean-navy border-y border-ean-border-dark py-6 sm:py-8 relative z-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        <SectionReveal>
          <div className="grid grid-cols-3 gap-1 sm:gap-4 md:gap-6 text-center">
            {TRUST_STATS.map((stat, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center space-y-1 sm:space-y-2 ${
                  idx < 2 ? 'border-r border-ean-border-dark/40' : ''
                } px-1 sm:px-3`}
              >
                <div className="font-display text-base sm:text-3xl md:text-5xl font-semibold text-ean-gold tracking-tight leading-none">
                  {stat.isNumeric ? (
                    <StatCounter targetValue={stat.value} suffix={stat.suffix} />
                  ) : (
                    <span>{stat.staticText}</span>
                  )}
                </div>
                <p className="font-ui text-[8px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-ean-muted-light leading-tight">
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
