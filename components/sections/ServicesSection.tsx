'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Plane,
  Wrench,
  BadgeCheck,
  UtensilsCrossed,
  Star,
  Building2,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

import { SERVICES_DATA } from '@/lib/constants';
import { withReducedMotion, withScrollTrigger } from '@/lib/gsap-motion';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';
import SectionReveal from '@/components/shared/SectionReveal';

const ICON_MAP = {
  Plane,
  Wrench,
  BadgeCheck,
  UtensilsCrossed,
  Star,
  Building2,
};

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLUListElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Sliding gold pill behind the active tab — the CSS equivalent of the
  // layoutId morph this used to get from framer-motion.
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [pill, setPill] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  // Held false for the first paint so the pill appears in place rather than
  // gliding in from the left edge on load.
  const [isPillAnimated, setIsPillAnimated] = useState(false);

  const measurePill = useCallback(() => {
    const strip = tabsRef.current;
    const el = tabRefs.current[activeTab];
    if (!strip || !el) return;

    // offsetLeft/offsetTop are relative to the scrolling strip, so the pill
    // stays aligned even when the tab bar scrolls horizontally on mobile.
    setPill({
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
  }, [activeTab]);

  useEffect(() => {
    measurePill();
    const enableFrame = requestAnimationFrame(() => setIsPillAnimated(true));

    const strip = tabsRef.current;
    if (!strip) {
      return () => cancelAnimationFrame(enableFrame);
    }

    const observer = new ResizeObserver(measurePill);
    observer.observe(strip);
    document.fonts?.ready.then(measurePill).catch(() => {});

    return () => {
      cancelAnimationFrame(enableFrame);
      observer.disconnect();
    };
  }, [measurePill]);

  const activeService = SERVICES_DATA[activeTab] || SERVICES_DATA[0];

  /*
   * Band parallax, at the same rate and on the same scrub as VIPSection and
   * CharterSection. It is deliberately a separate GSAP context from the
   * showcase timeline below: this one is created once and driven by scroll
   * position, whereas that one is rebuilt on every tab change. Sharing a
   * context would tear down and re-create the ScrollTrigger six clicks in a
   * row, which is how a scrubbed parallax ends up snapping back to yPercent 0
   * mid-scroll.
   *
   * The tween targets the wrapper, which never remounts; the photograph inside
   * it is what swaps per service, so the two motions never contend for the
   * same transform.
   */
  useGSAP(
    () =>
      withScrollTrigger(
        () => {
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

  // One master timeline for the whole showcase, replacing the 0.35s
  // `ean-enter-up` fade the card used to get from CSS. Nothing here touches
  // opacity: every element arrives from behind a clip edge or from under a
  // mask, which is what separates this from the generic fade and is also what
  // keeps §8 satisfied — the band paints complete without JS, and GSAP only
  // ever applies the hidden state at runtime, inside useLayoutEffect, so there
  // is no flash of finished content before it plays.
  //
  // The beats overlap rather than queue. First movement is at 0.06s and the
  // headline is legible by ~0.5s, so the band never reads as *waiting*; the
  // photograph keeps easing out of its 1.06 scale underneath for a full 1.3s,
  // which is where the unhurried feel comes from. Perceived speed is set by
  // the first beat, not the last.
  //
  // Keyed to activeTab because this is the tab-switch transition, not the
  // scroll arrival — the band arriving as a whole is SectionReveal's job, on
  // the same curve as the two bands below it.
  useGSAP(
    () =>
      withReducedMotion(
        () => {
          const items = gsap.utils.toArray<HTMLElement>(
            featuresRef.current?.children ?? []
          );
          const marks = items
            .map((li) => li.querySelector('svg'))
            .filter((el): el is SVGSVGElement => el !== null);

          const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            delay: 0.06,
          });

          // The photograph settles for the whole beat under everything else.
          tl.fromTo(
            '[data-card-media]',
            { scale: 1.06, clipPath: 'inset(0% 0% 0% 14%)' },
            {
              scale: 1,
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.3,
              ease: 'power2.out',
              clearProps: 'clipPath,transform',
            },
            0
          )
            // Editorial mask reveal: the line rides up from under its own
            // overflow-hidden wrapper rather than fading on the spot.
            .fromTo(
              '[data-card-title]',
              { yPercent: 115 },
              {
                yPercent: 0,
                duration: 0.85,
                ease: 'power4.out',
                clearProps: 'transform',
              },
              0.16
            )
            .fromTo(
              '[data-card-lede]',
              { clipPath: 'inset(0% 100% 0% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 0.7,
                clearProps: 'clipPath',
              },
              0.28
            )
            .fromTo(
              '[data-card-rule]',
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 0.8,
                ease: 'power2.inOut',
                clearProps: 'transform',
              },
              0.34
            )
            .fromTo(
              '[data-card-label]',
              { clipPath: 'inset(0% 100% 0% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 0.5,
                clearProps: 'clipPath',
              },
              0.46
            );

          // Highlights keep the slow, one-at-a-time cadence: stagger is ~73%
          // of duration, so each line all but finishes before the next starts.
          if (items.length) {
            tl.fromTo(
              items,
              { clipPath: 'inset(0% 100% 0% 0%)', x: -20 },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                x: 0,
                duration: 0.75,
                stagger: 0.55,
                clearProps: 'clipPath,transform',
              },
              0.59
            ).fromTo(
              marks,
              { scale: 0, rotate: -120 },
              {
                scale: 1,
                rotate: 0,
                duration: 0.5,
                stagger: 0.55,
                ease: 'back.out(3)',
                clearProps: 'transform',
              },
              0.84
            );
          }

          tl.fromTo(
            '[data-card-action]',
            { yPercent: 60, clipPath: 'inset(0% 0% 100% 0%)' },
            {
              yPercent: 0,
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 0.7,
              stagger: 0.1,
              clearProps: 'clipPath,transform',
            },
            0.76
          );
        },
        () => {
          gsap.set(
            [
              '[data-card-media]',
              '[data-card-title]',
              '[data-card-lede]',
              '[data-card-rule]',
              '[data-card-label]',
              '[data-card-action]',
            ],
            { clearProps: 'clipPath,transform' }
          );
          const items = featuresRef.current?.children;
          if (items?.length) {
            gsap.set(items, { clearProps: 'clipPath,transform' });
          }
        }
      ),
    { scope: containerRef, dependencies: [activeTab], revertOnUpdate: true }
  );

  return (
    <section
      ref={containerRef}
      id="services-section"
      className="relative w-full min-h-125 sm:min-h-150 flex items-center justify-center overflow-hidden bg-ean-navy select-none"
    >
      {/*
        Parallax background container, the same construction as VIPSection and
        CharterSection. This band used to be a paper section with the
        photograph boxed into a hairline card, which put a bordered inset
        between two full-bleed photo bands and broke the run of three. The
        photograph is the ground now.

        Only the inner media div is keyed, so the wrapper the parallax tween
        owns survives a tab change.
      */}
      <div ref={bgRef} className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none">
        <div key={`${activeService.slug}-bg`} data-card-media className="absolute inset-0">
          <Image
            src={activeService.image}
            alt={`${activeService.name} at EAN Aviation`}
            fill
            sizes="100vw"
            priority={false}
            quality={80}
            className="object-cover"
            style={{ objectPosition: activeService.imagePosition ?? '50% 50%' }}
          />
        </div>
        {/*
          Two layers: a flat scrim, then a left-weighted ramp for the copy
          column. The flat layer is 25% rather than the VIP band's 45% because
          it dims the whole frame uniformly and was the layer flattening these
          photographs; the ramp does the contrast work instead.

          The ramp is carried further across than VIP's — 65% at 55% against
          its 35% at the midpoint — because this band drives seven photographs
          rather than one, and several put a bright region (overcast sky, apron
          concrete, a white fuselage) exactly where the text column sits. The
          stop is pushed to 55% to land past the max-w-2xl measure's right edge,
          which on a 1160px container sits at ~52-56% of the viewport.

          Measured against the 95th-percentile luminance inside the text column
          on all seven images, this composite is equal or fractionally darker
          than the 45/80-55-10 pair it replaces at every point across the
          column, so no photograph loses white-text contrast; past the measure
          it lifts the subject to 123-152% of the light it used to show.

          Five of the seven still fall short of 4.5:1 for white body copy at
          their worst column pixel (3.3-4.3:1) — a shortfall inherited from the
          previous values, not introduced here. It wants per-image
          `imagePosition` tuning, not a heavier scrim.
        */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/65 via-55% to-transparent" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 max-w-ean mx-auto px-6 md:px-8 py-20 sm:py-24 w-full">
        {/*
          Full-bleed photo band: the longest travel and slowest curve on the
          site. These sections are a single statement laid over a photograph
          that is already moving under parallax, so the copy has to arrive on a
          slower curve than the card grids or it reads as a second scroll effect
          rather than a sequence.

          The marked blocks are the header, the tab strip and the copy column.
          The showcase timeline above drives the elements *inside* the column,
          so the two never animate the same property on the same node.
        */}
        <SectionReveal stagger={0.14} distance={48} duration={1.1} ease="power3.out">
          {/* Section Header */}
          <div
            data-reveal
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10"
          >
            <div className="flex items-center gap-2">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/70 uppercase">
                Our Services
              </span>
              <span className="inline-block w-8 h-px bg-white/40" />
            </div>

            <div className="shrink-0">
              <Link
                href={`/services#${activeService.slug}`}
                className="group font-ui text-sm font-semibold text-white hover:text-white/70 flex items-center gap-1.5 transition-colors duration-300"
              >
                <span>View All Services</span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>

          {/*
            Horizontal Service Tabs Bar. The chips drew in tokens while this
            section sat on paper; on a photograph there is no token for type
            over an image (§5), so the resting chip is a white hairline over a
            translucent white wash. The active one keeps the brand-blue pill,
            which is the fill GoldButton already lands on this ground.
          */}
          <div
            ref={tabsRef}
            data-reveal
            className="relative flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none border-b border-white/15"
          >
            {/* Single gold pill that glides to whichever tab is active */}
            <span
              aria-hidden="true"
              className={`${isPillAnimated ? 'ean-indicator' : ''} absolute left-0 top-0 bg-ean-gold shadow-lg pointer-events-none`}
              style={{
                width: pill?.width ?? 0,
                height: pill?.height ?? 0,
                transform: `translate(${pill?.left ?? 0}px, ${pill?.top ?? 0}px)`,
                opacity: pill ? 1 : 0,
              }}
            />

            {SERVICES_DATA.map((srv, idx) => {
              const IconComp = ICON_MAP[srv.iconName as keyof typeof ICON_MAP] || Plane;
              const isActive = activeTab === idx;

              return (
                <button
                  key={srv.slug}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  onClick={() => setActiveTab(idx)}
                  className={`relative z-10 flex items-center gap-2.5 px-5 py-3 font-ui text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'text-ean-text-dark font-semibold'
                      : 'text-white/70 hover:text-white bg-white/10 border border-white/25 hover:bg-white/20 hover:border-white/50'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <IconComp size={16} className={isActive ? 'text-ean-text-dark' : 'text-white/70'} />
                    <span>{srv.tabLabel || srv.name}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Service Showcase — the same left column as the two bands
              below it: statement headline, lede, operational highlights,
              action bar, all inside one max-w-2xl measure. */}
          <div
            data-reveal
            className="max-w-2xl text-left space-y-6 sm:space-y-8 pt-10 sm:pt-12"
          >
            <div className="space-y-3">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-[1.15] overflow-hidden pb-1 -mb-1">
                <span data-card-title className="block">
                  {activeService.name}
                </span>
              </h2>

              <p
                data-card-lede
                className="font-ui text-base sm:text-lg text-white/70 leading-relaxed"
              >
                {activeService.short}
              </p>
            </div>

            {/* Highlights Feature Grid, matching VIPSection */}
            <div className="space-y-3">
              <span
                data-card-rule
                className="block h-px w-full bg-white/15 origin-left mb-6"
              />
              <span
                data-card-label
                className="font-ui text-xs font-bold tracking-wider text-white/80 uppercase block"
              >
                Operational Highlights
              </span>
              <ul
                ref={featuresRef}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 font-ui text-sm sm:text-base text-white font-medium"
              >
                {activeService.features.slice(0, 2).map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 sm:gap-3">
                    <CheckCircle2 className="w-4.5 h-4.5 text-white shrink-0 mt-0.5" />
                    <span className="leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                data-card-action
                href={activeService.primaryButtonHref || `/contact?service=${activeService.slug}`}
              >
                <GoldButton className="w-full sm:w-auto">
                  <span>{activeService.primaryButtonText || 'Inquire With Operations'}</span>
                  <ChevronRight size={16} />
                </GoldButton>
              </Link>
              {/* Secondary action only where the service defines one. There used
                  to be a "Full Specifications" fallback to /services#slug in this
                  slot; it was removed, so the five services without their own
                  secondary text now show a single primary button. The section
                  header still links through to /services. */}
              {activeService.secondaryButtonText && (
                <Link
                  data-card-action
                  href={activeService.secondaryButtonHref || `/contact?service=${activeService.slug}&action=quote`}
                >
                  <OutlineButton variant="photo" className="w-full sm:w-auto">
                    {activeService.secondaryButtonText}
                  </OutlineButton>
                </Link>
              )}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
