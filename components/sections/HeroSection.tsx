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

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };



  const handleDotClick = (index: number) => {
    if (index === currentSlide) return;
    setCurrentSlide(index);
  };

  // Auto-play timer that automatically resets on slide change
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6500);
    return () => clearInterval(timer);
  }, [currentSlide]);

  useGSAP(
    () => {
      // 1. Staggered text entrance reveal on slide change
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6 }
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

      tl.fromTo(
        ctasRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      );

      // 2. Background image cross-fade transition
      const bgs = gsap.utils.toArray('.slide-bg') as HTMLElement[];
      bgs.forEach((bg, index) => {
        if (index === currentSlide) {
          gsap.to(bg, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.inOut' });
        } else {
          gsap.to(bg, { opacity: 0, scale: 1.08, duration: 1.4, ease: 'power2.inOut' });
        }
      });
    },
    { dependencies: [currentSlide], scope: containerRef }
  );

  useGSAP(
    () => {
      // 3. Parallax scroll effect across all backgrounds
      gsap.to('.slide-bg', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // 4. Subtle hover/bounce animation for scroll indicator
      gsap.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1, delay: 1.2, ease: 'power3.out' }
      );

      gsap.to(scrollIndicatorRef.current, {
        y: 6,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: 'power1.inOut',
      });
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
      className="relative w-full h-screen min-h-[620px] md:min-h-[720px] lg:min-h-[800px] overflow-hidden bg-ean-navy flex items-center select-none"
    >
      {/* Background Slides Container */}
      {HERO_SLIDES.map((s, idx) => (
        <div
          key={s.id}
          className="slide-bg absolute inset-0 w-full h-[120%] top-[-10%] opacity-0 pointer-events-none"
          style={{ zIndex: idx === currentSlide ? 1 : 0 }}
        >
          <Image
            src={s.image}
            alt={s.eyebrow}
            fill
            sizes="100vw"
            priority={idx === 0}
            quality={95}
            className="object-cover object-center"
          />
          {/* Overlays for high readability */}
          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/45 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-black/65" />
        </div>
      ))}

      {/* Main Content (Text Layer) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12 w-full pt-20 sm:pt-24 md:pt-28 lg:pt-16">
        <div className="max-w-2xl lg:max-w-3xl flex flex-col items-start text-left">
          {/* Eyebrow */}
          <p
            ref={eyebrowRef}
            className="opacity-0 font-ui text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.25em] text-ean-gold mb-3 sm:mb-4 uppercase"
          >
            {slide.eyebrow}
          </p>

          {/* Headline */}
          <h1
            ref={titleRef}
            className="opacity-0 font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-medium leading-[1.1] mb-4 sm:mb-6"
          >
            {slide.title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < slide.title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="opacity-0 font-ui text-xs sm:text-sm md:text-base lg:text-lg text-ean-muted-light leading-relaxed mb-6 sm:mb-8 md:mb-10 max-w-xl"
          >
            {slide.subtitle.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < slide.subtitle.split('\n').length - 1 && <br className="hidden sm:inline" />}
              </React.Fragment>
            ))}
          </p>

          {/* Action Buttons */}
          <div ref={ctasRef} className="opacity-0 flex flex-wrap sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
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
        ref={scrollIndicatorRef}
        className="absolute bottom-10 right-6 md:right-8 z-20 flex flex-col items-center cursor-pointer"
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
