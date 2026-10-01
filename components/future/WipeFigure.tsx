'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import '@/lib/ds-eases';
import { DS_DURATION, DS_EASE_DEFAULT, DS_ENTRANCE } from '@/lib/ds-motion';
import { withScrollTrigger } from '@/lib/gsap-motion';

interface WipeFigureProps {
  /** On the <figure>. */
  className?: string;
  /** On the clipped frame — border, aspect ratio, ground. */
  frameClassName?: string;
  /** The image is a `fill` next/image, so the zoom layer has to be positioned for it. */
  fill?: boolean;
  caption?: React.ReactNode;
  captionClassName?: string;
  /** Seconds to hold back, so a row of cells crossing the line together still reads left to right. */
  delay?: number;
  children: React.ReactNode;
}

/**
 * A photograph that opens from a line across its middle, like a shutter, while
 * the picture inside settles from a slight zoom — and closes the same way as it
 * leaves the top of the screen, opening again if the visitor scrolls back to it.
 *
 * Only the pages that opt into `motion: 'cinematic'` render this.
 *
 * The shutter is a clip-path and the settle a transform, so neither moves the
 * layout, and the frame is the element clipped: its border opens with the
 * picture instead of sitting round an empty box.
 *
 * Timed to be seen, from §19's own steps:
 *
 *   - It waits until the frame is a quarter of the way up the screen, not at
 *     its bottom edge, so it opens where the eye already is.
 *   - It holds one `interaction` (350ms) first, so the heading beside it has
 *     started to arrive and the picture follows the words.
 *   - It opens over the full `entrance` (700ms) on `ds-default`, §19's curve for
 *     anything reversible. `ds-enter` does three quarters of its travel in the
 *     first 150ms, which on a shutter reads as a cut rather than a movement.
 *
 * The caption rises 14px two steps behind the frame.
 */
export default function WipeFigure({
  className,
  frameClassName = '',
  fill = false,
  caption,
  captionClassName,
  delay = 0,
  children,
}: WipeFigureProps) {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLElement>(null);

  useGSAP(
    () =>
      withScrollTrigger(
        () => {
          const timeline = gsap.timeline({
            defaults: { duration: DS_DURATION.entrance, ease: DS_EASE_DEFAULT },
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top 75%',
              end: 'bottom 25%',
              // Open on the way in, shut on the way out, both directions.
              toggleActions: 'play reverse play reverse',
            },
          });

          // The hold is a position, not the timeline's `delay`: a delay only
          // applies to the first play, and this one plays every time it re-enters.
          const hold = DS_DURATION.interaction + delay;

          timeline
            .fromTo(frameRef.current, { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, hold)
            .fromTo(zoomRef.current, { scale: 1.15 }, { scale: 1 }, hold);

          if (captionRef.current) {
            timeline.fromTo(
              captionRef.current,
              { opacity: 0, y: DS_ENTRANCE.distance },
              { opacity: 1, y: 0 },
              hold + DS_ENTRANCE.stagger * 2
            );
          }
        },
        () => {}
      ),
    { scope: rootRef }
  );

  return (
    <figure ref={rootRef} className={className}>
      <div ref={frameRef} className={`overflow-hidden ${frameClassName}`}>
        <div ref={zoomRef} className={fill ? 'absolute inset-0' : undefined}>
          {children}
        </div>
      </div>
      {caption != null && (
        <figcaption ref={captionRef} className={captionClassName}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
