'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);

  useGSAP(
    () => {
      // Skip preloader on repeat visits or server renders
      if (typeof window !== 'undefined' && sessionStorage.getItem('ean_visited')) {
        requestAnimationFrame(() => setIsDone(true));
        return;
      }

      try {
        sessionStorage.setItem('ean_visited', 'true');
      } catch {}

      // Instant 200ms fade out to reveal site content immediately at 1.1s FCP/LCP
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.25,
        delay: 0.1,
        ease: 'power2.out',
        onComplete: () => setIsDone(true),
      });
    },
    { scope: containerRef }
  );

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-9999 bg-ean-navy pointer-events-none transition-opacity"
    />
  );
}
