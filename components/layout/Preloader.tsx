'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);

  useGSAP(
    () => {
      const letters = textRef.current?.querySelectorAll('.preloader-char');
      if (!letters) return;

      const tl = gsap.timeline({
        onComplete: () => {
          // Slide up exit animation
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 1,
            ease: 'power4.inOut',
            onComplete: () => {
              setIsDone(true);
            },
          });
        },
      });

      // 1. Stagger letters revealing and scaling up
      tl.fromTo(
        letters,
        { opacity: 0, y: 15, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.05, ease: 'power3.out' }
      );

      // 2. Grow the gold progress line from center
      tl.fromTo(
        progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.5, ease: 'power2.inOut' },
        '-=0.6'
      );

      // 3. Stagger fade out letters slightly before exit
      tl.to(
        letters,
        { opacity: 0, y: -10, duration: 0.4, stagger: 0.03, ease: 'power3.in' },
        '+=0.2'
      );
      tl.to(progressRef.current, { opacity: 0, duration: 0.3 }, '-=0.3');
    },
    { scope: containerRef }
  );

  if (isDone) return null;

  const phrase = "EAN AVIATION";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-9999 bg-ean-navy flex flex-col items-center justify-center select-none"
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Brand Icon */}
        <Image
          src="/images/ean icon.png"
          alt="EAN Aviation Logo"
          width={64}
          height={64}
          className="h-14 w-auto object-contain animate-pulse"
          priority
        />
        {/* Letters Container */}
        <div ref={textRef} className="flex space-x-1.5 sm:space-x-3 text-center">
          {phrase.split('').map((char, index) => (
            <span
              key={index}
              className={`preloader-char font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[0.2em] text-white opacity-0 ${
                char === ' ' ? 'w-4' : ''
              }`}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Premium Gold Progress Bar */}
        <div className="relative w-48 h-px bg-white/10 overflow-hidden">
          <div
            ref={progressRef}
            className="absolute inset-0 bg-ean-gold origin-left scale-x-0"
          />
        </div>
      </div>
    </div>
  );
}
