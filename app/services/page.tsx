'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { 
  Plane, 
  Wrench, 
  BadgeCheck, 
  UtensilsCrossed, 
  Star, 
  Building2, 
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import SectionReveal from '@/components/shared/SectionReveal';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Map Lucide icons dynamically
const iconMap = {
  Plane: Plane,
  Wrench: Wrench,
  BadgeCheck: BadgeCheck,
  UtensilsCrossed: UtensilsCrossed,
  Star: Star,
  Building2: Building2,
};

import { SERVICES_DATA } from '@/lib/constants';

// Bento grid custom cell configurations for desktop
const bentoConfigs: Record<string, {
  gridClass: string;
  cardType: 'wide' | 'tall' | 'square';
}> = {
  'fbo-ground-support': {
    gridClass: 'lg:col-span-2 lg:row-span-1',
    cardType: 'wide',
  },
  'aircraft-maintenance': {
    gridClass: 'lg:col-span-1 lg:row-span-1',
    cardType: 'square',
  },
  'aircraft-sales-charter': {
    gridClass: 'lg:col-span-1 lg:row-span-2',
    cardType: 'tall',
  },
  'wings-catering': {
    gridClass: 'lg:col-span-1 lg:row-span-1',
    cardType: 'square',
  },
  'vip-lounge': {
    gridClass: 'lg:col-span-1 lg:row-span-1',
    cardType: 'square',
  },
  'leased-offices': {
    gridClass: 'lg:col-span-2 lg:row-span-1',
    cardType: 'wide',
  },
};

