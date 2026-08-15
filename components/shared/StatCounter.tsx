'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface StatCounterProps {
  targetValue: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function StatCounter({
  targetValue,
  suffix = '',
  prefix = '',
  className = '',
}: StatCounterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!elementRef.current) return;

      // The markup ships the final figure so crawlers and no-JS visitors read
      // the real number rather than "0". Reset to the start state here instead
      // — TrustBar sits below a full-viewport hero, so this always runs long
      // before the element can be scrolled into view.
      elementRef.current.textContent = `${prefix}0${suffix}`;
      gsap.set(elementRef.current, { opacity: 0, scale: 0.8 });

      // 1. Numeric roll count up
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetValue,
        duration: 2,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: elementRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          if (elementRef.current) {
            elementRef.current.textContent = `${prefix}${Math.floor(obj.val)}${suffix}`;
          }
        },
      });

      // 2. Subtle spring scale and fade-in entrance
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: elementRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    },
    { scope: elementRef }
  );

  return (
    <span
      ref={elementRef}
      className={`inline-block ${className}`}
      style={{ transformOrigin: 'center' }}
    >
      {prefix}{targetValue}{suffix}
    </span>
  );
}
