'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
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
import StatCounter from '@/components/shared/StatCounter';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';

// Register GSAP plugins at the file level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

import { 
  VALUE_PILLARS, 
  CREDENTIAL_ITEMS 
} from '@/lib/constants';

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
    { scope: heroRef }
  );



  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col select-none">
        {/* SECTION 1: Cinematic Hero */}
        <section
          ref={heroRef}
          className="relative w-full h-[75vh] min-h-125 overflow-hidden bg-ean-navy flex items-center text-white"
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
                Credentials & Legacy
              </p>
              <h1
                ref={titleRef}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1] opacity-0"
              >
                Pioneering Aviation Excellence
              </h1>
              <p
                ref={subtitleRef}
                className="font-ui text-base sm:text-lg md:text-xl text-ean-muted-light max-w-2xl leading-relaxed opacity-0"
              >
                For over a decade, EAN Aviation has defined business flight in West Africa, 
                combining state-of-the-art infrastructure with an unyielding commitment to luxury and safety.
              </p>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div
            ref={scrollIndicatorRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer opacity-0"
            onClick={() => {
              const statsSection = document.getElementById('stats-section');
              statsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="font-ui text-[9px] uppercase tracking-[0.3em] text-ean-muted-light">
              Discover EAN
            </span>
            <ChevronDown className="w-5 h-5 text-ean-gold" />
          </div>
        </section>

        {/* SECTION 2: Luxury Executive Metrics Cards */}
        <section
          id="stats-section"
          className="bg-ean-surface text-ean-text-dark py-16 sm:py-20 relative z-20 border-y border-ean-border-light/60 shadow-xs"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <SectionReveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {/* Metric Card 1 */}
                <div className="relative group overflow-hidden rounded-xs border border-ean-border-light bg-white p-8 hover:border-ean-gold transition-all duration-500 shadow-md hover:shadow-lg">
                  <div className="absolute inset-0 bg-linear-to-br from-ean-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 space-y-3 text-center md:text-left">
                    <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-ean-gold tracking-tight">
                      <StatCounter targetValue={15} suffix="+" />
                    </div>
                    <div className="font-ui text-sm font-semibold uppercase tracking-wider text-ean-navy">
                      Years of Operation
                    </div>
                    <p className="font-ui text-xs text-ean-muted-dark leading-relaxed">
                      Pioneering business aviation excellence at Murtala Muhammed International Airport since 2011.
                    </p>
                  </div>
                </div>

                {/* Metric Card 2 */}
                <div className="relative group overflow-hidden rounded-xs border border-ean-border-light bg-white p-8 hover:border-ean-gold transition-all duration-500 shadow-md hover:shadow-lg">
                  <div className="absolute inset-0 bg-linear-to-br from-ean-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 space-y-3 text-center md:text-left">
                    <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-ean-gold tracking-tight">
                      <StatCounter targetValue={100} suffix="%" />
                    </div>
                    <div className="font-ui text-sm font-semibold uppercase tracking-wider text-ean-navy">
                      Safety Audit Record
                    </div>
                    <p className="font-ui text-xs text-ean-muted-dark leading-relaxed">
                      Flawless operational compliance under NCAA, ICAO, and international flight safety standards.
                    </p>
                  </div>
                </div>

                {/* Metric Card 3 */}
                <div className="relative group overflow-hidden rounded-xs border border-ean-border-light bg-white p-8 hover:border-ean-gold transition-all duration-500 shadow-md hover:shadow-lg">
                  <div className="absolute inset-0 bg-linear-to-br from-ean-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 space-y-3 text-center md:text-left">
                    <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-ean-gold tracking-tight">
                      1st
                    </div>
                    <div className="font-ui text-sm font-semibold uppercase tracking-wider text-ean-navy">
                      Integrated FBO Hangar
                    </div>
                    <p className="font-ui text-xs text-ean-muted-dark leading-relaxed">
                      West Africa’s first fully integrated private terminal, VIP lounge, and maintenance hub.
                    </p>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>





        {/* SECTION 4: Core Pillars (Service, Safety, Precision, Leadership) */}
        <section className="bg-ean-navy-mid text-white py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Core Principles
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-light text-white leading-tight">
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
                    <motion.div
                      whileHover={{ y: -6, boxShadow: '0 10px 30px rgba(196, 149, 42, 0.1)' }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="h-full bg-ean-navy/40 border border-white/5 hover:border-ean-gold/30 p-8 rounded-xs backdrop-blur-xs flex flex-col justify-between transition-colors duration-300"
                    >
                      <div className="space-y-6">
                        <div className="w-12 h-12 rounded-xs bg-ean-gold/10 flex items-center justify-center text-ean-gold border border-ean-gold/20">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <h3 className="font-ui text-lg font-semibold text-white tracking-wide">
                          {pillar.title}
                        </h3>
                        <p className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>
                    </motion.div>
                  </SectionReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 5: Credentials & Infrastructure Grid */}
        <section className="bg-ean-surface text-ean-text-dark py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Infrastructure
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-medium text-ean-navy leading-tight">
                Our Regional Capabilities
              </h2>
              <p className="font-ui text-base sm:text-lg text-ean-muted-dark leading-relaxed">
                We back our luxury service with physical infrastructure and certified authority, providing robust support right on the tarmac.
              </p>
            </SectionReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {CREDENTIAL_ITEMS.map((item, idx) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                return (
                  <SectionReveal key={idx}>
                    <div className="bg-ean-white border border-ean-border-light/60 p-8 sm:p-10 rounded-xs shadow-xs flex gap-6 items-start hover:shadow-md transition-all duration-300 h-full">
                      <div className="p-3 bg-ean-navy/5 text-ean-navy rounded-xs border border-ean-navy/10 shrink-0">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-ui text-lg font-semibold text-ean-navy">
                          {item.title}
                        </h3>
                        <p className="font-ui text-sm sm:text-base text-ean-muted-dark leading-relaxed">
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
        <section className="bg-ean-surface text-ean-text-dark py-20 sm:py-24 relative overflow-hidden border-t border-ean-border-light/60">
          {/* Subtle ambient blur light source in corner */}
          <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-ean-gold/10 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-center">
            <SectionReveal className="max-w-3xl mx-auto space-y-8">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Experience EAN Aviation
              </span>
              <h2 className="font-display text-4xl sm:text-6xl font-light text-ean-navy leading-tight">
                Elevate Your Journey
              </h2>
              <p className="font-ui text-base sm:text-lg md:text-xl text-ean-muted-dark max-w-2xl mx-auto leading-relaxed">
                Whether you require bespoke private jet charters, helicopter acquisition, or premium flight support at Murtala Muhammed Airport, our crew is ready to execute.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/charter">
                  <GoldButton className="w-full sm:w-auto">
                    Request a Charter Quote
                  </GoldButton>
                </Link>
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
