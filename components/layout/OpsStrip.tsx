import React from 'react';

/**
 * The 36px status strip above the nav — the prototype's `.opsbar`.
 *
 * It is the one piece of chrome on the site that states operating facts rather
 * than selling: where we are, what clears on site, what time zone the desk is
 * in, and the number to call when an aircraft is on the ground. A crew reading
 * it at 03:00 needs the last item to be one tap, so the AOG number is a `tel:`
 * and the desk address is a `mailto:` — everything else is plain text.
 *
 * Facts only, and every one of them already published elsewhere on the site:
 * 24/7 operations, the Lagos codes, the Abuja office, on-site CIQ, UTC+1, and
 * the canonical number (C47/C84). Nothing here needs a basis line because
 * nothing here is a claim about quality.
 *
 * The strings are local rather than imported. There is no shared contact
 * constant in `lib/constants.ts` today — `LAGOS_HQ` carries `info@`, and the
 * Footer hardcodes `dispatch@` — so a single canonical CONTACT export is a
 * separate, worthwhile job across three files. This does not pretend to be it.
 *
 * Two renderings of one list, cut by `ops-static` — defined in globals.css as
 * a wide screen AND a cursor driving it:
 *
 * - On a desktop it is the static bar it has always been, AOG pinned right.
 * - On a phone the row overflows by roughly a screen and a half, and used to be
 *   a swipeable overflow — which reads as a truncated line, since nothing
 *   indicates the Abuja office or the AOG number are past the right edge.
 * - On a tablet it travels too, and that one is a choice rather than a
 *   necessity: an iPad in landscape is wide enough to hold the whole row. It
 *   moves there because a status strip that moves reads as live, which is the
 *   one thing this strip is for.
 */
export default function OpsStrip() {
  return (
    <div className="h-9 bg-ean-black-pure border-b border-ean-border-dark overflow-hidden">
      <div className="hidden ops-static:flex max-w-ean mx-auto h-full px-6.5 items-center gap-5 whitespace-nowrap">
        {/*
         * `ml-auto` pins the AOG number to the right edge at full width, where
         * the prototype leaves ~150px of dead space after it.
         */}
        <OpsItems aogClassName="ml-auto" />
      </div>

      {/*
       * The travelling copy.
       *
       * `overflow-x-auto` stays under the animation rather than being replaced
       * by it: the transform and the scroll offset are independent, so a reader
       * who wants to hold a line still can drag it, and a reader with reduced
       * motion — where the animation is off and the second copy is not rendered
       * — gets exactly the swipeable row this used to be.
       *
       * Hover and focus pause it. The strip carries two live links, and a phone
       * number that slides out from under the thumb is worse than one that has
       * to be swiped to.
       */}
      <div className="flex ops-static:hidden h-full items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/*
         * `w-max shrink-0` is load-bearing, not defensive. The keyframe travels
         * by -50%, which is a percentage of THIS element — let the flex parent
         * shrink it to the viewport and the loop jumps by half a screen instead
         * of half the content, which shows as a stutter at the seam.
         */}
        <div className="flex w-max shrink-0 animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
          {/*
           * Each copy carries its own trailing gap, so the two halves are the
           * same width and the keyframe's -50% lands exactly one copy along.
           * A `gap-5` on the track instead would leave half a gap of drift on
           * every loop.
           */}
          <div className="flex items-center gap-5 pr-5 whitespace-nowrap shrink-0">
            <OpsItems />
          </div>
          {/*
           * The seam. Present for the eye only — `inert` keeps it out of the
           * accessibility tree and out of the tab order, so the two links are
           * announced and reachable once each, not twice.
           */}
          <div
            aria-hidden="true"
            inert
            className="flex items-center gap-5 pr-5 whitespace-nowrap shrink-0 motion-reduce:hidden"
          >
            <OpsItems />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The seven facts, rendered identically in both cuts. Extracted so the mobile
 * marquee's two copies and the desktop row cannot drift apart — there is one
 * list, written once.
 */
function OpsItems({ aogClassName = '' }: { aogClassName?: string }) {
  return (
    <>
      <span className={ITEM}>
        {/*
         * One of the three places radius survives Job G. Tailwind's own
         * `animate-pulse` stands in for the prototype's 2.4s keyframe — near
         * enough at 6px, and it costs no new keyframe in globals.css.
         */}
        <span
          aria-hidden="true"
          className="inline-block w-1.5 h-1.5 mr-1.5 rounded-full bg-ean-live animate-pulse motion-reduce:animate-none"
        />
        <b className={STRONG}>OPERATIONAL</b> 24/7
      </span>

      <span className={ITEM}>
        LOS / <b className={STRONG}>DNMM</b> Lagos
      </span>

      <span className={ITEM}>Abuja office</span>

      <span className={ITEM}>
        CIQ <b className={STRONG}>ON-SITE</b>
      </span>

      <span className={ITEM}>
        UTC<b className={STRONG}>+1</b>
      </span>

      <a href="mailto:dispatch@ean.aero" className={`${ITEM} hover:text-ean-text-light transition-colors`}>
        dispatch@ean.aero
      </a>

      <a
        href="tel:+2348050333410"
        className={`${ITEM} ${aogClassName} text-ean-gold-light font-medium hover:text-ean-text-light transition-colors`}
      >
        AOG / OPS +234 (0) 805 033 3410
      </a>
    </>
  );
}

/** `.ops` — mono 10.5px at .08em in slate. `shrink-0` so the row overflows rather than compressing. */
const ITEM = 'font-mono text-[10.5px] tracking-[0.08em] text-ean-slate shrink-0';

/** `.ops b` — the value inside a label, lifted to ivory at medium. */
const STRONG = 'text-ean-text-light font-medium';
