'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withReducedMotion } from '@/lib/gsap-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** Today's values. A site-wide default that changes here changes 41 sections. */
const DEFAULT_DISTANCE = 32;
const DEFAULT_DURATION = 0.9;
const DEFAULT_EASE = 'power2.out';

/** Used when `stagger` is passed as `true` rather than a number. */
const DEFAULT_STAGGER = 0.08;

/*
 * Marked descendants that belong to *this* wrapper. SectionReveals nest, so a
 * plain `[data-reveal]` query would let an outer wrapper steal an inner one's
 * items and drive them off the wrong trigger. Walking up from the item's parent
 * (not the item itself) keeps a nested SectionReveal that is also marked
 * `data-reveal` — a whole block sequenced by its parent, then sequencing its own
 * contents — resolving to the outer wrapper, which is where it belongs.
 */
function collectTargets(container: HTMLElement): HTMLElement[] {
  return gsap.utils
    .toArray<HTMLElement>('[data-reveal]', container)
    .filter((el) => el.parentElement?.closest('[data-reveal-root]') === container);
}

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /**
   * Sequence descendants marked `data-reveal` off a single ScrollTrigger on this
   * wrapper, instead of tweening the wrapper as one slab. A number is the gap in
   * seconds between items; `true` takes {@link DEFAULT_STAGGER}.
   *
   * Falls back to the whole-block tween when the subtree marks nothing, which is
   * what made this safe to land across all 41 call sites at once: an unconverted
   * site behaves exactly as it did before.
   */
  stagger?: number | boolean;
  /**
   * Measure the marked descendants as a grid and sweep them diagonally rather
   * than in DOM order. Only meaningful alongside `stagger`, and only correct when
   * the marked items are the cells of one CSS grid.
   */
  grid?: boolean;
  /** Travel distance in px. Headline blocks want more than card grids. */
  distance?: number;
  duration?: number;
  ease?: string;
}

/**
 * The site's scroll reveal.
 *
 * Two things it deliberately does not do:
 *
 * It does not target direct children. A large share of the call sites wrap a
 * single element, where direct-child targeting is a silent no-op, and on the
 * multi-child sites it would restage pages nobody asked to change. Sequencing is
 * opt-in per item via `data-reveal`, so converting a section is a visible edit.
 *
 * It does not set the start state in markup. AGENTS.md §8: content must paint
 * without JS, so the `opacity: 0` is applied by GSAP at runtime and a visitor
 * with no JS — or a crawler — reads a fully visible page.
 */
export default function SectionReveal({
  children,
  className = '',
  id,
  stagger,
  grid = false,
  distance = DEFAULT_DISTANCE,
  duration = DEFAULT_DURATION,
  ease = DEFAULT_EASE,
}: SectionRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          const rafId = requestAnimationFrame(() => {
            const container = containerRef.current;
            if (!container) return;

            const marked = stagger ? collectTargets(container) : [];
            const isSequenced = marked.length > 0;
            const each = typeof stagger === 'number' ? stagger : DEFAULT_STAGGER;

            gsap.fromTo(
              isSequenced ? marked : container,
              { opacity: 0, y: distance },
              {
                opacity: 1,
                y: 0,
                duration,
                ease,
                // `grid: 'auto'` measures the rendered positions, so a row of
                // cards crossing the trigger line together sweeps diagonally
                // instead of arriving as one slab.
                stagger: isSequenced
                  ? grid
                    ? { each, from: 'start', grid: 'auto' }
                    : each
                  : undefined,
                scrollTrigger: {
                  trigger: container,
                  start: 'top 85%',
                  toggleActions: 'play none none none',
                },
              }
            );
          });

          return () => cancelAnimationFrame(rafId);
        },
        () => {
          /*
           * The resting state has to reach every marked descendant, not just the
           * wrapper. These tweens run *from* `opacity: 0`, so a settle branch
           * that only reset the container would leave a reduced-motion visitor
           * looking at empty sections wherever the contents are the targets.
           */
          const container = containerRef.current;
          if (!container) return;
          gsap.set([container, ...collectTargets(container)], {
            opacity: 1,
            y: 0,
            clearProps: 'transform',
          });
        }
      ),
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      id={id}
      data-reveal-root=""
      className={`${className} will-change-[transform,opacity]`}
    >
      {children}
    </div>
  );
}
