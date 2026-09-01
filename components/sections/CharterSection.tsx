'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { withReducedMotion } from '@/lib/gsap-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import GoldButton from '@/components/shared/GoldButton';
import SectionReveal from '@/components/shared/SectionReveal';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CharterSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          // Parallax effect on background image
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
      id="charter-section"
      className="relative w-full min-h-125 sm:min-h-150 flex items-center justify-center overflow-hidden bg-ean-navy"
    >
      {/* Parallax Background Container */}
      <div ref={bgRef} className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none">
        <Image
          src="/images/charter-cabin.jpg"
          alt="EAN Aviation premium private jet cabin interior"
          fill
          sizes="100vw"
          priority={false}
          quality={80}
          className="object-cover object-center"
        />
        {/* Luxury Overlay Gradients for Readability */}
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/40 to-transparent" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 max-w-ean mx-auto px-6 md:px-8 py-20 w-full">
        <SectionReveal>
          <div className="max-w-2xl text-left space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/70 uppercase">
                Bespoke Flight Solutions
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-[1.15]">
                Charters Tailored to Your Schedule
              </h2>
            </div>

            <p className="font-ui text-base sm:text-lg text-white/70 leading-relaxed">
              Fly to your own schedule. Whether for business or leisure, our
              on-demand jet and helicopter charter services offer flexibility, privacy, and
              uncompromising safety standards across regional and international routes.
            </p>

            <div className="pt-2">
              <Link href="/charter">
                <GoldButton className="shadow-[0_4px_15px_rgba(43,0,152,0.3)] hover:shadow-[0_4px_25px_rgba(43,0,152,0.5)]">
                  Request a Charter
                </GoldButton>
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
