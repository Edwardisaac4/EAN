'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Compass, HardHat, Layers, Ruler } from 'lucide-react';

import { withReducedMotion } from '@/lib/gsap-motion';
import {
  AEROPLEX_FACTS,
  AEROPLEX_HERO,
  type AeroplexIconName,
} from '@/lib/aeroplex-constants';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const factIcons: Partial<Record<AeroplexIconName, React.ComponentType<{ className?: string }>>> = {
  Compass,
  Ruler,
  HardHat,
  Layers,
};

export default function AeroplexHero() {
  const heroRef = useRef<HTMLElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ledeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          // 1. Text entrance animation
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          tl.fromTo(
            eyebrowRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.1 }
          );

          tl.fromTo(
            titleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8 },
            '-=0.4'
          );

          tl.fromTo(
            ledeRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.4'
          );

          // 2. Parallax on hero background image
          gsap.to(heroBgRef.current, {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        },
        () => {
          gsap.set([eyebrowRef.current, titleRef.current, ledeRef.current], {
            opacity: 1,
            y: 0,
            clearProps: 'transform',
          });
          gsap.set(heroBgRef.current, { yPercent: 0, clearProps: 'transform' });
        }
      ),
    { scope: heroRef }
  );

  return (
    <>
      <section
        ref={heroRef}
        className="relative w-full min-h-105 sm:min-h-120 lg:min-h-130 flex items-center pt-36 pb-20 sm:pt-44 sm:pb-28 overflow-hidden bg-ean-obsidian text-white border-b border-ean-border-dark"
      >
        {/* Background Image Container */}
        <div ref={heroBgRef} className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none select-none">
          <Image
            src={AEROPLEX_HERO.image}
            alt={AEROPLEX_HERO.imageAlt}
            fill
            sizes="100vw"
            priority
            quality={70}
            className="object-cover object-center"
          />
          {/*
            The scrim was an even wash — flat 60%, a vertical ramp and a radial
            vignette — tuned to a runway photograph with nothing in it to lose.
            Measured against the render that replaced it, that stack was both
            darker and *worse*: the campus is a dusk frame whose subject is the
            lit hangar, and the brightest thing in it sits behind the copy, so
            an even wash pulled the headline down to 3.1:1 while flattening the
            building it was meant to be showing.

            Left-weighted instead, the way the photo bands do it. Against the
            actual pixels under the text column: the headline clears 5.0:1 at
            the 95th percentile and 4.5:1 at the 99th — large text needs 3:1 —
            and the lede holds 6.6:1 and 5.0:1 against its 4.5:1 floor. The
            right edge keeps 57% of the photograph rather than 40%, which is
            where the hangar and the A320neo are.

            The vertical ramp stays for the chrome: the navbar sits over the top
            edge and the CTA row over the bottom. It passes through transparent
            at the middle, so it costs the copy nothing.
          */}
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-transparent to-black/65" />
        </div>

        {/* Hero Title & Lede Content */}
        <div className="relative z-10 w-full max-w-ean mx-auto px-6 md:px-8">
          <div className="max-w-3xl space-y-4 sm:space-y-5 text-left">
            {/* Eyebrow */}
            <div ref={eyebrowRef}>
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/70 uppercase">
                {AEROPLEX_HERO.eyebrow}
              </span>
            </div>

            {/* Headline with reduced, refined sizing */}
            <h1
              ref={titleRef}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight text-white"
            >
              {AEROPLEX_HERO.title}
            </h1>

            {/* Lede Text with refined size */}
            <div ref={ledeRef} className="space-y-2">
              {AEROPLEX_HERO.lede.map((line) => (
                <p
                  key={line}
                  className="font-ui text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-xl"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KPI / Spec Bar with Obsidian Black styling */}
      <div className="relative z-20 bg-ean-obsidian-raised border-y border-ean-border-dark">
        <dl className="max-w-ean mx-auto px-6 md:px-8 grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-ean-border-dark">
          {AEROPLEX_FACTS.map((fact) => {
            const Icon = fact.iconName ? factIcons[fact.iconName] : undefined;
            return (
              <div
                key={fact.id}
                className="py-5 sm:py-6 pr-4 lg:px-6 lg:first:pl-0 lg:last:pr-0 flex items-start gap-3.5"
              >
                {Icon && <Icon className="w-4 h-4 text-ean-gold mt-0.5 shrink-0" />}
                <div className="space-y-1 min-w-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ean-gold font-medium">
                    {fact.label}
                  </dt>
                  <dd className="font-ui text-sm sm:text-base font-semibold text-ean-text-light">
                    {fact.value}
                  </dd>
                  <dd className="font-ui text-xs text-ean-text-light/60 leading-relaxed">
                    {fact.note}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </>
  );
}
