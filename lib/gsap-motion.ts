import gsap from 'gsap';

/**
 * Reduced-motion gate for GSAP.
 *
 * AGENTS.md §7 states every animation respects `prefers-reduced-motion`, but only
 * the CSS half was covered — the `@media (prefers-reduced-motion: reduce)` block
 * in globals.css can only reach the CSS utility classes. Every GSAP tween (hero
 * parallax, ScrollTrigger reveals, StatCounter, the infinitely yoyo-ing scroll
 * indicator) ran at full motion regardless of the user's setting, and
 * `gsap.matchMedia` appeared in no file.
 *
 * There is no reliable global switch: `gsap.defaults({ duration: 0 })` is ignored
 * wherever a tween sets its own duration (which these all do), and a
 * ScrollTrigger `scrub` is driven by scroll position rather than duration, so it
 * cannot be collapsed by timing at all. The gate therefore has to be declared
 * per animation — this helper just removes the boilerplate.
 *
 * `settle` is not optional in practice: several of these animations tween *from*
 * opacity 0, so a reduced-motion branch that simply skipped the tween would leave
 * the content permanently invisible. `settle` is where the final, resting state
 * gets applied directly.
 *
 * @example
 * useGSAP(
 *   () =>
 *     withReducedMotion(
 *       () => { timeline.fromTo(titleRef.current, { opacity: 0 }, { opacity: 1 }); },
 *       () => { gsap.set(titleRef.current, { opacity: 1, y: 0 }); }
 *     ),
 *   { scope: heroRef }
 * );
 */
export function withReducedMotion(animate: () => void, settle: () => void): () => void {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', animate);
  mm.add('(prefers-reduced-motion: reduce)', settle);

  // Returned so useGSAP's cleanup reverts both branches, including any
  // ScrollTrigger created inside them.
  return () => mm.revert();
}

/**
 * One-shot read of the user's motion preference, for the rare case that needs a
 * branch outside a GSAP context (e.g. deciding whether to animate a counter at
 * all). SSR-safe: returns false on the server, where no preference is knowable.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
