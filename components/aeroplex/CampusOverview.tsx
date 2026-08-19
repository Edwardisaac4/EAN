import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import SectionReveal from '@/components/shared/SectionReveal';
import {
  AEROPLEX_FACTS,
  AEROPLEX_OVERVIEW,
  AEROPLEX_SECTION_IDS,
} from '@/lib/aeroplex-constants';

export default function CampusOverview() {
  return (
    <section
      id={AEROPLEX_SECTION_IDS.campus}
      className="scroll-mt-24 bg-[#08080a] text-white py-16 sm:py-24 lg:py-28"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Campus Overview Copy & CTA */}
        <SectionReveal className="lg:col-span-6 space-y-6 sm:space-y-7">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-white leading-[1.1] tracking-tight">
            {AEROPLEX_OVERVIEW.title}
          </h2>

          <div className="space-y-4 pt-1">
            {AEROPLEX_OVERVIEW.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="font-ui text-sm sm:text-base text-zinc-300 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href={AEROPLEX_OVERVIEW.cta.href}
              className="inline-flex items-center justify-center bg-ean-gold text-[#08080a] hover:bg-ean-gold-light transition-colors duration-300 font-ui font-semibold text-xs sm:text-sm uppercase tracking-[0.18em] px-7 py-3.5 rounded-none cursor-pointer"
            >
              {AEROPLEX_OVERVIEW.cta.text}
            </Link>
          </div>
        </SectionReveal>

        {/* Right Column: Key Project Facts with Photo Thumbnails */}
        <SectionReveal className="lg:col-span-6">
          <div className="border border-white/10 divide-y divide-white/10 bg-[#0d0d12]/80 overflow-hidden">
            {AEROPLEX_FACTS.map((fact) => (
              <div
                key={fact.id}
                className="group flex flex-col sm:flex-row items-stretch hover:bg-white/[0.03] transition-colors duration-300"
              >
                <div className="relative w-full sm:w-36 md:w-40 h-32 sm:h-auto shrink-0 overflow-hidden bg-[#121218]">
                  <Image
                    src={fact.image}
                    alt={fact.imageAlt || fact.label}
                    fill
                    sizes="(max-width: 640px) 100vw, 160px"
                    quality={80}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors duration-300" />
                </div>

                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center space-y-1.5 min-w-0">
                  <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-ean-gold font-medium">
                    {fact.label}
                  </span>
                  <h3 className="font-ui text-sm sm:text-base font-semibold text-white tracking-wide">
                    {fact.value}
                  </h3>
                  <p className="font-ui text-xs text-white/60 leading-relaxed">
                    {fact.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
