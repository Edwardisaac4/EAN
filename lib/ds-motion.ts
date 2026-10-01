/*
 * The design system's motion values, §19.
 *
 * Deliberately free of any GSAP import. Server Components read DS_ENTRANCE to
 * pass it down, and pulling GSAP in here would drag the whole library onto the
 * server for three numbers. The eases are *registered* in DsReveal, which is
 * the client boundary; this module only names them.
 */

/** `cubic-bezier(.25,.1,.25,1)` — hovers, colour, anything reversible. */
export const DS_EASE_DEFAULT = 'ds-default';

/** `cubic-bezier(.22,.9,.28,1)` — the page entrance, and anything arriving. */
export const DS_EASE_ENTER = 'ds-enter';

/** `cubic-bezier(.34,1.56,.64,1)` — overshoots. Note y2 > 1; that is the point. */
export const DS_EASE_SPRING = 'ds-spring';

/**
 * SVG path data for each, for CustomEase.
 *
 * GSAP's built-ins are a different family of curves — `power2.out` is not
 * `cubic-bezier(.22,.9,.28,1)`, and substituting one for the other is how a
 * system's motion quietly stops matching its specification. A CSS
 * `cubic-bezier(x1,y1,x2,y2)` maps to path data exactly: the curve runs 0,0 →
 * 1,1 with those two values as its control points, so this is the same curve,
 * not an approximation.
 */
export const DS_EASE_PATHS: Record<string, string> = {
  [DS_EASE_DEFAULT]: 'M0,0 C0.25,0.1 0.25,1 1,1',
  [DS_EASE_ENTER]: 'M0,0 C0.22,0.9 0.28,1 1,1',
  [DS_EASE_SPRING]: 'M0,0 C0.34,1.56 0.64,1 1,1',
};

/**
 * The five §19 durations, in seconds for GSAP. The same steps globals.css names
 * as `--transition-duration-ds-*`; change one and change the other.
 *
 * Delays and holds take these steps too, not free numbers: a pause of one
 * `interaction` reads as part of the system's rhythm, where 0.3 or 0.4 would
 * read as someone's guess.
 */
export const DS_DURATION = {
  colour: 0.1,
  interaction: 0.35,
  panel: 0.45,
  drawer: 0.55,
  entrance: 0.7,
} as const;

/**
 * The one orchestrated page entrance: "elements rise 14px and fade over 700ms,
 * staggered 50ms in reading order."
 *
 * Exported as values rather than written into each component so the three
 * numbers stay in one place — they are the system's, and a component that
 * rounds 14 to 16 or 50 to 60 is no longer running this system's motion.
 */
export const DS_ENTRANCE = {
  distance: 14,
  duration: DS_DURATION.entrance,
  stagger: 0.05,
  ease: DS_EASE_ENTER,
} as const;
