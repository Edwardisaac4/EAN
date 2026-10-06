'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import '@/lib/ds-eases';
import { DS_ENTRANCE } from '@/lib/ds-motion';
import { withScrollTrigger } from '@/lib/gsap-motion';

gsap.registerPlugin(SplitText);

/**
 * Rosario's descenders hang below a 1.1–1.15 line box, and a line mask clips at
 * the box. This much padding gives them room; the matching negative margin
 * keeps the lines exactly where they were set.
 */
export const MASK_DESCENDER_ROOM = { paddingBottom: '0.14em', marginBottom: '-0.14em' };

interface MaskedLinesProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * A section heading whose lines slide up from behind their own lower edge, one
 * after another, as the heading scrolls in — and drop back behind it as it
 * leaves, off the top or back off the foot, so it arrives again from either
 * direction.
 *
 * Only the pages that opt into `motion: 'cinematic'` render this; every other
 * brief keeps its heading inside the section's DsReveal.
 *
 * Timing is §19's — 700ms on `ds-enter`, 50ms between lines. The travel is not:
 * a masked line rises its own height rather than 14px, because a 14px rise
 * behind a mask would show as a crop, not a movement.
 *
 * SplitText sets aria-label on the heading and hides the line wrappers, so a
 * screen reader hears one heading, not five fragments. The text is in the
 * server HTML; the split happens only once ScrollTrigger has loaded.
 */
export default function MaskedLines({ className, children }: MaskedLinesProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () =>
      withScrollTrigger(
        () => {
          const heading = ref.current;
          if (!heading) return;

          SplitText.create(heading, {
            type: 'lines',
            mask: 'lines',
            // Re-splits when Rosario swaps in and when the column reflows.
            autoSplit: true,
            onSplit: (split) => {
              gsap.set(split.masks, MASK_DESCENDER_ROOM);

              // Returned, so a re-split carries the progress across.
              return gsap.from(split.lines, {
                yPercent: 110,
                duration: DS_ENTRANCE.duration,
                ease: DS_ENTRANCE.ease,
                stagger: DS_ENTRANCE.stagger,
                scrollTrigger: {
                  trigger: heading,
                  // Later than DsReveal's 85%, so the lines move where they can be
                  // seen — and still ahead of the paragraphs, whose own 85% line
                  // this heading's height puts a beat behind.
                  start: 'top 80%',
                  // The same margin at the top, so it drops away before the bar covers it.
                  end: 'bottom 20%',
                  // In on the way in, out on the way out, both directions — as WipeFigure.
                  toggleActions: 'play reverse play reverse',
                },
              });
            },
          });
        },
        // Nothing to settle: this branch never splits, so the heading stays as served.
        () => {}
      ),
    { scope: ref }
  );

  return (
    <h2 ref={ref} className={className}>
      {children}
    </h2>
  );
}
