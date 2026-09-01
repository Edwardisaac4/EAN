import React from 'react';
import Image from 'next/image';
import { PARTNER_LOGOS } from '@/lib/constants';

export default function PartnersStrip() {
  const doublePartners = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <section className="bg-ean-surface border-y border-ean-border-light py-10 transition-colors duration-500 overflow-hidden select-none">
      <div className="max-w-ean mx-auto px-6 md:px-8 mb-6">
        <p className="font-ui text-[10px] sm:text-xs uppercase tracking-[0.25em] text-ean-muted-light text-center font-bold">
          Trusted By Industry Leaders & Global Aviation Partners
        </p>
      </div>

      <div className="relative w-full overflow-hidden flex flex-row group">
        {/* Left & right edge gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-linear-to-r from-ean-surface to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-linear-to-l from-ean-surface to-transparent z-10 pointer-events-none" />

        {/* Infinite CSS marquee wrapper */}
        <div className="flex w-max animate-marquee space-x-6 sm:space-x-8 pr-6 sm:pr-8 items-center group-hover:[animation-play-state:paused]">
          {doublePartners.map((partner, idx) => (
            <div
              key={idx}
              className="bg-white px-4 sm:px-6 py-3 border border-ean-border-light/80 shadow-2xs hover:shadow-md hover:border-ean-blue/60 transition-all duration-300 shrink-0 flex items-center justify-center h-16 sm:h-20 w-36 sm:w-44"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={160}
                height={80}
                className="max-h-full max-w-full object-contain filter grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
