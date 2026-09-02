'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { withReducedMotion } from '@/lib/gsap-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';
import { HERO_SLIDES } from '@/lib/constants';

// Register GSAP plugins at the file level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SLIDE_INTERVAL_MS = 9500;

// Written out as whole class strings, not composed from fragments — Tailwind
// scans source text, so a class it cannot read literally never reaches the CSS.
//
// A single clamp() replaces the five-stop responsive ramp these used to carry.
// The ceiling is deliberately low — the display face sets large for its
// nominal size, so the old ramp topped out far too big; clamp also tracks the
// viewport continuously instead of jumping at five breakpoints, which is what
// the prototype does.
const TITLE_SCALES = {
  default: 'text-[clamp(36px,5.6vw,68px)]',
  compact: 'text-[clamp(30px,4.4vw,52px)]',
} as const;

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Slides 2..n are withheld from the server HTML. They sit at inset-0 inside
  // the viewport, so `loading="lazy"` never defers them — the browser would
  // fetch every hero image before the LCP image finished. Mounting them after
  // hydration leaves the first paint competing with nothing.
  const [carouselReady, setCarouselReady] = useState(false);

  useEffect(() => {
    // Wait for idle so the remaining slides never contend with the LCP image.
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(() => setCarouselReady(true), {
        timeout: 2500,
      });
      return () => window.cancelIdleCallback(handle);
    }

    const timer = setTimeout(() => setCarouselReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDotClick = (index: number) => {
    if (index === currentSlide) return;
    setCurrentSlide(index);
  };

  // Auto-play timer that automatically resets on slide change, pausing on user hover
  useEffect(() => {
    if (!carouselReady || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [currentSlide, carouselReady, isPaused]);

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          const rafId = requestAnimationFrame(() => {
            if (!containerRef.current) return;
            // Parallax scroll across the whole background stack — one animated
            // element rather than one per slide.
            gsap.to(parallaxRef.current, {
              yPercent: 18,
              ease: 'none',
              scrollTrigger: {
                trigger: containerRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            });
          });

          return () => cancelAnimationFrame(rafId);
        },
        () => {
          gsap.set(parallaxRef.current, { yPercent: 0, clearProps: 'transform' });
        }
      ),
    { scope: containerRef }
  );

  // Slide CTAs carry their own destination. A hash stays on the homepage and
  // scrolls; anything else is a real route and must render as a <Link>, or the
  // destination is unreachable without JS and invisible to a crawler.
  const scrollToHash = (hash: string) => {
    const target = document.getElementById(hash.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const slide = HERO_SLIDES[currentSlide];
  const bulletItems =
    slide.bullets ??
    (slide.subtitle.includes(' · ')
      ? slide.subtitle
          .split(/\s*·\s*|\n/)
          .map((s) => s.trim())
          .filter(Boolean)
      : null);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-screen min-h-150 md:min-h-175 lg:min-h-190 overflow-hidden bg-ean-navy flex items-center select-none"
    >
      {/* Background Slides Container — single parallax layer */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none"
      >
        {HERO_SLIDES.map((s, idx) => {
          const isActive = idx === currentSlide;
          // The dots are clickable before idle fires, so gating purely on
          // `carouselReady` would unmount the very slide the visitor just
          // selected and leave the hero blank. Only non-selected slides wait.
          if (idx > 0 && !carouselReady && !isActive) return null;

          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${
                isActive ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div
                className={`relative w-full h-full transform-gpu transition-transform duration-[9500ms] ease-out ${
                  isActive ? 'scale-100' : 'scale-[1.035]'
                }`}
              >
                <Image
                  src={s.image}
                  alt={s.eyebrow}
                  fill
                  sizes="100vw"
                  priority={idx === 0}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  quality={70}
                  className="object-cover object-center"
                />
              </div>
            </div>
          );
        })}

        {/* Luminous overlays for high image visibility and clean text contrast */}
        <div className="absolute inset-0 z-2 bg-linear-to-r from-black/65 via-black/25 to-transparent" />
        <div className="absolute inset-0 z-2 bg-linear-to-t from-black/45 via-transparent to-black/35" />
      </div>

      {/* Main Content (Text Layer) */}
      <div className="relative z-10 max-w-ean mx-auto px-6 md:px-10 lg:px-12 w-full pt-20 sm:pt-22 md:pt-24 lg:pt-20 pb-12">
        {/* Keyed on the slide index so the CSS entrance replays on each change */}
        <div
          key={currentSlide}
          className="max-w-2xl lg:max-w-3xl flex flex-col items-start text-left"
        >
          {/* Eyebrow */}
          <p className="ean-rise font-ui text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.25em] text-white/70 mb-3 sm:mb-4 uppercase">
            {slide.eyebrow}
          </p>

          {/* Headline */}
          <h1
            className={`ean-rise ean-rise-delay-1 font-display ${
              TITLE_SCALES[slide.titleScale ?? 'default']
            } text-white font-medium leading-[1.1] mb-4 sm:mb-5`}
          >
            {slide.title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < slide.title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>

          {/* Subtitle / Bullet Points */}
          {bulletItems && bulletItems.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 mb-6 sm:mb-8 md:mb-9 max-w-2xl">
              {bulletItems.map((bullet, bIdx) => {
                const delayClass =
                  bIdx === 0
                    ? 'ean-rise-delay-2'
                    : bIdx === 1
                    ? 'ean-rise-delay-3'
                    : bIdx === 2
                    ? 'ean-rise-delay-4'
                    : 'ean-rise-delay-5';

                return (
                  <div
                    key={bIdx}
                    className={`ean-rise ${delayClass} inline-flex items-center gap-2.5 font-ui text-xs sm:text-sm md:text-base text-white/80`}
                  >
                    {bIdx > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-ean-gold/80 inline-block shrink-0 shadow-[0_0_8px_rgba(196,149,42,0.6)]" />
                    )}
                    <span>{bullet}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="ean-rise ean-rise-delay-2 font-ui text-xs sm:text-sm md:text-base lg:text-lg text-white/70 leading-relaxed mb-6 sm:mb-8 md:mb-9 max-w-xl">
              {slide.subtitle.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < slide.subtitle.split('\n').length - 1 && <br className="hidden sm:inline" />}
                </React.Fragment>
              ))}
            </p>
          )}

          {/* Action Buttons */}
          <div className="ean-rise ean-rise-delay-6 flex flex-wrap sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
            {slide.primaryCta.href.startsWith('#') ? (
              <GoldButton onClick={() => scrollToHash(slide.primaryCta.href)}>
                {slide.primaryCta.text}
              </GoldButton>
            ) : (
              <Link href={slide.primaryCta.href}>
                <GoldButton>{slide.primaryCta.text}</GoldButton>
              </Link>
            )}
            {slide.secondaryCta.href.startsWith('#') ? (
              <OutlineButton variant="photo" onClick={() => scrollToHash(slide.secondaryCta.href)}>
                {slide.secondaryCta.text}
              </OutlineButton>
            ) : (
              <Link href={slide.secondaryCta.href}>
                <OutlineButton variant="photo">{slide.secondaryCta.text}</OutlineButton>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slide Progress Indicator Dots */}
      <div className="absolute bottom-10 left-6 md:left-8 z-20 flex items-center gap-2.5">
        {HERO_SLIDES.map((s, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={s.id}
              onClick={() => handleDotClick(idx)}
              className={`group relative h-2 rounded-full cursor-pointer transition-all duration-700 overflow-hidden ${
                isActive ? 'w-12 bg-white/20' : 'w-2.5 bg-white/35 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            >
              {isActive && (
                <span
                  key={`progress-${currentSlide}`}
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                  className="absolute inset-y-0 left-0 bg-white rounded-full animate-hero-progress"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll Down Indicator */}
      <div
        className="ean-rise ean-rise-delay-7 absolute bottom-10 right-6 md:right-8 z-20 flex flex-col items-center cursor-pointer"
        onClick={() => scrollToHash('#services-section')}
      >
        <div className="w-8 h-13 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm bg-black/10 hover:border-white transition-colors duration-300 shadow-[0_0_15px_rgba(43,0,152,0.1)]">
          <svg
            className="w-4 h-4 text-white/70 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
