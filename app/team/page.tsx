'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { withReducedMotion } from '@/lib/gsap-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Users } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import SectionReveal from '@/components/shared/SectionReveal';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';

import CeoSpotlight from '@/components/team/CeoSpotlight';
import TeamDirectoryGrid from '@/components/team/TeamDirectoryGrid';

import { TEAM_MEMBERS } from '@/lib/constants';

// Register GSAP plugins at the file level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TeamPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const ceoMember = TEAM_MEMBERS[0];

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          // 1. Text entrance animations in Hero using GSAP timeline
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

          // 3. Scroll indicator pulse animation
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

      <main className="flex-1 flex flex-col bg-ean-black text-white">
        {/* SECTION 1: Obsidian Black Cinematic Hero */}
        <section
          ref={heroRef}
          className="relative w-full h-[75vh] min-h-125 overflow-hidden bg-[#08080a] flex items-center text-white border-b border-white/10"
        >
          {/* Parallax Background */}
          <div ref={heroBgRef} className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none">
            <Image
              src="/images/contact-cta.jpg"
              alt="EAN Aviation executive personnel at runway sunset"
              fill
              sizes="100vw"
              priority
              className="object-cover object-center"
              quality={80}
            />
            {/* Cinematic Obsidian Black luxury overlays */}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-linear-to-b from-[#08080a]/80 via-transparent to-[#08080a]/90" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/60" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full pt-20">
            <div className="max-w-3xl space-y-6">
              <p
                ref={eyebrowRef}
                className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-ean-gold" />
                Leadership & Governance
              </p>
              <h1
                ref={titleRef}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1]"
              >
                The Minds Behind the Mission
              </h1>
              <p
                ref={subtitleRef}
                className="font-ui text-base sm:text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed"
              >
                Meet the seasoned aviation executives, captains, and engineers steering EAN Aviation toward new frontiers of growth, safety, and operational precision in West Africa.
              </p>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div
            ref={scrollIndicatorRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => {
              const ceoSection = document.getElementById('ceo-spotlight');
              ceoSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="font-ui text-[9px] uppercase tracking-[0.3em] text-white/60">
              Meet Leadership
            </span>
            <ChevronDown className="w-5 h-5 text-ean-gold" />
          </div>
        </section>

        {/* SECTION 2: Obsidian Black & Deep Burgundy CEO Spotlight */}
        <div id="ceo-spotlight">
          <CeoSpotlight ceoMember={ceoMember} />
        </div>

        {/* SECTION 3: Warm Light Surface Directory Grid (High Contrast Visual Break) */}
        <TeamDirectoryGrid members={TEAM_MEMBERS} />

        {/* SECTION 4: Gold & Onyx Executive Call to Action */}
        <section className="bg-linear-to-r from-ean-burgundy-night via-ean-burgundy-dusk to-ean-black py-20 sm:py-24 relative overflow-hidden border-t border-white/10">
          <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-ean-gold/10 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-center">
            <SectionReveal className="max-w-3xl mx-auto space-y-8">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Work With EAN Leadership
              </span>
              <h2 className="font-display text-4xl sm:text-6xl font-light text-white leading-tight">
                Designed for Distinction
              </h2>
              <p className="font-ui text-base sm:text-lg md:text-xl text-ean-muted-light max-w-2xl mx-auto leading-relaxed">
                Connect directly with our department heads to coordinate jet charters, hangar space, aircraft maintenance, or corporate travel logistics.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/contact?service=charter">
                  <GoldButton className="w-full sm:w-auto">
                    Request a Charter Quote
                  </GoldButton>
                </Link>
                <Link href="/contact">
                  <OutlineButton variant="dark" className="w-full sm:w-auto">
                    Speak With Executive Office
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
