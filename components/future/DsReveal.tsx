'use client';

import { createContext, useContext, useEffect } from 'react';
import '@/lib/ds-eases';
import SectionReveal from '@/components/shared/SectionReveal';
import { DS_ENTRANCE } from '@/lib/ds-motion';
import { loadScrollTrigger } from '@/lib/gsap-motion';

const TwoWay = createContext(false);

/**
 * Makes every DsReveal inside it run both ways — hiding as it leaves the top of
 * the screen and arriving again on the way back up — so a page's copy moves
 * with its photographs rather than settling once and staying put.
 *
 * A context rather than a prop because a brief page has a DsReveal in nearly
 * every block, and the pages that render them are Server Components: this is
 * the one client boundary they can wrap.
 *
 * It also refreshes ScrollTrigger when the page changes height. A trigger's
 * start and end are measured once, and ScrollTrigger only re-measures on a
 * window resize. A one-way reveal can live with a stale start — it only fires a
 * little early — but a two-way one reverses at its stale end, so opening an FAQ
 * answer would fade out the blocks below it while they were still on screen.
 */
export function DsRevealScope({ twoWay, children }: { twoWay: boolean; children: React.ReactNode }) {
  useEffect(() => {
    if (!twoWay) return;

    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let frame = 0;

    void loadScrollTrigger()
      .then(() => import('gsap/ScrollTrigger'))
      .then(({ ScrollTrigger }) => {
        if (cancelled) return;

        let height = document.body.offsetHeight;
        observer = new ResizeObserver(() => {
          // Width changes are ScrollTrigger's own resize handling; only height is new here.
          if (document.body.offsetHeight === height) return;
          height = document.body.offsetHeight;

          cancelAnimationFrame(frame);
          // Deferred to scroll end by ScrollTrigger itself if the visitor is mid-scroll.
          frame = requestAnimationFrame(() => ScrollTrigger.refresh());
        });
        observer.observe(document.body);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [twoWay]);

  return <TwoWay.Provider value={twoWay}>{children}</TwoWay.Provider>;
}

interface DsRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Sequence marked descendants rather than tweening the block as one slab. */
  stagger?: boolean;
  /** Sweep a marked grid diagonally instead of in DOM order. */
  grid?: boolean;
}

/**
 * The design system's page entrance, as the one wrapper /airborne uses.
 *
 * It is SectionReveal with the system's numbers bound to it: rise 14px, fade,
 * 700ms, `cubic-bezier(.22,.9,.28,1)`, staggered 50ms in reading order. The
 * site's own default — 32px over 900ms on `power2.out` — is a different motion,
 * and mixing the two inside one page is exactly what makes a design system stop
 * reading as one.
 *
 * Existing as a component rather than as a props object is what keeps the GSAP
 * import on the client side of the boundary: the pages that use this are Server
 * Components, and CustomEase has no business being evaluated on the server.
 *
 * One-way unless a DsRevealScope above it says otherwise.
 *
 * Reduced motion, §19, is handled inside SectionReveal via `withReducedMotion`.
 */
export default function DsReveal({ children, className = '', stagger, grid }: DsRevealProps) {
  const twoWay = useContext(TwoWay);

  return (
    <SectionReveal
      className={className}
      stagger={stagger ? DS_ENTRANCE.stagger : undefined}
      grid={grid}
      twoWay={twoWay}
      distance={DS_ENTRANCE.distance}
      duration={DS_ENTRANCE.duration}
      ease={DS_ENTRANCE.ease}
    >
      {children}
    </SectionReveal>
  );
}
