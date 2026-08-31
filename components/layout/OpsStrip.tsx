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
 */
export default function OpsStrip() {
  return (
    <div className="h-9 bg-ean-black-pure border-b border-ean-border-dark">
      {/*
       * Horizontally scrollable below ~960px with the scrollbar suppressed, as
       * the prototype has it: seven items of mono at 10.5px will not wrap into
       * a 36px band, and truncating them would drop the AOG number first.
       */}
      <div className="max-w-ean mx-auto h-full px-6.5 flex items-center gap-5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

        {/*
         * `ml-auto` pins the AOG number to the right edge at full width, where
         * the prototype leaves ~150px of dead space after it. It is inert once
         * the row overflows, so the mobile order is unchanged.
         */}
        <a
          href="tel:+2348050333410"
          className={`${ITEM} ml-auto text-ean-gold-light font-medium hover:text-ean-text-light transition-colors`}
        >
          AOG / OPS +234 (0) 805 033 3410
        </a>
      </div>
    </div>
  );
}

/** `.ops` — mono 10.5px at .08em in slate. `shrink-0` so the row overflows rather than compressing. */
const ITEM = 'font-mono text-[10.5px] tracking-[0.08em] text-ean-slate shrink-0';

/** `.ops b` — the value inside a label, lifted to ivory at medium. */
const STRONG = 'text-ean-text-light font-medium';
