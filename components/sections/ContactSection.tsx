'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import GoldButton from '@/components/shared/GoldButton';
import SectionReveal from '@/components/shared/SectionReveal';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Parallax effect on contact section background
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
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="contact-section"
      className="relative w-full min-h-120 sm:min-h-137.5 flex items-center justify-center overflow-hidden bg-ean-navy select-none"
    >
      {/* Background with Parallax */}
      <div ref={bgRef} className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none">
        <Image
          src="/images/contact-cta.png"
          alt="EAN Aviation premium helicopter on pad at dusk"
          fill
          sizes="100vw"
          priority={false}
          quality={90}
          className="object-cover object-center"
        />
        {/* Luxury overlays for text visibility */}
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-black/75" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-20 text-center w-full">
        <SectionReveal>
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 flex flex-col items-center">
            <div className="space-y-3">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Elevate Your Journey
              </span>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium text-white leading-[1.15]">
                Experience the Pinnacle of Business Aviation
              </h2>
            </div>

            <p className="font-ui text-base sm:text-lg text-ean-muted-light max-w-2xl leading-relaxed">
              Connect with our dedicated services team today to plan your charter flight, secure FBO
              ground handling in Lagos, or discuss aircraft fleet solutions.
            </p>

            <div className="pt-4">
              <Link href="/contact">
                <GoldButton className="px-10 py-4 shadow-[0_4px_20px_rgba(196,149,42,0.35)] hover:shadow-[0_4px_30px_rgba(196,149,42,0.55)]">
                  Get in Touch
                </GoldButton>
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
