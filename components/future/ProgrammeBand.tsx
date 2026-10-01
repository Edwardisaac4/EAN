'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChevronRight } from 'lucide-react';
import { withScrollTrigger } from '@/lib/gsap-motion';
import type { FutureProgramme } from '@/lib/future-constants';

import SectionReveal from '@/components/shared/SectionReveal';

interface ProgrammeBandProps {
  programme: FutureProgramme;
  /** Only the first band takes it — it is the LCP element on this route. */
  priority?: boolean;
}

/**
 * One programme as a full-bleed photo band, built the same way as the
 * homepage's Services, VIP and Charter bands: parallax photograph, flat scrim
 * plus a left-weighted ramp, and one max-w-2xl copy column carrying only the
 * label, the headline and the way through to the programme page. Stacked, the
 * ten bands butt against each other with no gutter, which is the run of three
 * on the homepage carried through the whole page.
 *
 * It takes the programme's hero photograph rather than its tile image. The
 * tile images and their `imagePosition` values were tuned for portrait cells;
 * the heroes are the landscape frames each deck opens on. A programme can set
 * `band` to give this page a different frame from the one its own page opens on.
 */
export default function ProgrammeBand({ programme, priority = false }: ProgrammeBandProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const { slug, number, name, headline, hero, band } = programme;
  const photo = band ?? hero;

  useGSAP(
    () =>
      withScrollTrigger(
        () => {
          // Same rate and scrub as the homepage bands.
          gsap.to(bgRef.current, {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        },
        () => {
          gsap.set(bgRef.current, { yPercent: 0, clearProps: 'transform' });
        }
      ),
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id={slug}
      className="relative w-full min-h-125 sm:min-h-150 flex items-center justify-center overflow-hidden bg-ean-navy select-none"
    >
      <div ref={bgRef} className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none">
        <Image
          src={photo.image}
          alt={photo.alt}
          fill
          sizes="100vw"
          priority={priority}
          quality={80}
          className="object-cover"
          style={{ objectPosition: photo.imagePosition ?? '50% 50%' }}
        />
        {/* The Services band's pair: these are mostly daylight renders with
            pale skies, which is the case its heavier ramp was tuned for. */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/65 via-55% to-transparent" />
      </div>

      {/* The rule between bands, and under the last one against the footer's
          night photograph. A layer rather than border-b: the photo is clipped
          to the padding box, so a border would sit on the section's paper
          background and render near-white rather than 25% over the image.
          White alone vanishes where a band ends on a pale daylight render —
          the hangar wall, the canopy — so a 1px dark edge sits above it. Over
          the scrim that edge is lost in the black; it only shows where the
          photograph is bright, which is where the white does not. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-white/25 shadow-[0_-1px_0_rgba(0,0,0,0.5)] pointer-events-none"
      />

      <div className="relative z-10 max-w-ean mx-auto px-6 md:px-8 py-20 sm:py-24 w-full">
        <SectionReveal stagger={0.14} distance={48} duration={1.1} ease="power3.out">
          <div className="max-w-2xl text-left space-y-6 sm:space-y-8">
            <div data-reveal className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/70 uppercase"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {number} · {name}
                </span>
                <span className="inline-block w-8 h-px bg-white/40" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-[1.15]">
                {headline}
              </h2>
            </div>

            <div data-reveal className="pt-2 flex flex-wrap items-center gap-4">
              {/* The brief layout's aurum pill, so the band's way in matches the
                  primary button on the page it leads to. */}
              <Link
                href={`/airborne/${slug}`}
                className="group inline-flex items-center gap-2.5 rounded-full border border-ds-aurum bg-ds-aurum px-[26px] py-3 font-ds-body text-[15px] font-semibold text-ds-afterburn transition-colors duration-ds-interaction ease-ds-default hover:border-ds-skyway hover:bg-ds-skyway"
              >
                Explore {name}
                <ChevronRight
                  aria-hidden
                  size={16}
                  className="transition-transform duration-ds-interaction ease-ds-default group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
