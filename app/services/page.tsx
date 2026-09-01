'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { withReducedMotion } from '@/lib/gsap-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from '@/components/layout/Navbar';
import SectionReveal from '@/components/shared/SectionReveal';
import ServiceFeatureRow, {
  type ServiceRowGround,
} from '@/components/services/ServiceFeatureRow';

import { SERVICES_DATA } from '@/lib/constants';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/*
 * The band rhythm — spec §9.2, and the reason this page was rebuilt.
 *
 * The v8 swap left every section on this page a paper surface: a white hero, an
 * `ean-surface` grid, an `ean-surface` spacer, and a CTA whose gradient read
 * white → #eaecf0 → white. Total luminance range across the whole page was
 * 1.18, which is why it reads as one continuous sheet. The build record puts it
 * plainly: nothing on the site obeys "no more than two consecutive sections on
 * paper".
 *
 * The fix is not to go back toward dark. It is that #2b0098 has a relative
 * luminance of 0.0278 — a dark surface that happens to be chromatic, and the
 * only value in this palette that can do what the ink bands did. So the rows
 * cycle on a period of three and the cycle contains a blue band:
 *
 *   hero    PHOTOGRAPH
 *   row 01  recessed
 *   row 02  BLUE
 *   row 03  paper       ─┐ run of 2
 *   row 04  recessed    ─┘
 *   row 05  BLUE
 *   row 06  paper
 *   CTA     BLUE
 *
 * The hero was the paper opener in that plan and is now a full-bleed
 * photograph, which is the other half of what §9.2 asks for — it shortens the
 * opening run from two to one and gives the page a dark surface before the
 * first blue band. The cycle itself is unchanged.
 *
 * The longest paper-family run is two, everywhere. Because it is `idx % 3` and
 * not a slug lookup, a seventh service extends the rhythm correctly with no
 * edit here — which the bento config it replaces could not do.
 */
const GROUND_CYCLE: ServiceRowGround[] = ['recessed', 'blue', 'paper'];

export default function ServicesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

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
      <Navbar />

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
              Six Aviation Service Lines at Lagos MMIA
            </h1>
            <p
              ref={subtitleRef}
              className="font-ui text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed"
            >
              From direct airport tarmac handling and certified engineering to
              exclusive distributor operations, EAN Aviation delivers precision at
              every flight level.
            </p>
          </div>
        </section>

        {/*
         * SECTIONS 2–7 — one full-width row per service line.
         *
         * The bento grid this replaces had three card variants (wide, tall,
         * square) selected by a slug-keyed `bentoConfigs` map, each with its own
         * ~120-line body — around 250 lines of near-duplicate markup for six
         * services. It also could not show the content: every card `truncate`d
         * its feature list, the tall variant buried its photograph under a
         * 90%-white gradient, and only the wide card surfaced a stat.
         *
         * A row shows all four features, both stats, the photograph at full
         * saturation, and both calls to action. The `id` and `scroll-mt-28` move
         * to the section element so the `/services#slug` links out of
         * ServicesSection keep landing correctly.
         */}
        {SERVICES_DATA.map((service, idx) => (
          <ServiceFeatureRow
            key={service.slug}
            service={service}
            ground={GROUND_CYCLE[idx % GROUND_CYCLE.length]}
            imageRight={idx % 2 === 1}
          />
        ))}

        {/* SECTION 8 — Charter & hangar CTA. Blue band. */}
        <section className="bg-ean-gold py-20 sm:py-24 relative overflow-hidden">
          <div className="max-w-ean mx-auto px-6 md:px-8 relative z-10 text-center">
            <SectionReveal className="max-w-3xl mx-auto space-y-8">
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-muted-dark uppercase block">
                Custom Flight Solutions
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-light text-ean-text-dark leading-tight">
                Design Your Flight Parameters
              </h2>
              <p className="font-ui text-base sm:text-lg md:text-xl text-ean-muted-dark max-w-2xl mx-auto leading-relaxed">
                Connect directly with our corporate operations team to draft custom
                flight schedules, secure airport ground clearances, or inspect MMIA
                hangar leases.
              </p>
              {/*
               * GoldButton and OutlineButton both draw in `ean-gold`, which is
               * this section's own background — they would render as invisible
               * controls here. Same geometry, inverted for the blue ground.
               */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
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