export default function ServicesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
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
    { scope: heroRef }
  );

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col select-none">
        {/* SECTION 1: Cinematic Header */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-20 bg-gradient-to-b from-[#3B0913] via-[#24060E] to-[#1A0409] border-b border-white/10 overflow-hidden text-white"
        >
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 rounded-full bg-ean-gold/5 blur-[130px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-center space-y-4">
            <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase block">
              What We Do
            </span>
            <h1
              ref={titleRef}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-light text-white leading-tight opacity-0"
            >
              Services Crafted For Distinction
            </h1>
            <p
              ref={subtitleRef}
              className="font-ui text-base sm:text-lg text-ean-muted-light max-w-2xl mx-auto leading-relaxed opacity-0"
            >
              From direct airport tarmac handling and certified engineering to exclusive distributor operations, EAN Aviation delivers precision at every flight level.
            </p>
          </div>
        </section>

        {/* SECTION 2: Our Services Showcase Grid */}
        <section className="bg-ean-surface text-ean-text-dark py-20 sm:py-24 border-b border-ean-border-light/60 relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-ean-gold/10 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
            <SectionReveal className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase block">
                Bespoke Offerings
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-light text-ean-navy leading-tight">
                Our Services at a Glance
              </h2>
              <p className="font-ui text-base sm:text-lg text-ean-muted-dark leading-relaxed">
                Explore EAN&apos;s full spectrum of specialized business aviation solutions. Select any service to inquire with our operations desk.
              </p>
            </SectionReveal>

            {/* Bento Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 lg:auto-rows-[minmax(0,1fr)]">
              {SERVICES_DATA.map((srv, idx) => {
                const Icon = iconMap[srv.iconName];
                const config = bentoConfigs[srv.slug] || { gridClass: 'lg:col-span-1 lg:row-span-1', cardType: 'square' };
                
                // Card #1 is image-right on desktop, Card #6 is image-left on desktop
                const isImageRight = srv.slug === 'fbo-ground-support';

                return (
                  <SectionReveal key={srv.slug} id={srv.slug} className={`h-full scroll-mt-28 ${config.gridClass}`}>
                    {config.cardType === 'wide' && (
                      <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`relative bg-gradient-to-b from-[#2D0710] via-[#1E050B] to-[#140307] border border-ean-gold/30 hover:border-ean-gold rounded-xs flex flex-col ${
                          isImageRight ? 'lg:flex-row-reverse' : 'lg:flex-row'
                        } h-full group transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-ean-gold/10 overflow-hidden`}
                      >
                        {/* Image Section */}
                        <div className="relative h-52 sm:h-60 lg:h-auto lg:w-1/2 overflow-hidden shrink-0 min-h-[220px]">
                          <Image
                            src={srv.image}
                            alt={`${srv.name} preview`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover transition-transform duration-750 group-hover:scale-105"
                            quality={90}
                          />
                          <div
                            className={`absolute inset-0 bg-gradient-to-t ${
                              isImageRight
                                ? 'lg:bg-gradient-to-l from-[#1E050B]/85 via-[#1E050B]/30 to-transparent'
                                : 'lg:bg-gradient-to-r from-[#1E050B]/85 via-[#1E050B]/30 to-transparent'
                            }`}
                          />
                        </div>

                        {/* Card Body */}
                        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6 lg:w-1/2 relative z-10">
                          {/* Header row: Icon & Number Badge */}
                          <div className="flex items-center justify-between">
                            <div className="p-3 bg-[#22060D]/90 border border-white/20 text-ean-gold rounded-xs shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-ean-gold group-hover:bg-ean-gold/10">
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="font-mono text-xs font-bold tracking-widest text-ean-gold bg-[#22060D]/90 border border-white/20 px-3 py-1 rounded-xs uppercase backdrop-blur-xs">
                              0{idx + 1}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {srv.stats?.[0] && (
                              <div className="inline-flex items-center gap-1.5 font-ui text-[11px] font-medium text-ean-gold bg-ean-gold/10 border border-ean-gold/25 px-2.5 py-0.5 rounded-xs">
                                <Sparkles size={12} className="shrink-0" />
                                <span>{srv.stats[0]}</span>
                              </div>
                            )}
                            <Link href={`/services/${srv.slug}`} className="block">
                              <h3 className="font-display text-2xl sm:text-3xl font-light text-white hover:text-ean-gold transition-colors duration-300 tracking-wide">
                                {srv.name}
                              </h3>
                            </Link>
                            <p className="font-ui text-sm text-ean-muted-light leading-relaxed">
                              {srv.extendedDescription || srv.short}
                            </p>

                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-white/10 pt-4 font-ui text-xs text-ean-muted-light">
                              {srv.features.map((feat, fIdx) => (
                                <li key={fIdx} className="flex gap-2 items-center">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-ean-gold shrink-0" />
                                  <span className="truncate">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                            <Link 
                              href={`/services/${srv.slug}`}
                              className="text-xs font-semibold uppercase tracking-wider text-ean-muted-light hover:text-white transition-colors"
                            >
                              <span>View Details</span>
                            </Link>
                            <Link 
                              href={`/contact?service=${srv.slug}`} 
                              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ean-gold hover:text-ean-gold-light group/link"
                            >
                              <span>Inquire</span>
                              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {config.cardType === 'tall' && (
                      <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative bg-gradient-to-b from-[#2D0710] via-[#1E050B] to-[#140307] border border-ean-gold/30 hover:border-ean-gold rounded-xs flex flex-col justify-between h-full group transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-ean-gold/10 overflow-hidden min-h-[500px] lg:min-h-full"
                      >
                        {/* Background Image */}
                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                          <Image
                            src={srv.image}
                            alt={`${srv.name} background`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-750 group-hover:scale-105"
                            quality={90}
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-[#1E050B]/75 via-[#1E050B]/90 to-[#140307]" />
                        </div>

                        {/* Card Content */}
                        <div className="relative z-10 p-6 sm:p-8 flex-1 flex flex-col justify-between h-full space-y-8">
                          <div className="flex justify-between items-center">
                            <div className="p-3 bg-[#22060D]/90 border border-white/20 text-ean-gold rounded-xs shadow-md backdrop-blur-xs transition-all duration-300 group-hover:scale-105 group-hover:border-ean-gold">
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="font-mono text-xs font-bold tracking-widest text-ean-gold bg-[#22060D]/90 border border-white/20 px-3 py-1 rounded-xs uppercase backdrop-blur-xs">
                              0{idx + 1}
                            </span>
                          </div>

                          <div className="space-y-4 pt-6">
                            <div className="space-y-1.5">
                              <span className="font-ui text-[10px] font-bold tracking-[0.2em] text-ean-gold uppercase block">
                                Featured Acquisition & Charter
                              </span>
                              <Link href={`/services/${srv.slug}`} className="block">
                                <h3 className="font-display text-2xl sm:text-3xl font-light text-white hover:text-ean-gold transition-colors duration-300 tracking-wide leading-tight">
                                  {srv.name}
                                </h3>
                              </Link>
                            </div>
                            <p className="font-ui text-sm text-ean-muted-light leading-relaxed">
                              {srv.extendedDescription || srv.short}
                            </p>

                            <ul className="space-y-2.5 border-t border-white/10 pt-4 font-ui text-xs text-ean-muted-light">
                              {srv.features.map((feat, fIdx) => (
                                <li key={fIdx} className="flex gap-2.5 items-center">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-ean-gold shrink-0" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                            <Link 
                              href={`/services/${srv.slug}`}
                              className="text-xs font-semibold uppercase tracking-wider text-ean-muted-light hover:text-white transition-colors"
                            >
                              <span>View Details</span>
                            </Link>
                            <Link 
                              href={`/contact?service=${srv.slug}`} 
                              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ean-gold hover:text-ean-gold-light group/link"
                            >
                              <span>Inquire</span>
                              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {config.cardType === 'square' && (
                      <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="bg-gradient-to-b from-[#2D0710] via-[#1E050B] to-[#140307] border border-ean-gold/30 hover:border-ean-gold rounded-xs flex flex-col justify-between h-full group transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-ean-gold/10 overflow-hidden"
                      >
                        {/* Card Image */}
                        <div className="relative h-48 w-full overflow-hidden shrink-0">
                          <Image
                            src={srv.image}
                            alt={`${srv.name} preview`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-750 group-hover:scale-105"
                            quality={90}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#140307] via-[#1E050B]/40 to-transparent" />
                          <div className="absolute top-4 right-4 font-mono text-xs font-bold tracking-widest text-ean-gold bg-[#22060D]/90 border border-white/20 px-3 py-1 rounded-xs uppercase backdrop-blur-xs">
                            0{idx + 1}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6 relative">
                          {/* Floating Icon Container */}
                          <div className="absolute -top-5 left-6 p-3 bg-black/85 border border-white/20 text-ean-gold rounded-xs shadow-md z-10 transition-all duration-300 group-hover:scale-105 group-hover:border-ean-gold group-hover:bg-ean-gold/10">
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="space-y-4 pt-2">
                            <Link href={`/services/${srv.slug}`} className="block">
                              <h3 className="font-display text-xl sm:text-2xl font-medium text-white hover:text-ean-gold transition-colors duration-300 tracking-wide">
                                {srv.name}
                              </h3>
                            </Link>
                            <p className="font-ui text-sm text-ean-muted-light leading-relaxed">
                              {srv.short}
                            </p>

                            <ul className="space-y-2 border-t border-white/10 pt-4 font-ui text-xs text-ean-muted-light">
                              {srv.features.slice(0, 3).map((feat, fIdx) => (
                                <li key={fIdx} className="flex gap-2 items-center">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-ean-gold shrink-0" />
                                  <span className="truncate">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                            <Link 
                              href={`/services/${srv.slug}`}
                              className="text-xs font-semibold uppercase tracking-wider text-ean-muted-light hover:text-white transition-colors"
                            >
                              <span>View Details</span>
                            </Link>
                            <Link 
                              href={`/contact?service=${srv.slug}`} 
                              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ean-gold hover:text-ean-gold-light group/link"
                            >
                              <span>Inquire</span>
                              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </SectionReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Space offset for the grids footer */}
        <div className="h-16 lg:h-24 bg-ean-surface" />

        {/* SECTION 4: Bespoke CTA Banner */}
        <section className="bg-linear-to-r from-ean-navy to-ean-navy-mid py-20 sm:py-24 relative overflow-hidden border-t border-ean-border-dark">
          {/* Golden glow */}
          <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-ean-gold/5 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-center">
            <SectionReveal className="max-w-3xl mx-auto space-y-8">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Bespoke Flight Solutions
              </span>
              <h2 className="font-display text-4xl sm:text-6xl font-light text-white leading-tight">
                Design Your Flight Parameters
              </h2>
              <p className="font-ui text-base sm:text-lg md:text-xl text-ean-muted-light max-w-2xl mx-auto leading-relaxed">
                Connect directly with our corporate operations team to draft custom flight schedules, secure airport ground clearances, or inspect MMIA hangar leases.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/charter">
                  <GoldButton className="w-full sm:w-auto">
                    Submit Charter Brief
                  </GoldButton>
                </Link>
                <Link href="/contact">
                  <OutlineButton variant="dark" className="w-full sm:w-auto">
                    Speak With Concierge
                  </OutlineButton>
                </Link>
              </div>
            </SectionReveal>
          </div>
        </section>
      </main>
    </>
  );
}
