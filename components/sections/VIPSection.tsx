'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { withReducedMotion } from '@/lib/gsap-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CheckCircle2 } from 'lucide-react';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';
import SectionReveal from '@/components/shared/SectionReveal';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const VIP_FEATURES = [
  'Private VIP Terminal Access',
  'Customs & Immigration Assistance, On-Site',
];

export default function VIPSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          // Parallax effect on background image matching CharterSection
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

  return (
    <section
      ref={containerRef}
      id="vip-section"
      className="relative w-full min-h-125 sm:min-h-150 flex items-center justify-center overflow-hidden bg-ean-navy select-none"
    >
      {/* Parallax Background Container with light luxury overlay */}
      <div ref={bgRef} className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none">
        <Image
          src="/images/vip-lounge.jpg"
          alt="EAN Aviation premium airport terminal VIP lounge"
          fill
          sizes="100vw"
          priority={false}
          quality={85}
          className="object-cover object-center"
        />
        {/* Subtle black overlay so the lounge imagery remains luminous while text is legible */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/35 to-transparent" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 max-w-ean mx-auto px-6 md:px-8 py-20 sm:py-24 w-full">
        {/*
          Full-bleed photo band: the longest travel and slowest curve on the
          site. These sections are a single statement laid over a photograph
          that is already moving under parallax, so the copy has to arrive on a
          slower curve than the card grids or it reads as a second scroll effect
          rather than a sequence.
        */}
        <SectionReveal stagger={0.14} distance={48} duration={1.1} ease="power3.out">
          <div className="max-w-2xl text-left space-y-6 sm:space-y-8">
            <div data-reveal className="space-y-3">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-white uppercase">
                VIP Terminal Experience
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-[1.15]">
                {"Lagos Airport's"} Premier Dedicated VIP Terminal
              </h2>
            </div>

            {/* Highlights Feature Grid matching ServicesSection */}
            <div data-reveal className="space-y-3">
              <span className="block h-px w-full bg-white/15 origin-left mb-6" />
              <span className="font-ui text-xs font-bold tracking-wider text-white/80 uppercase block">
                Operational Highlights
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 font-ui text-sm sm:text-base text-white font-medium">
                {VIP_FEATURES.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 sm:gap-3">
                    <CheckCircle2 className="w-4.5 h-4.5 text-white shrink-0 mt-0.5" />
                    <span className="leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Bar */}
            <div data-reveal className="pt-2 flex flex-wrap items-center gap-4">
              <Link href="/services/vip-lounge">
                <GoldButton>
                  Explore VIP Experience
                </GoldButton>
              </Link>
              <Link href="/contact?service=vip-lounge">
                <OutlineButton variant="photo">
                  Inquire With Concierge
                </OutlineButton>
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
