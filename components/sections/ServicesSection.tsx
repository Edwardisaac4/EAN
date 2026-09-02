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
import { withReducedMotion } from '@/lib/gsap-motion';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';

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

  // One master timeline for the whole showcase, replacing the 0.35s
  // `ean-enter-up` fade the card used to get from CSS. Nothing here touches
  // opacity: every element arrives from behind a clip edge or from under a
  // mask, which is what separates this from the generic fade and is also what
  // keeps §8 satisfied — the card paints complete without JS, and GSAP only
  // ever applies the hidden state at runtime, inside useLayoutEffect, so there
  // is no flash of finished content before it plays.
  //
  // The beats overlap rather than queue. First movement is at 0.06s and the
  // headline is legible by ~0.5s, so the card never reads as *waiting*; the
  // photograph keeps easing out of its 1.06 scale underneath for a full 1.3s,
  // which is where the unhurried feel comes from. Perceived speed is set by
  // the first beat, not the last.
  //
  // Keyed to activeTab because the block is remounted per service, so every
  // ref and selector resolves to fresh nodes and the sequence has to replay.
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
              '[data-card-rule]',
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 0.8,
                ease: 'power2.inOut',
                clearProps: 'transform',
              },
              0.3
            )
            .fromTo(
              '[data-card-label]',
              { clipPath: 'inset(0% 100% 0% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 0.5,
                clearProps: 'clipPath',
              },
              0.42
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
              0.55
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
              0.8
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
            0.72
          );
        },
        () => {
          gsap.set(
            [
              '[data-card-media]',
              '[data-card-title]',
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
      className="bg-linear-to-b from-ean-obsidian-raised via-ean-obsidian to-ean-obsidian-elevated text-ean-text-light py-20 sm:py-24 relative overflow-hidden border-y border-ean-border-dark select-none"
    >

      <div className="max-w-ean mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Our Services
              </span>
              <span className="inline-block w-8 h-px bg-ean-gold/40" />
            </div>
          </div>

          <div className="shrink-0">
            <Link
              href={`/services#${activeService.slug}`}
              className="group font-ui text-sm font-semibold text-ean-gold hover:text-ean-gold-light flex items-center gap-1.5 transition-colors duration-300"
            >
              <span>View All Services</span>
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>

        {/* Interactive Services Explorer */}
        <div className="space-y-8">
          {/* Horizontal Service Tabs Bar */}
          <div
            ref={tabsRef}
            className="relative flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none border-b border-ean-border-dark"
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
                      : 'text-ean-muted-light hover:text-ean-blue-light bg-ean-obsidian-elevated/80 border border-ean-border-dark hover:border-ean-blue/50'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <IconComp size={16} className={isActive ? 'text-ean-text-dark' : 'text-ean-gold'} />
                    <span>{srv.tabLabel || srv.name}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Service Showcase — photograph as the card ground, content
              overlaid on a scrim (same treatment as CharterSection) */}
          <div className="relative overflow-hidden bg-ean-obsidian border-t border-t-ean-obsidian border-x border-b border-ean-border-dark min-h-125 sm:min-h-137 flex items-center">
            {/* Background photograph + readability scrim */}
            <div key={`${activeService.slug}-bg`} data-card-media className="absolute inset-0 pointer-events-none">
              <Image
                src={activeService.image}
                alt={`${activeService.name} visual`}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
                style={{ objectPosition: activeService.imagePosition ?? '50% 50%' }}
                quality={80}
                loading="lazy"
              />
              {/* One left-weighted ramp rather than a flat wash plus a ramp:
                  the flat layer was greying out the right half, where the
                  subject of every one of these photographs sits. Measured
                  against the actual pixels under the copy, this holds white
                  body text above 4.5:1 across the text column on all six
                  images — worst case 4.88:1, VIP Lounge under the second
                  bullet column — while leaving the right edge, where every
                  subject sits, at 85% of the photograph. */}
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/75 to-black/15" />
            </div>

            {/* Keying on the slug replays the CSS enter animation per service */}
            <div
              key={activeService.slug}
              className="relative z-10 w-full p-6 sm:p-10 lg:p-12"
            >
              <div className="max-w-2xl space-y-6">
                <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light text-white leading-tight overflow-hidden pb-1 -mb-1">
                  <span data-card-title className="block">
                    {activeService.name}
                  </span>
                </h3>

                {/* Features Grid */}
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
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-ui text-sm text-white"
                  >
                    {activeService.features.slice(0, 2).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4.5 h-4.5 text-white shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Bar */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
