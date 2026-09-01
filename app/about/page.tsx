'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ShieldCheck, 
  Crown, 
  Clock, 
  Globe,
  Award,
  CheckCircle2,
  MapPin,
  Building2,
  ChevronDown
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import SectionReveal from '@/components/shared/SectionReveal';
import OutlineButton from '@/components/shared/OutlineButton';
import { withReducedMotion } from '@/lib/gsap-motion';
import {
  VALUE_PILLARS,
  CREDENTIAL_ITEMS,
  TRUST_STATS
} from '@/lib/constants';

// Register GSAP plugins at the file level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const iconMap = {
  ShieldCheck,
  Crown,
  Clock,
  Globe,
  Award,
  CheckCircle2,
  MapPin,
  Building2,
};

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* SECTION 1: Cinematic Hero */}
        <section
          ref={heroRef}
          className="relative w-full min-h-105 sm:min-h-120 lg:min-h-130 flex items-center pt-36 pb-20 sm:pt-44 sm:pb-28 overflow-hidden bg-ean-obsidian text-white border-b border-ean-border-dark"
        >
          {/* Parallax Background */}
          <div ref={heroBgRef} className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none">
            <Image
              src="/images/hero/slide-2.jpg"
              alt="EAN Aviation executive private aircraft on the ramp at Lagos"
              fill
              sizes="100vw"
              priority
              className="object-cover"
              quality={80}
            />
            {/* Cinematic Obsidian Black luxury overlays */}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-linear-to-b from-black/80 via-transparent to-black/90" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/60" />
          </div>

          <div className="relative z-10 max-w-ean mx-auto px-6 md:px-8 w-full">
            <div className="max-w-3xl space-y-4 sm:space-y-5 text-left">
              <p
                ref={eyebrowRef}
                className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/70 uppercase"
              >
                Credentials & Legacy
              </p>
              <h1
                ref={titleRef}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-[1.1] tracking-tight"
              >
                Pioneering Aviation Excellence
              </h1>
              <p
                ref={subtitleRef}
                className="font-ui text-base sm:text-lg md:text-xl text-white/80 max-w-xl leading-relaxed"
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

        {/* SECTION 4: Core Pillars (Service, Safety, Precision, Leadership) */}
        <section className="bg-ean-navy-mid text-ean-text-light py-20 sm:py-24">
          <div className="max-w-ean mx-auto px-6 md:px-8">
            <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Core Principles
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-light text-ean-text-light leading-tight">
                Defining the EAN Standard
              </h2>
              <p className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
                Our operations are governed by four non-negotiable principles, ensuring every charter, maintenance operation, and FBO handling exceeds industry norms.
              </p>
            </SectionReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {VALUE_PILLARS.map((pillar, idx) => {
                const IconComponent = iconMap[pillar.icon as keyof typeof iconMap];
                return (
                  <SectionReveal key={idx}>
                    <div
                      className="h-full bg-ean-navy/40 border border-ean-border-dark hover:border-ean-gold/30 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(43,0,152,0.1)] p-8 backdrop-blur-xs flex flex-col justify-between transition-[border-color,transform,box-shadow] duration-300 ease-out"
                    >
                      <div className="space-y-6">
                        <div className="w-12 h-12 bg-ean-gold/10 flex items-center justify-center text-ean-gold border border-ean-gold/20">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <h3 className="font-ui text-lg font-semibold text-ean-text-light tracking-wide">
                          {pillar.title}
                        </h3>
                        <p className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  </SectionReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 5: Credentials & Infrastructure Grid */}
        <section className="bg-ean-surface text-ean-text-light py-20 sm:py-24">
          <div className="max-w-ean mx-auto px-6 md:px-8">
            <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Infrastructure
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-medium text-ean-text-light leading-tight">
                Our Regional Capabilities
              </h2>
              <p className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
                We back our service with physical infrastructure and certified authority, providing direct support right on the tarmac.
              </p>
            </SectionReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {CREDENTIAL_ITEMS.map((item, idx) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                return (
                  <SectionReveal key={idx}>
                    <div className="bg-ean-white border border-ean-border-light/60 p-8 sm:p-10 shadow-xs flex gap-6 items-start hover:shadow-md transition-all duration-300 h-full">
                      <div className="p-3 bg-black/5 text-ean-text-light border border-black/10 shrink-0">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-ui text-lg font-semibold text-ean-text-light">
                          {item.title}
                        </h3>
                        <p className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </SectionReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 7: Premium Call to Action */}
        <section className="bg-ean-surface text-ean-text-light py-20 sm:py-24 relative overflow-hidden border-t border-ean-border-light/60">

          <div className="max-w-ean mx-auto px-6 md:px-8 relative z-10 text-center">
            <SectionReveal className="max-w-3xl mx-auto space-y-8">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Experience EAN Aviation
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-light text-ean-text-light leading-tight">
                Elevate Your Journey
              </h2>
              <p className="font-ui text-base sm:text-lg md:text-xl text-ean-muted-light max-w-2xl mx-auto leading-relaxed">
                Whether you require bespoke private jet charters, helicopter acquisition, or premium flight support at Murtala Muhammed Airport, our crew is ready to execute.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/contact">
                  <OutlineButton variant="light" className="w-full sm:w-auto">
                    Contact Our Office
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
