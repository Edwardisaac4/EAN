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

/**
 * ScrollTrigger, kept off the hydration critical path.
 *
 * Every scroll animation on this site is below-the-fold behaviour that cannot
 * matter until the visitor scrolls, yet a module-scope
 * `import { ScrollTrigger } from 'gsap/ScrollTrigger'` put the plugin's 43KB
 * into the page's first chunk and ran `registerPlugin` — plus every
 * `ScrollTrigger.create` and its forced layout read — inside the same task as
 * React's hydration. A Lighthouse trace of the homepage attributed 87ms of
 * blocking time to that one task.
 *
 * Loading the plugin through a dynamic import moves the parse, the
 * registration and the trigger creation into a later task, after hydration has
 * finished. The promise is memoised at module scope, so the second caller and
 * every client-side navigation resolve in a microtask rather than re-fetching.
 *
 * The reveal animations tween *from* `opacity: 0`, so deferring them means the
 * content paints visible and is then hidden a beat later. On first load the
 * preloader's veil is still up for that beat and covers it; on a client-side
 * navigation the module is already resolved, so there is no beat to cover.
 * Do not stretch this deferral any further without checking both cases.
 */
let scrollTriggerLoad: Promise<void> | null = null;

export function loadScrollTrigger(): Promise<void> {
  if (!scrollTriggerLoad) {
    scrollTriggerLoad = import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
    });
  }

  return scrollTriggerLoad;
}

/**
 * `withReducedMotion`, deferred until ScrollTrigger has loaded.
 *
 * Returns the cleanup `useGSAP` expects. The tweens are created asynchronously
 * and so fall outside the `gsap.context` that `useGSAP` sets up — which is why
 * the cleanup reverts the `matchMedia` this creates rather than trusting the
 * context to find them. `cancelled` covers the unmount-before-resolve case,
 * where there is nothing to revert yet and the callback must not build one.
 */
export function withScrollTrigger(animate: () => void, settle: () => void): () => void {
  let cancelled = false;
  let revert: (() => void) | undefined;

  void loadScrollTrigger().then(() => {
    if (cancelled) return;
    revert = withReducedMotion(animate, settle);
  });

  return () => {
    cancelled = true;
    revert?.();
  };
}
