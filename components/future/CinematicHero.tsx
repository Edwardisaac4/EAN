'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import '@/lib/ds-eases';
import { DS_DURATION, DS_EASE_DEFAULT, DS_ENTRANCE } from '@/lib/ds-motion';
import { afterPreloader, withScrollTrigger } from '@/lib/gsap-motion';
import { MASK_DESCENDER_ROOM } from '@/components/future/MaskedLines';

gsap.registerPlugin(SplitText);

interface CinematicHeroProps {
  id?: string;
  /** On the <header>. */
  className?: string;
  /** The photograph and its scrim, which shrink away together. */
  media: React.ReactNode;
  /**
   * The copy. The headline carries `data-mask-lines`; the eyebrow, lede and
   * button carry `data-rise`, in that order — the entrance reads them in DOM
   * order, and the headline sits between the first and the rest.
   */
  children: React.ReactNode;
}

/**
 * The brief's masthead with two pieces of motion, for the pages that opt into
 * `motion: 'cinematic'`.
 *
 * Arriving: as the opening veil lifts, the photograph settles from a slight
 * zoom over 700ms on `ds-default`, gentle enough to be seen. The copy holds one
 * `interaction` (350ms) — long enough to register the picture first — then the
 * headline's lines slide up from behind their own lower edge, with the eyebrow
 * before them and the lede and button after, 50ms apart in reading order on
 * §19's 700ms `ds-enter`. The photograph is never hidden — it is this route's
 * LCP element, and clipping it would push LCP back to the end of the entrance.
 *
 * Leaving: tied to the scroll, the photograph shrinks toward its foot, rounds
 * its corners and dims into the black ground, and the copy lifts away ahead of
 * it. The scrub trails the scroll by one `drawer` (550ms) rather than tracking
 * it exactly, so the fall-back keeps easing for a moment after the wheel stops.
 * The stat strip already rides 56px up over the header at `z-10`, so it reads
 * as the next section sliding over a picture falling back.
 */
export default function CinematicHero({ id, className, media, children }: CinematicHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      withScrollTrigger(
        () => {
          const root = rootRef.current;
          const copy = copyRef.current;
          if (!root || !copy) return;

          const leaving = () => ({ trigger: root, start: 'top top', end: 'bottom top', scrub: DS_DURATION.drawer });

          gsap.to(mediaRef.current, {
            scale: 0.92,
            borderRadius: 24,
            opacity: 0.4,
            transformOrigin: '50% 100%',
            ease: 'none',
            scrollTrigger: leaving(),
          });
          // Gone by 70% of the way out, so it never drifts under the stat strip.
          gsap.to(copy, { y: -64, opacity: 0, ease: 'none', scrollTrigger: { ...leaving(), end: '70% top' } });

          const headline = gsap.utils.toArray<HTMLElement>('[data-mask-lines]', copy)[0];
          const [eyebrow, ...after] = gsap.utils.toArray<HTMLElement>('[data-rise]', copy);

          let lifted = false;
          let entrance: gsap.core.Timeline | undefined;

          // Built paused — its first frame renders at once, so everything is
          // already in its start state before the veil lifts — and played after.
          const build = (lines: Element[]) => {
            const step = DS_ENTRANCE.stagger;
            const hold = DS_DURATION.interaction;
            const rise = { opacity: 0, y: DS_ENTRANCE.distance };
            const rest = { opacity: 1, y: 0 };

            const timeline = gsap
              .timeline({ paused: !lifted, defaults: { duration: DS_ENTRANCE.duration, ease: DS_ENTRANCE.ease } })
              .fromTo(zoomRef.current, { scale: 1.06 }, { scale: 1, ease: DS_EASE_DEFAULT }, 0);

            // Each step only if its element exists; GSAP warns on an empty target.
            if (eyebrow) timeline.fromTo(eyebrow, rise, rest, hold);
            if (lines.length) timeline.fromTo(lines, { yPercent: 110 }, { yPercent: 0, stagger: step }, hold + step);
            if (after.length) {
              timeline.fromTo(after, rise, { ...rest, stagger: step }, hold + step * (lines.length + 1));
            }

            entrance = timeline;
            return timeline;
          };

          if (headline) {
            SplitText.create(headline, {
              type: 'lines',
              mask: 'lines',
              autoSplit: true,
              onSplit: (split) => {
                gsap.set(split.masks, MASK_DESCENDER_ROOM);
                // Returned, so a re-split (Rosario swapping in) carries the progress across.
                return build(split.lines);
              },
            });
          } else {
            build([]);
          }

          let alive = true;
          void afterPreloader().then(() => {
            if (!alive) return;
            lifted = true;
            entrance?.play();
          });

          return () => {
            alive = false;
          };
        },
        () => {}
      ),
    { scope: rootRef }
  );

  return (
    <header ref={rootRef} id={id} className={className}>
      <div ref={mediaRef} className="absolute inset-0 overflow-hidden">
        <div ref={zoomRef} className="absolute inset-0">
          {media}
        </div>
      </div>
      <div ref={copyRef} className="relative w-full">
        {children}
      </div>
    </header>
  );
}
