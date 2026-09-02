'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, ChevronRight } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import SectionReveal from '@/components/shared/SectionReveal';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';
import { withReducedMotion } from '@/lib/gsap-motion';
import {
  VALUE_PILLARS,
  TRUST_STATS
} from '@/lib/constants';

// Register GSAP plugins at the file level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutPage() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaBgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          // 1. Text animations in Hero
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          tl.fromTo(
            eyebrowRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.2 }
          );

          tl.fromTo(
            titleRef.current,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.8 },
            '-=0.4'
          );

          tl.fromTo(
            subtitleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.5'
          );

          // 2. Parallax scroll effect on Hero background image
          gsap.to(heroBgRef.current, {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });

          // 3. Scroll indicator arrow pulse
          gsap.fromTo(
            scrollIndicatorRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 1, delay: 1, ease: 'power3.out' }
          );

          gsap.to(scrollIndicatorRef.current, {
            y: 6,
            repeat: -1,
            yoyo: true,
            duration: 1.2,
            ease: 'power1.inOut',
          });
        },
        () => {
          // No parallax, no infinite pulse. The hero copy no longer carries
          // opacity-0 in its markup, so this only has to neutralise transforms.
          gsap.set(
            [eyebrowRef.current, titleRef.current, subtitleRef.current, scrollIndicatorRef.current],
            { opacity: 1, y: 0, clearProps: 'transform' }
          );
          gsap.set(heroBgRef.current, { yPercent: 0, clearProps: 'transform' });
        }
      ),
    { scope: heroRef }
  );

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          gsap.to(ctaBgRef.current, {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        },
        () => {
          gsap.set(ctaBgRef.current, { yPercent: 0, clearProps: 'transform' });
        }
      ),
    { scope: ctaRef }
  );

  return (
    <>
      <Navbar hasPhotoHero />

      <main className="flex-1 flex flex-col">
        {/* SECTION 1: Cinematic Hero */}
        <section
          ref={heroRef}
          className="relative w-full min-h-[540px] sm:min-h-[620px] lg:min-h-[680px] flex items-center pt-36 pb-20 sm:pt-44 sm:pb-28 overflow-hidden bg-ean-obsidian text-white border-b border-ean-border-dark"
        >
          {/* Parallax Background */}
          <div ref={heroBgRef} className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none">
            <Image
              src="/images/Usage.jpg"
              alt="EAN Aviation aircraft operations, ramp handling and engineering excellence"
              fill
              sizes="100vw"
              priority
              className="object-cover object-[center_38%] sm:object-[center_35%]"
              quality={90}
            />
            {/* Soft, luminous overlays — lightened to keep the aircraft and lighting bright and vibrant */}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/65" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent w-full sm:w-3/4" />
          </div>

          <div className="relative z-10 max-w-ean mx-auto px-6 md:px-8 w-full">
            <div className="max-w-3xl space-y-4 sm:space-y-5 text-left drop-shadow-md">
              <p
                ref={eyebrowRef}
                className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/85 uppercase drop-shadow-sm"
              >
                Credentials & Legacy
              </p>
              <h1
                ref={titleRef}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-[1.1] tracking-tight drop-shadow-md"
              >
                Pioneering Aviation Excellence
              </h1>
              <p
                ref={subtitleRef}
                className="font-ui text-base sm:text-lg md:text-xl text-white/95 max-w-xl leading-relaxed drop-shadow-sm"
              >
                For over a decade, EAN Aviation has defined business flight in West Africa, 
                combining state-of-the-art infrastructure with an unyielding commitment to safety and precision.
              </p>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div
            ref={scrollIndicatorRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => {
              const statsSection = document.getElementById('stats-section');
              statsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="font-ui text-[9px] uppercase tracking-[0.3em] text-white/60">
              Discover EAN
            </span>
            <ChevronDown className="w-5 h-5 text-white/70" />
          </div>
        </section>

        {/* SECTION 2: Executive Metrics Cards */}
        <section
          id="stats-section"
          className="bg-ean-surface text-ean-text-light py-16 sm:py-20 relative z-20 border-y border-ean-border-light/60 shadow-xs"
        >
          <div className="max-w-ean mx-auto px-6 md:px-8">
            <SectionReveal>
              {/* Same four KPIs as the homepage band, from the same TRUST_STATS
                  array. Each card is the figure plus its sentence — the earlier
                  uppercase label row would only restate the sentence now that the
                  figures carry their own context. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {TRUST_STATS.map((stat) => (
                  <div
                    key={stat.figure}
                    className="relative group overflow-hidden border border-ean-border-light bg-white p-6 lg:p-8 hover:border-ean-gold transition-all duration-500 shadow-md hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-ean-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 space-y-3 text-center sm:text-left">
                      {/* Held below text-5xl until xl: four columns at lg leave
                          ~192px inside the padding, which "NCAA-AMO" fills at that
                          size. */}
                      <div className="font-display text-2xl sm:text-3xl xl:text-4xl font-light text-ean-gold tracking-tight">
                        {stat.figure}
                      </div>
                      <p className="font-ui text-sm text-ean-muted-light leading-relaxed">
                        {stat.description ?? stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionReveal>
          </div>
        </section>

        {/* SECTION 4: Core Principles & Pillars with Photo Hover Reveal */}
        <section className="bg-ean-navy-mid text-ean-text-light py-20 sm:py-24 border-t border-ean-border-dark">
          <div className="max-w-ean mx-auto px-6 md:px-8">
            <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4" stagger={0.1} distance={40} duration={1}>
              <span data-reveal className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Core Principles
              </span>
              <h2 data-reveal className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-ean-text-light leading-tight">
                Defining the EAN Standard
              </h2>
              <p data-reveal className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
                Our operations are governed by four non-negotiable principles, ensuring every charter, maintenance operation, and FBO handling exceeds industry norms.
              </p>
            </SectionReveal>

            {/* One trigger on the grid, then a diagonal sweep. One
                SectionReveal per pillar meant four private ScrollTriggers on the
                same `top 85%` line, so the row landed on a single frame. */}
            <SectionReveal
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
              stagger={0.06}
              grid
            >
              {VALUE_PILLARS.map((pillar, idx) => {
                const isExpanded = expandedCard === idx;
                return (
                  <div key={idx} data-reveal className="h-full">
                    <div
                      onClick={() => setExpandedCard((prev) => (prev === idx ? null : idx))}
                      className={`relative h-[450px] sm:h-[480px] lg:h-[510px] w-full overflow-hidden bg-ean-obsidian group cursor-pointer flex flex-col justify-between transition-all duration-500 ${
                        isExpanded
                          ? 'border border-blue-500/80 shadow-[0_20px_45px_rgba(43,0,152,0.45)]'
                          : 'border border-ean-border-dark hover:border-blue-500/80 hover:shadow-[0_20px_45px_rgba(43,0,152,0.45)]'
                      }`}
                    >
                      {/* Photo Background representing the Service/Pillar */}
                      <Image
                        src={pillar.image || '/images/about-jet.jpg'}
                        alt={`${pillar.title} - EAN Aviation`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className={`object-cover transition-transform duration-700 ease-out ${
                          isExpanded ? 'scale-105' : 'group-hover:scale-110'
                        }`}
                        quality={85}
                      />

                      {/* Base Luminous Vignette Overlay - lightened */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent z-10 transition-opacity duration-500" />

                      {/* Deep Royal Blue Luxury Backdrop on Hover / Tap Expansion */}
                      <div
                        className={`absolute inset-0 bg-[#080d28]/75 backdrop-blur-[2px] transition-opacity duration-500 z-10 ${
                          isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      />

                      {/* Vibrant Blue Radial Ambient Glow on Hover / Tap Expansion */}
                      <div
                        className={`absolute inset-0 bg-radial-at-t from-[#2b0098]/40 via-blue-900/10 to-transparent transition-opacity duration-700 z-10 pointer-events-none ${
                          isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      />

                      {/* Card Top: Glowing Minimal Accent */}
                      <div className="relative z-20 p-6 sm:p-7 flex items-center justify-end">
                        <div
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            isExpanded
                              ? 'bg-blue-400 shadow-[0_0_10px_#4a1fd0]'
                              : 'bg-white/30 group-hover:bg-blue-400 group-hover:shadow-[0_0_10px_#4a1fd0]'
                          }`}
                        />
                      </div>

                      {/* Card Bottom: Title, Desktop Hover Write-Up & In-Place Tap Expansion */}
                      <div className="relative z-20 mt-auto p-6 sm:p-7 space-y-2.5">
                        <span className="font-ui text-[11px] font-semibold tracking-[0.25em] text-blue-300 uppercase block">
                          Principle
                        </span>

                        <h3
                          className={`font-display text-2xl sm:text-2xl lg:text-[25px] font-light leading-tight transition-colors duration-300 ${
                            isExpanded ? 'text-blue-100' : 'text-white group-hover:text-blue-100'
                          }`}
                        >
                          {pillar.title}
                        </h3>

                        {/* Interactive Expanding Blue Accent Hairline */}
                        <div
                          className={`h-[2px] bg-blue-400 transition-all duration-500 ease-out ${
                            isExpanded
                              ? 'w-full bg-blue-300 shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                              : 'w-8 group-hover:w-full group-hover:bg-blue-300 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                          }`}
                        />

                        {/* Write-Up: Smoothly slides and expands on hover (desktop) OR when card is expanded (mobile) */}
                        <div
                          className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                            isExpanded
                              ? 'grid-rows-[1fr]'
                              : 'grid-rows-[0fr] sm:group-hover:grid-rows-[1fr]'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <p
                              className={`font-ui text-sm text-white/90 leading-relaxed pt-2 transition-opacity duration-500 delay-100 ${
                                isExpanded ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
                              }`}
                            >
                              {pillar.description}
                            </p>
                          </div>
                        </div>

                        {/* View Principle Action Link / CTA */}
                        <div className="pt-2 flex items-center justify-between text-blue-300 group-hover:text-blue-200 font-ui text-xs font-bold uppercase tracking-widest border-t border-white/15">
                          <span className="flex items-center gap-1.5">
                            {isExpanded ? 'Close Principle' : 'View Principle'}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 transform transition-transform duration-300 text-blue-300 ${
                              isExpanded ? 'rotate-90' : 'group-hover:translate-x-1.5'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </SectionReveal>
          </div>
        </section>

        {/* SECTION 5: Experience EAN Aviation CTA */}
        <section
          ref={ctaRef}
          className="relative w-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center justify-center overflow-hidden bg-ean-obsidian text-white border-t border-ean-border-dark"
        >
          {/* Parallax Background Container */}
          <div ref={ctaBgRef} className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none">
            <Image
              src="/images/about.jpg"
              alt="Experience EAN Aviation bespoke private jet operations and flight support"
              fill
              sizes="100vw"
              quality={80}
              className="object-cover object-center"
            />
            {/* Soft, balanced overlay so the aircraft, tarmac, and landscape remain bright and luminous */}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/15 to-black/55" />
          </div>

          <div className="relative z-10 max-w-ean mx-auto px-6 md:px-8 py-20 sm:py-28 text-center w-full">
            <SectionReveal className="max-w-3xl mx-auto space-y-7 drop-shadow-sm" stagger={0.14} distance={48} duration={1.1} ease="power3.out">
              <span data-reveal className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase inline-block">
                Experience EAN Aviation
              </span>
              <h2 data-reveal className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight drop-shadow-md">
                Elevate Your Journey
              </h2>
              <p data-reveal className="font-ui text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
                Whether you require bespoke private jet charters, helicopter acquisition, or premium flight support at Murtala Muhammed Airport, our crew is ready to execute.
              </p>
              <div data-reveal className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/contact" className="w-full sm:w-auto">
                  <GoldButton className="w-full sm:w-auto px-9 py-4">
                    Contact Our Office
                  </GoldButton>
                </Link>
                <Link href="/charter" className="w-full sm:w-auto">
                  <OutlineButton variant="photo" className="w-full sm:w-auto px-9 py-4">
                    Request a Charter
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
