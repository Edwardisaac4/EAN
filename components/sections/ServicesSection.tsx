'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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

  const activeService = SERVICES_DATA[activeTab] || SERVICES_DATA[0];
  const ActiveIcon = ICON_MAP[activeService.iconName as keyof typeof ICON_MAP] || Plane;

  return (
    <section
      ref={containerRef}
      id="services-section"
      className="bg-gradient-to-b from-[#2B050D] via-[#180408] to-[#2D0710] text-white py-20 sm:py-24 relative overflow-hidden border-y border-white/10 select-none"
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
              World-Class Aviation Solutions
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
          <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none border-b border-white/10">
            {SERVICES_DATA.map((srv, idx) => {
              const IconComp = ICON_MAP[srv.iconName as keyof typeof ICON_MAP] || Plane;
              const isActive = activeTab === idx;

              return (
                <button
                  key={srv.slug}
                  onClick={() => setActiveTab(idx)}
                  className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xs font-ui text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'text-ean-navy font-semibold'
                      : 'text-ean-muted-light hover:text-white bg-[#2D0710]/70 border border-white/10 hover:border-white/25'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-service-pill"
                      className="absolute inset-0 bg-ean-gold rounded-xs shadow-lg"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <IconComp size={16} className={isActive ? 'text-ean-navy' : 'text-ean-gold'} />
                    <span>{srv.name}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Service Showcase Spotlight (White Container Box) */}
          <div className="bg-white border-t-4 border-t-[#4A0D1A] border-x border-b border-slate-200 rounded-xs overflow-hidden shadow-2xl p-6 sm:p-10 lg:p-12 relative text-slate-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                {/* Left Column: Details & Capabilities */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold tracking-widest text-[#4A0D1A] bg-[#4A0D1A]/10 border border-[#4A0D1A]/20 px-3 py-1 rounded-xs uppercase">
                      0{activeTab + 1} / 0{SERVICES_DATA.length}
                    </span>
                    {activeService.stats?.[0] && (
                      <span className="font-ui text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xs flex items-center gap-1.5">
                        <Sparkles size={12} className="text-[#4A0D1A]" />
                        <span>{activeService.stats[0]}</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-[#2A070E] leading-tight">
                      {activeService.name}
                    </h3>
                    <p className="font-ui text-base sm:text-lg text-slate-600 leading-relaxed">
                      {activeService.extendedDescription || activeService.short}
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="border-t border-slate-200 pt-6 space-y-3">
                    <span className="font-ui text-xs font-bold tracking-wider text-[#4A0D1A] uppercase block">
                      Operational Highlights
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-ui text-sm text-slate-800">
                      {activeService.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#4A0D1A] shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <Link href={`/contact?service=${activeService.slug}`}>
                      <GoldButton className="w-full sm:w-auto">
                        Inquire With Operations
                        <ChevronRight size={16} />
                      </GoldButton>
                    </Link>
                    <Link href={`/services#${activeService.slug}`}>
                      <OutlineButton variant="light" className="w-full sm:w-auto">
                        Full Specifications
                      </OutlineButton>
                    </Link>
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
                      quality={95}
                      priority
                    />
                    {/* Soft Shadow Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0204]/80 via-[#0D0204]/20 to-transparent" />

                    {/* Top Icon Badge - Crisp White Glass */}
                    <div className="absolute top-4 left-4 p-3.5 bg-white/95 border border-slate-200 text-[#4A0D1A] rounded-xs shadow-md backdrop-blur-xs">
                      <ActiveIcon size={24} />
                    </div>

                    {/* Bottom Status Pill - Crisp White Glass */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 border border-slate-200 backdrop-blur-xs p-3 rounded-xs flex items-center justify-between text-xs font-ui shadow-lg">
                      <span className="text-slate-900 font-semibold truncate">{activeService.name}</span>
                      <span className="flex items-center gap-1.5 text-[#4A0D1A] shrink-0 font-mono text-[10px] uppercase font-bold tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        24/7 Active
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
