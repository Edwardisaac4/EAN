'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { withReducedMotion } from '@/lib/gsap-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from '@/components/layout/Navbar';
import SectionReveal from '@/components/shared/SectionReveal';
import ServiceCard from '@/components/services/ServiceCard';

import { SERVICES_DATA } from '@/lib/constants';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/*
 * The band rhythm — spec §9.2.
 *
 * The v8 swap left every section on this page a paper surface: a white hero, an
 * `ean-surface` grid, an `ean-surface` spacer, and a CTA whose gradient read
 * white → #eaecf0 → white. Total luminance range across the whole page was
 * 1.18, which is why it read as one continuous sheet — nothing obeyed "no more
 * than two consecutive sections on paper".
 *
 * The alternating feature rows fixed that by cycling recessed → blue → paper
 * across seven full-width bands. The card grid fixes it a different way, and
 * with fewer moving parts:
 *
 *   hero     PHOTOGRAPH
 *   grid     recessed paper, carrying seven full-bleed PHOTOGRAPH cards
 *   CTA      BLUE
 *
 * One paper section, so the composition rule holds with room to spare. The
 * darkness the ink bands used to supply now comes from the cards themselves —
 * each is a photograph under a scrim that washes to #2b0098 on interaction, so
 * the recessed ground reads as the gap between dark objects rather than as a
 * surface of its own. That is the same argument §9.2 makes for the blue band,
 * applied at card scale instead of section scale.
 */

/*
 * Every card is one column wide — 1 / 2 / 3 across the breakpoints, the same
 * uniform grid /team and /about use.
 *
 * The earlier version spanned the first and last cards across two columns to
 * fill nine cells exactly. That is a bento, and it made the layout positional:
 * two of the seven cards were composed differently from the other five, so the
 * card had to carry a `wide` prop that switched its title size and split its
 * feature list into two columns, and an eighth service would have landed in a
 * different shape than the seventh. A uniform grid drops all of that — one card
 * body, one `sizes` string, and the array's length stops mattering.
 */
const CARD_SIZES = '(min-width: 1024px) 350px, (min-width: 768px) 50vw, 100vw';

