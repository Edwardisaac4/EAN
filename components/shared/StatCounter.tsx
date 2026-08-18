'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withReducedMotion } from '@/lib/gsap-motion';

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
    () =>
      withReducedMotion(
        () => {
          if (!elementRef.current) return;

          // The markup ships the final figure so crawlers and no-JS visitors read
          // the real number rather than "0". Blanking it to 0 and hiding it are
          // deferred to onStart / immediateRender:false below, so that if the
          // ScrollTrigger never fires — element already past, refresh suppressed,
          // trigger torn down early — the server-rendered figure simply stays on
          // screen instead of leaving a permanently invisible "0".

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
            onStart: () => {
              if (elementRef.current) {
                elementRef.current.textContent = `${prefix}0${suffix}`;
              }
            },
            onUpdate: () => {
              if (elementRef.current) {
                elementRef.current.textContent = `${prefix}${Math.floor(obj.val)}${suffix}`;
              }
            },
            onComplete: () => {
              // onUpdate floors, and the final tick is not guaranteed to land on
              // exactly targetValue, so "15+" could finish reading "14+".
              if (elementRef.current) {
                elementRef.current.textContent = `${prefix}${targetValue}${suffix}`;
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
              // fromTo renders its start state at creation by default, which
              // would hide the figure before the trigger is ever evaluated.
              immediateRender: false,
              scrollTrigger: {
                trigger: elementRef.current,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        },
        () => {
          // Critically, the animate branch is what blanks the text to "0" — so
          // the reduced-motion branch must leave the server-rendered figure
          // completely alone. Touching textContent here would show 0 forever.
          if (!elementRef.current) return;
          gsap.set(elementRef.current, { opacity: 1, scale: 1, clearProps: 'transform' });
        }
      ),
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
