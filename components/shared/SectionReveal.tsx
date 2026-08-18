'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withReducedMotion } from '@/lib/gsap-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function SectionReveal({ children, className = '', id }: SectionRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          const rafId = requestAnimationFrame(() => {
            if (!containerRef.current) return;
            gsap.fromTo(
              containerRef.current,
              { opacity: 0, y: 32 },
              {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: 'top 85%',
                  toggleActions: 'play none none none',
                },
              }
            );
          });

          return () => cancelAnimationFrame(rafId);
        },
        () => {
          // This wrapper is used on nearly every section of the site, so without
          // an explicit resting state a reduced-motion visitor would lose most of
          // the page. Content is already visible in the markup; just make sure
          // nothing inherits a transform.
          if (!containerRef.current) return;
          gsap.set(containerRef.current, { opacity: 1, y: 0, clearProps: 'transform' });
        }
      ),
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      id={id}
      className={`${className} will-change-[transform,opacity]`}
    >
      {children}
    </div>
  );
}
