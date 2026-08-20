'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Sparkles,
} from 'lucide-react';

import { SERVICES_DATA } from '@/lib/constants';
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
  const ActiveIcon = ICON_MAP[activeService.iconName as keyof typeof ICON_MAP] || Plane;

  return (
    <section
      ref={containerRef}
      id="services-section"
      className="bg-linear-to-b from-ean-burgundy-dusk via-ean-burgundy-dark to-ean-burgundy-mid text-white py-20 sm:py-24 relative overflow-hidden border-y border-white/10 select-none"
    >
      {/* Subtle Ambient Radial Gold Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-180 h-180 rounded-full bg-ean-gold/5 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Our Capabilities
              </span>
              <span className="inline-block w-8 h-px bg-ean-gold/40" />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-light text-white leading-[1.15]">
              Six Service Lines from One Lagos Base
            </h2>
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
            className="relative flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none border-b border-white/10"
          >
            {/* Single gold pill that glides to whichever tab is active */}
            <span
              aria-hidden="true"
              className={`${isPillAnimated ? 'ean-indicator' : ''} absolute left-0 top-0 bg-ean-gold rounded-xs shadow-lg pointer-events-none`}
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
                  className={`relative z-10 flex items-center gap-2.5 px-5 py-3 rounded-xs font-ui text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'text-ean-navy font-semibold'
                      : 'text-ean-muted-light hover:text-white bg-ean-navy-mid/70 border border-white/10 hover:border-white/25'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <IconComp size={16} className={isActive ? 'text-ean-navy' : 'text-ean-gold'} />
                    <span>{srv.tabLabel || srv.name}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Service Showcase Spotlight (White Container Box) */}
          <div className="bg-white border-t-4 border-t-ean-navy border-x border-b border-slate-200 rounded-xs overflow-hidden shadow-2xl p-6 sm:p-10 lg:p-12 relative text-slate-900">
            {/* Keying on the slug replays the CSS enter animation per service */}
            <div
              key={activeService.slug}
              className="ean-enter-up grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              {/* Left Column: Details & Capabilities */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs font-bold tracking-widest text-ean-navy bg-ean-navy/10 border border-ean-navy/20 px-3 py-1 rounded-xs uppercase">
                    {activeService.eyebrow || `0${activeTab + 1} / 0${SERVICES_DATA.length}`}
                  </span>
                  {activeService.stats?.[0] && (
                    <span className="font-ui text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xs flex items-center gap-1.5">
                      <Sparkles size={12} className="text-ean-navy" />
                      <span>{activeService.stats[0]}</span>
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-ean-text-dark leading-tight">
                    {activeService.name}
                  </h3>
                  <p className="font-ui text-base sm:text-lg text-slate-600 leading-relaxed">
                    {activeService.extendedDescription || activeService.short}
                  </p>
                </div>

                {/* Features Grid */}
                <div className="border-t border-slate-200 pt-6 space-y-3">
                  <span className="font-ui text-xs font-bold tracking-wider text-ean-navy uppercase block">
                    Operational Highlights
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-ui text-sm text-slate-800">
                    {activeService.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-ean-navy shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Bar */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link href={activeService.primaryButtonHref || `/contact?service=${activeService.slug}`}>
                    <GoldButton className="w-full sm:w-auto">
                      <span>{activeService.primaryButtonText || 'Inquire With Operations'}</span>
                      <ChevronRight size={16} />
                    </GoldButton>
                  </Link>
                  {activeService.secondaryButtonText ? (
                    <Link href={activeService.secondaryButtonHref || `/contact?service=${activeService.slug}&action=quote`}>
                      <OutlineButton variant="light" className="w-full sm:w-auto">
                        {activeService.secondaryButtonText}
                      </OutlineButton>
                    </Link>
                  ) : (
                    <Link href={`/services#${activeService.slug}`}>
                      <OutlineButton variant="light" className="w-full sm:w-auto">
                        Full Specifications
                      </OutlineButton>
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Column: Visual Showcase */}
              <div className="lg:col-span-5 relative">
                <div className="relative h-72 sm:h-96 lg:h-112 w-full rounded-xs overflow-hidden border border-slate-200 shadow-xl group">
                  <Image
                    src={activeService.image}
                    alt={`${activeService.name} visual`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover transition-transform duration-750 group-hover:scale-105"
                    quality={80}
                    loading="lazy"
                  />
                  {/* Soft Shadow Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-ean-black/80 via-ean-black/20 to-transparent" />

                  {/* Top Icon Badge - Crisp White Glass */}
                  <div className="absolute top-4 left-4 p-3.5 bg-white/95 border border-slate-200 text-ean-navy rounded-xs shadow-md backdrop-blur-xs">
                    <ActiveIcon size={24} />
                  </div>

                  {/* Bottom Status Pill - Crisp White Glass */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 border border-slate-200 backdrop-blur-xs p-3 rounded-xs flex items-center justify-between text-xs font-ui shadow-lg">
                    <span className="text-slate-900 font-semibold truncate">{activeService.name}</span>
                    <span className="flex items-center gap-1.5 text-ean-navy shrink-0 font-mono text-[10px] uppercase font-bold tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      24/7 Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
