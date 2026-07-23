import React from 'react';
import StatCounter from '@/components/shared/StatCounter';
import SectionReveal from '@/components/shared/SectionReveal';
import { TRUST_STATS } from '@/lib/constants';

export default function TrustBar() {
  return (
    <section className="bg-ean-navy/95 dark:bg-ean-navy border-y border-ean-border-dark py-8 relative z-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <SectionReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-6 text-center">
            {TRUST_STATS.map((stat, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center space-y-1.5 md:space-y-2 ${
                  idx === 0
                    ? 'border-r border-ean-border-dark/40'
                    : idx === 1
                    ? 'md:border-r border-ean-border-dark/40'
                    : 'col-span-2 md:col-span-1'
                }`}
              >
                <div className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ean-gold tracking-tight">
                  {stat.isNumeric ? (
                    <StatCounter targetValue={stat.value} suffix={stat.suffix} />
                  ) : (
                    <span>{stat.staticText}</span>
                  )}
                </div>
                <p className="font-ui text-[10px] sm:text-xs uppercase tracking-widest text-ean-muted-light">
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