export default function ServicesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // One card pinned open at a time, keyed by slug. Hover and keyboard focus open
  // a card on their own, in CSS; this is the pinned state a tap or a click sets,
  // and it outranks both.
  const [pinnedSlug, setPinnedSlug] = useState<string | null>(null);

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          // Intro animations
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          tl.fromTo(
            titleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
          );

          tl.fromTo(
            subtitleRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.4'
          );
        },
        () => {
          gsap.set([titleRef.current, subtitleRef.current], {
            opacity: 1,
            y: 0,
            clearProps: 'transform',
          });
        }
      ),
    { scope: heroRef }
  );

  return (
    <>
      <Navbar hasPhotoHero />

      <main className="flex-1 flex flex-col">
        {/* SECTION 1 — Header. Photograph. */}
        <section
          ref={heroRef}
          className="relative pt-40 pb-28 md:pt-52 md:pb-40 overflow-hidden"
        >
          {/*
           * Full-bleed apron photograph. Decorative — the h1 below carries the
           * meaning — so `alt` is empty. This is the page's LCP element and the
           * only `priority` image on it (AGENTS.md §8); `quality={70}` is the
           * whitelisted step for full-bleed hero art.
           *
           * `object-bottom`, not `object-center`, and a taller band than the
           * copy needs. The frame's subject — two jets, the marshaller, the tug
           * and the lit hangar — sits in its lower third under a very deep sky.
           * A centred crop of a short band is therefore almost entirely empty
           * sky with the hangar clipped at the corner: a black bar with a
           * photograph's file size. Anchoring to the bottom and giving the
           * section ~540px puts the whole scene in view.
           *
           * Two scrims, not one, and lighter than the footer's. These are
           * night-ramp frames, so they need far less help than a daylight shot
           * would. Measured over the real text box of this crop, 50% flat plus
           * a 55/15/45 gradient holds white at 5.7:1 across the 99th percentile
           * of pixels and 5.3:1 against the single brightest one — clear of AA
           * even where the h1 crosses the lit hangar, which is the one bright
           * thing the copy actually sits on. The gradient is top-heavy because
           * the copy is in the upper half; the foreground apron is already dark
           * and does not need the weight. The footer's 65% would take this
           * frame past 11:1: legible, and a waste of the photograph.
           */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <Image
              src="/images/services hero.jpg"
              alt=""
              fill
              sizes="100vw"
              quality={70}
              priority
              className="object-cover object-bottom"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/15 to-black/45" />
          </div>

          {/* Literal white over a photograph, per AGENTS.md §5 — no surface or
              text token belongs on a photo band. */}
          <div className="max-w-ean mx-auto px-6 md:px-8 relative z-10 text-center space-y-4">
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/75 uppercase block">
              What We Do
            </span>
            <h1
              ref={titleRef}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-white leading-tight"
            >
              Our Services
            </h1>
            <p
              ref={subtitleRef}
              className="font-ui text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed"
            >
              End-to-end aviation services, from tarmac handling and certified engineering to exclusive distribution
            </p>
          </div>
        </section>

        {/*
         * SECTION 2 — the service cards.
         *
         * Replaces seven alternating full-width rows. The rows were built to
         * undo a bento grid that `truncate`d its feature lists and bleached its
         * photographs under a 90%-white gradient; this grid keeps what that fix
         * was protecting — every card opens to its full description, all of its
         * features, both stat chips and both calls to action, over a photograph
         * with nothing washing it out — while giving the page back the scan-in-
         * one-screen shape a service index wants. See ServiceCard for the
         * disclosure and accessibility model.
         *
         * The `id`/`scroll-mt-28` live on the card's own <article>, so the
         * `/services#slug` links out of ServicesSection keep landing correctly.
         */}
        <section className="bg-ean-surface border-y border-ean-border-light">
          <div className="max-w-ean mx-auto px-6 md:px-8 py-20 sm:py-24">
            <SectionReveal className="max-w-3xl mb-14 space-y-4" stagger={0.1} distance={40} duration={1}>
              <span data-reveal className="font-mono text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase block">
                Service Lines
              </span>
              <h2 data-reveal className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-ean-text-light leading-tight">
                All Services, One Location
              </h2>
              <p data-reveal className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
                EAN provides comprehensive, full-spectrum aviation support at one location.
              </p>
            </SectionReveal>

            {/*
              One trigger on the grid, not one per card. A `SectionReveal` per
              mapped item looks like a stagger and is not: each card owned a
              private ScrollTrigger at `top 85%`, so every card in a row crossed
              the line on the same frame and the grid arrived a whole row at a
              time. `grid` measures the rendered positions and sweeps the cards
              diagonally instead.
            */}
            <SectionReveal
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7"
              stagger={0.06}
              grid
            >
              {SERVICES_DATA.map((service) => (
                <div key={service.slug} data-reveal>
                  <ServiceCard
                    service={service}
                    sizes={CARD_SIZES}
                    isExpanded={pinnedSlug === service.slug}
                    onToggle={() =>
                      setPinnedSlug((prev) => (prev === service.slug ? null : service.slug))
                    }
                  />
                </div>
              ))}
            </SectionReveal>
          </div>
        </section>

        {/* SECTION 3 — Charter & hangar CTA. Blue band. */}
        <section className="bg-ean-gold py-20 sm:py-24 relative overflow-hidden">
          <div className="max-w-ean mx-auto px-6 md:px-8 relative z-10 text-center">
            <SectionReveal className="max-w-3xl mx-auto space-y-8" stagger={0.14} distance={48} duration={1.1} ease="power3.out">
              <span data-reveal className="font-mono text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-muted-dark uppercase block">
                Custom Flight Solutions
              </span>
              <h2 data-reveal className="font-display text-3xl sm:text-5xl font-light text-ean-text-dark leading-tight">
                Design Your Flight Parameters
              </h2>
              <p data-reveal className="font-ui text-base sm:text-lg md:text-xl text-ean-muted-dark max-w-2xl mx-auto leading-relaxed">
                Connect directly with our corporate operations team to draft custom
                flight schedules, secure airport ground clearances, or inspect MMIA
                hangar leases.
              </p>
              {/*
               * GoldButton and OutlineButton both draw in `ean-gold`, which is
               * this section's own background — they would render as invisible
               * controls here. Same geometry, inverted for the blue ground.
               */}
              <div data-reveal className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/charter"
                  className="w-full sm:w-auto font-ui font-semibold text-[12.5px] uppercase tracking-[0.08em] px-7 py-3.5 transition-colors duration-300 inline-flex items-center justify-center gap-2 rounded-none border bg-ean-white border-ean-white text-ean-gold hover:bg-ean-muted-dark hover:border-ean-muted-dark"
                >
                  Request a Charter
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto font-ui font-semibold text-[12.5px] uppercase tracking-[0.08em] px-7 py-3.5 transition-colors duration-300 inline-flex items-center justify-center gap-2 rounded-none border border-white/50 text-ean-text-dark hover:bg-ean-white hover:text-ean-gold hover:border-ean-white"
                >
                  Speak With Concierge
                </Link>
              </div>
            </SectionReveal>
          </div>
        </section>
      </main>
    </>
  );
}
