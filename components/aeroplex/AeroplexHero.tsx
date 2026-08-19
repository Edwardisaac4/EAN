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
        className="relative w-full h-[76vh] min-h-130 max-h-180 overflow-hidden bg-[#08080a] flex items-end text-white"
      >
        {/* Background Image Container */}
        <div ref={heroBgRef} className="absolute inset-0 w-full h-[118%] top-[-9%] select-none">
          <Image
            src={AEROPLEX_HERO.image}
            alt={AEROPLEX_HERO.imageAlt}
            fill
            sizes="100vw"
            priority
            quality={85}
            className="object-cover object-center"
          />
          {/* Obsidian black overlays matching reference */}
          <div className="absolute inset-0 bg-linear-to-t from-[#08080a] via-[#08080a]/75 via-40% to-black/35" />
          <div className="absolute inset-0 bg-linear-to-r from-[#08080a]/92 via-[#08080a]/55 to-transparent" />
        </div>

        {/* Hero Title & Lede Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 pb-12 sm:pb-14">
          <div className="max-w-2xl space-y-5">
            {/* Eyebrow */}
            <div ref={eyebrowRef}>
              <span className="font-ui text-xs font-semibold tracking-[0.25em] text-ean-gold uppercase">
                {AEROPLEX_HERO.eyebrow}
              </span>
            </div>

            {/* Headline with reduced, refined sizing */}
            <h1
              ref={titleRef}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-light leading-[1.08] tracking-tight text-white"
            >
              {AEROPLEX_HERO.title}
            </h1>

            {/* Lede Text with refined size */}
            <div ref={ledeRef} className="space-y-1 pt-0.5">
              {AEROPLEX_HERO.lede.map((line) => (
                <p
                  key={line}
                  className="font-ui text-sm sm:text-base md:text-lg text-white/80 leading-relaxed max-w-xl"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KPI / Spec Bar with Obsidian Black styling */}
      <div className="relative z-20 bg-[#0a0a0d] border-y border-white/10">
        <dl className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
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
                  <dd className="font-ui text-sm sm:text-base font-semibold text-white">
                    {fact.value}
                  </dd>
                  <dd className="font-ui text-xs text-white/60 leading-relaxed">
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
