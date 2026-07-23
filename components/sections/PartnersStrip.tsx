import React from 'react';
import { PARTNER_LOGOS } from '@/lib/constants';

export default function PartnersStrip() {
  const doublePartners = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <section className="bg-ean-surface dark:bg-ean-navy border-y border-ean-border-light dark:border-ean-border-dark py-10 transition-colors duration-500 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6 md:px-8 mb-6">
        <p className="font-ui text-[10px] sm:text-xs uppercase tracking-[0.25em] text-ean-muted-dark dark:text-ean-muted-light text-center font-bold">
          Trusted By Industry Leaders & Global Aviation Partners
        </p>
      </div>

      <div className="relative w-full overflow-hidden flex flex-row group">
        {/* Left & right edge gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-ean-surface dark:from-ean-navy to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-ean-surface dark:from-ean-navy to-transparent z-10 pointer-events-none" />

        {/* Infinite CSS marquee wrapper */}
        <div className="flex w-max animate-marquee space-x-6 sm:space-x-8 pr-6 sm:pr-8 items-center group-hover:[animation-play-state:paused]">
          {doublePartners.map((partner, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-white/95 px-4 sm:px-6 py-3 rounded-xs border border-ean-border-light/80 dark:border-white/10 shadow-2xs hover:shadow-md hover:border-ean-gold/60 transition-all duration-300 shrink-0 flex items-center justify-center h-16 sm:h-20 w-36 sm:w-44"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-full max-w-full object-contain filter grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
