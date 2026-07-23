'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import StatCounter from '@/components/shared/StatCounter';
import TimelineEventModal from '@/components/history/TimelineEventModal';

// Register GSAP plugins at the file level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

import { TIMELINE_EVENTS, TimelineEvent } from '@/lib/constants';
import OutlineButton from '@/components/shared/OutlineButton';
import GoldButton from '@/components/shared/GoldButton';

export default function HistoryPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);

  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  useGSAP(
    () => {
      // 1. Text animations in Hero
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.2 }
      );

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.4'
      );

      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      );

      // 2. Parallax scroll effect on Hero background image
      gsap.to(heroBgRef.current, {
        yPercent: 25,
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
    { scope: heroRef }
  );

  useGSAP(
    () => {
      const container = timelineContainerRef.current;
      const track = horizontalScrollRef.current;
      if (!container || !track) return;

      const getDistance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, {
        x: () => -getDistance(),
        ease: 'none',
      });

      if (progressLineRef.current) {
        tl.to(
          progressLineRef.current,
          { width: '100%', ease: 'none' },
          0
        );
      }

      // Refresh after mount so measurements settle
      const t = setTimeout(() => ScrollTrigger.refresh(), 100);
      return () => clearTimeout(t);
    },
    { scope: timelineContainerRef }
  );

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col select-none">
        {/* SECTION 1: Cinematic Hero */}
        <section
          ref={heroRef}
          className="relative w-full h-[55vh] min-h-100 overflow-hidden bg-ean-navy flex items-center text-white"
        >
          {/* Parallax Background */}
          <div ref={heroBgRef} className="absolute inset-0 w-full h-[120%] top-[-10%]">
            <Image
              src="/images/about-jet.png"
              alt="EAN Aviation premium private jet inside MMIA hangar at sunset"
              fill
              sizes="100vw"
              priority
              className="object-cover"
              quality={95}
            />
            {/* Immersive overlay gradient (radial + linear dark wash) */}
            <div className="absolute inset-0 bg-linear-to-t from-ean-navy via-ean-navy/60 to-ean-navy/40" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-ean-navy/40 to-ean-navy/90" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full pt-20">
            <div className="max-w-3xl space-y-6">
              <p
                ref={eyebrowRef}
                className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase opacity-0"
              >
                Our Legacy
              </p>
              <h1
                ref={titleRef}
                className="font-display text-4xl sm:text-5xl md:text-6xl font-light text-white leading-[1.1] opacity-0"
              >
                The Evolution of Excellence
              </h1>
              <p
                ref={subtitleRef}
                className="font-ui text-base sm:text-lg text-ean-muted-light max-w-2xl leading-relaxed opacity-0"
              >
                A decade of pushing boundaries, elevating safety records, and creating a world-class business aviation hub in West Africa.
              </p>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div
            ref={scrollIndicatorRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer opacity-0"
            onClick={() => {
              const timelineSection = document.getElementById('timeline-section');
              timelineSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="font-ui text-[9px] uppercase tracking-[0.3em] text-ean-muted-light">
              Explore History
            </span>
            <ChevronDown className="w-5 h-5 text-ean-gold" />
          </div>
        </section>

        {/* SECTION 2: Metrics Strip */}
        <section
          className="bg-ean-surface text-ean-text-dark border-y border-ean-border-light/60 py-12 relative z-20"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-2 border-r last:border-r-0 border-ean-border-light">
                <div className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ean-gold tracking-tight">
                  <StatCounter targetValue={15} suffix="+" />
                </div>
                <p className="font-ui text-[10px] sm:text-xs uppercase tracking-widest text-ean-muted-dark">
                  Years of Operation
                </p>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-2 border-r last:border-r-0 border-ean-border-light">
                <div className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ean-gold tracking-tight">
                  <StatCounter targetValue={100} suffix="%" />
                </div>
                <p className="font-ui text-[10px] sm:text-xs uppercase tracking-widest text-ean-muted-dark">
                  Safety Audit Record
                </p>
              </div>

              <div className="flex flex-col items-center justify-center space-y-2 border-r last:border-r-0 border-ean-border-light">
                <div className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ean-gold tracking-tight">
                  <span>1st</span>
                </div>
                <p className="font-ui text-[10px] sm:text-xs uppercase tracking-widest text-ean-muted-dark">
                  Integrated FBO Hangar
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: IMMERSIVE HORIZONTAL TIMELINE */}
        <div>
          <section
            ref={timelineContainerRef}
            id="timeline-section"
            className="relative w-full h-screen flex flex-col justify-between py-12 md:py-16 overflow-hidden bg-ean-surface text-ean-text-dark border-b border-ean-border-light/60"
          >
            
            {/* Top Header */}
            <div className="max-w-7xl mx-auto px-6 md:px-8 w-full flex flex-col sm:flex-row items-baseline justify-between gap-4 select-none">
              <div className="space-y-1">
                <span className="font-ui text-xs font-semibold tracking-[0.25em] text-ean-gold uppercase">
                  Our History
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-light text-ean-navy leading-tight">
                  The Milestones of Flight
                </h2>
              </div>
              <div className="font-display text-2xl font-light text-ean-gold/60 flex items-center gap-3">
                <span className="text-ean-navy text-4xl font-semibold">2009</span>
                <span>/</span>
                <span>2026</span>
              </div>
            </div>

            {/* Horizontal Timeline Track */}
            <div className="relative w-full max-w-7xl mx-auto px-6 md:px-8 h-1 bg-ean-navy/10 my-4 select-none">
              <div
                ref={progressLineRef}
                className="absolute left-0 top-0 h-full bg-ean-gold"
                style={{ width: '0%' }}
              />
            </div>

            {/* Scrolling slides container */}
            <div
              ref={horizontalScrollRef}
              className="flex flex-row items-center gap-6 sm:gap-12 px-[6vw] sm:px-[10vw] lg:px-[15vw] h-[68vh] sm:h-[55vh]"
            >
              {TIMELINE_EVENTS.map((event, idx) => {
                const img = event.image || '/images/about-jet.png';

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedEvent(event)}
                    className="history-slide w-[85vw] sm:w-[65vw] lg:w-[50vw] shrink-0 bg-white border border-ean-border-light p-4 sm:p-8 rounded-xs flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch shadow-xl h-[56vh] sm:h-[46vh] lg:h-[48vh] relative overflow-hidden group hover:border-ean-gold/60 transition-all duration-300 cursor-pointer"
                  >
                    {/* Background giant year number */}
                    <div className="absolute -bottom-6 -right-6 font-display text-[120px] sm:text-[150px] lg:text-[200px] font-bold text-ean-navy/5 pointer-events-none select-none group-hover:text-ean-gold/10 transition-colors duration-500">
                      {event.year}
                    </div>

                    {/* Image Section (Top on mobile, Right on desktop) */}
                    <div className="relative w-full sm:w-[45%] h-44 sm:h-full rounded-xs overflow-hidden border border-ean-border-light shrink-0 order-first sm:order-last">
                      <Image
                        src={img}
                        alt={event.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 30vw, 25vw"
                        className="object-cover object-center transition-transform duration-750 group-hover:scale-105"
                        quality={95}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:from-white/70" />
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-ean-navy/90 backdrop-blur-xs text-[9px] sm:text-[10px] font-mono text-ean-gold uppercase tracking-wider rounded-xs z-10">
                        Click to Read Story
                      </div>
                    </div>

                    {/* Content Section (Bottom on mobile, Left on desktop) */}
                    <div className="flex-1 space-y-2 sm:space-y-3 z-10 text-left flex flex-col justify-between order-last sm:order-first">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ean-gold tracking-tight">
                            {event.year}
                          </span>
                          {event.category && (
                            <span className="px-2 py-0.5 bg-ean-navy/5 border border-ean-navy/10 text-[9px] font-mono text-ean-navy font-bold uppercase tracking-wider rounded-xs">
                              {event.category}
                            </span>
                          )}
                        </div>
                        <h3 className="font-ui text-base sm:text-xl font-semibold text-ean-navy group-hover:text-ean-gold transition-colors duration-300 line-clamp-2 sm:line-clamp-none">
                          {event.title}
                        </h3>
                        <p className="font-ui text-xs sm:text-sm text-ean-muted-dark leading-relaxed line-clamp-3">
                          {event.description}
                        </p>
                      </div>

                      {/* Read Full Story Action Prompt */}
                      <div className="pt-1 sm:pt-2 flex items-center gap-1.5 font-ui text-xs font-bold text-ean-navy group-hover:text-ean-gold transition-colors">
                        <span>Read Full Milestone Story</span>
                        <ChevronRight className="w-4 h-4 text-ean-gold transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom scroll hint */}
            <div className="font-ui text-[10px] text-center uppercase tracking-widest text-ean-muted-dark select-none flex items-center justify-center gap-2">
              <span>Scroll down to slide through time</span>
              <span>•</span>
              <span className="text-ean-gold font-bold">Click any milestone to view full narrative</span>
            </div>
          </section>
        </div>

        {/* SECTION 4: Premium Call to Action */}
        <section className="bg-linear-to-r from-ean-navy to-ean-navy-mid py-20 sm:py-24 relative overflow-hidden border-t border-ean-border-dark">
          <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-ean-gold/5 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Experience EAN Aviation
              </span>
              <h2 className="font-display text-4xl sm:text-6xl font-light text-white leading-tight">
                Pioneering the Skies of West Africa
              </h2>
              <p className="font-ui text-base sm:text-lg md:text-xl text-ean-muted-light max-w-2xl mx-auto leading-relaxed">
                Connect with our legacy. Secure direct airport handling, schedule executive jet charters, or inspect our MRO hangars at Lagos.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/contact">
                  <GoldButton className="w-full sm:w-auto">
                    Contact Us
                  </GoldButton>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Interactive Full Milestone Story Modal */}
      <TimelineEventModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}

