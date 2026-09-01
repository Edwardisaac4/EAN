import React from 'react';
import Link from 'next/link';
import { Check, Clock, FileText, Lock, Mail, Phone } from 'lucide-react';

import SectionReveal from '@/components/shared/SectionReveal';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';
import { AEROPLEX_PARTNER, AEROPLEX_SECTION_IDS } from '@/lib/aeroplex-constants';
import { LAGOS_HQ } from '@/lib/constants';

/**
 * The page's only lead-generating surface, and its closing band. Both CTAs are
 * real routes rather than in-page scrolls, so they render as <Link>.
 *
 * The operations strip below reads from LAGOS_HQ so the number, address and hours
 * cannot drift from the footer and /contact.
 */
export default function PartnerRequest() {
  return (
    <>
      <section
        id={AEROPLEX_SECTION_IDS.request}
        className="scroll-mt-24 bg-ean-navy text-ean-text-light py-20 sm:py-24 relative overflow-hidden"
      >

        <div className="max-w-ean mx-auto px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <SectionReveal className="lg:col-span-7 space-y-7">
              <span className="inline-flex items-center gap-2 font-ui text-xs font-semibold tracking-[0.25em] text-ean-gold uppercase">
                <Lock className="w-3.5 h-3.5" />
                {AEROPLEX_PARTNER.eyebrow}
              </span>

              <h2 className="font-display text-3xl sm:text-4xl font-light leading-[1.1]">
                {AEROPLEX_PARTNER.title}
              </h2>

              {AEROPLEX_PARTNER.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed max-w-2xl"
                >
                  {paragraph}
                </p>
              ))}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link href={AEROPLEX_PARTNER.primaryCta.href}>
                  <GoldButton className="w-full sm:w-auto">
                    {AEROPLEX_PARTNER.primaryCta.text}
                  </GoldButton>
                </Link>
                <Link href={AEROPLEX_PARTNER.secondaryCta.href}>
                  <OutlineButton variant="dark" className="w-full sm:w-auto">
                    {AEROPLEX_PARTNER.secondaryCta.text}
                  </OutlineButton>
                </Link>
              </div>

              <p className="font-ui text-xs sm:text-sm text-ean-muted-light/80">
                {AEROPLEX_PARTNER.handledBy}
              </p>
            </SectionReveal>

            <SectionReveal className="lg:col-span-5 w-full">
              <div className="bg-ean-navy-mid/70 border border-ean-gold/25 p-7 sm:p-8 space-y-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 pb-5 border-b border-ean-border-dark">
                  <span className="w-10 h-10 bg-ean-gold/10 border border-ean-gold/30 text-ean-gold flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </span>
                  <h3 className="font-ui text-sm font-semibold uppercase tracking-[0.15em] text-ean-text-light">
                    In the project overview
                  </h3>
                </div>

                <ul className="space-y-4">
                  {AEROPLEX_PARTNER.contents.map((entry) => (
                    <li key={entry} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-ean-gold mt-1 shrink-0" />
                      <span className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                        {entry}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      <div className="bg-ean-black-pure border-t border-ean-border-dark">
        <div className="max-w-ean mx-auto px-6 md:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
          <a
            href={`tel:${LAGOS_HQ.phone.replace(/[^+\d]/g, '')}`}
            className="group flex items-center gap-3 text-ean-muted-light hover:text-ean-text-light transition-colors"
          >
            <Phone className="w-4 h-4 text-ean-gold shrink-0" />
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ean-gold">
                Operations
              </span>
              <span className="block font-ui text-sm">{LAGOS_HQ.phone}</span>
            </span>
          </a>

          <a
            href={`mailto:${LAGOS_HQ.email}`}
            className="group flex items-center gap-3 text-ean-muted-light hover:text-ean-text-light transition-colors sm:border-l sm:border-ean-border-dark sm:pl-8"
          >
            <Mail className="w-4 h-4 text-ean-gold shrink-0" />
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ean-gold">
                Email
              </span>
              <span className="block font-ui text-sm truncate">{LAGOS_HQ.email}</span>
            </span>
          </a>

          <div className="flex items-center gap-3 text-ean-muted-light sm:border-l sm:border-ean-border-dark sm:pl-8">
            <Clock className="w-4 h-4 text-ean-gold shrink-0" />
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ean-gold">
                Hours
              </span>
              <span className="block font-ui text-sm">{LAGOS_HQ.hours}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
