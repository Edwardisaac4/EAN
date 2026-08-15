'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';
import { HERO_SLIDES } from '@/lib/constants';

// Register GSAP plugins at the file level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SLIDE_INTERVAL_MS = 6500;

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Auto-play timer that automatically resets on slide change
  useEffect(() => {
    if (!carouselReady) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [currentSlide, carouselReady]);

  useGSAP(
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
    { scope: containerRef }
  );

  const handleInquiryClick = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServicesClick = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen min-h-150 md:min-h-175 lg:min-h-190 overflow-hidden bg-ean-navy flex items-center select-none"
    >
      {/* Background Slides Container — single parallax layer */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none"
      >
        {HERO_SLIDES.map((s, idx) => {
          const isActive = idx === currentSlide;
          if (idx > 0 && !carouselReady) return null;

          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-in-out ${
                isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.08]'
              }`}
              style={{ zIndex: isActive ? 1 : 0 }}
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
          );
        })}

        {/* Overlays for high readability — shared across every slide */}
        <div className="absolute inset-0 z-2 bg-linear-to-r from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-0 z-2 bg-linear-to-t from-black/90 via-black/25 to-black/65" />
      </div>

      {/* Main Content (Text Layer) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12 w-full pt-20 sm:pt-22 md:pt-24 lg:pt-20 pb-12">
        {/* Keyed on the slide index so the CSS entrance replays on each change */}
        <div
          key={currentSlide}
          className="max-w-2xl lg:max-w-3xl flex flex-col items-start text-left"
        >
          {/* Eyebrow */}
          <p className="ean-rise font-ui text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.25em] text-ean-gold mb-3 sm:mb-4 uppercase">
            {slide.eyebrow}
          </p>

          {/* Headline */}
          <h1 className="ean-rise ean-rise-delay-1 font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-medium leading-[1.1] mb-4 sm:mb-5">
            {slide.title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < slide.title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="ean-rise ean-rise-delay-2 font-ui text-xs sm:text-sm md:text-base lg:text-lg text-ean-muted-light leading-relaxed mb-6 sm:mb-8 md:mb-9 max-w-xl">
            {slide.subtitle.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < slide.subtitle.split('\n').length - 1 && <br className="hidden sm:inline" />}
              </React.Fragment>
            ))}
          </p>

          {/* Action Buttons */}
          <div className="ean-rise ean-rise-delay-3 flex flex-wrap sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
            <GoldButton onClick={handleInquiryClick}>
              {slide.primaryCta.text}
            </GoldButton>
            <OutlineButton variant="dark" onClick={handleServicesClick}>
              {slide.secondaryCta.text}
            </OutlineButton>
          </div>
        </div>
      </div>

      {/* Slide Progress Indicator Dots */}
      <div className="absolute bottom-10 left-6 md:left-8 z-20 flex items-center gap-3">
        {HERO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => handleDotClick(idx)}
            className={`transition-all duration-500 rounded-full cursor-pointer ${
              idx === currentSlide
                ? 'w-8 h-2 bg-ean-gold'
                : 'w-2 h-2 bg-white/40 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Scroll Down Indicator */}
      <div
        className="ean-rise ean-rise-delay-4 absolute bottom-10 right-6 md:right-8 z-20 flex flex-col items-center cursor-pointer"
        onClick={handleServicesClick}
      >
        <div className="w-8 h-13 rounded-full border border-ean-gold/30 flex items-center justify-center backdrop-blur-sm bg-black/10 hover:border-ean-gold transition-colors duration-300 shadow-[0_0_15px_rgba(196,149,42,0.1)]">
          <svg
            className="w-4 h-4 text-ean-gold animate-bounce"
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
