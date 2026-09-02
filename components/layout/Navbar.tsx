'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Menu, X, ChevronDown } from 'lucide-react';
import Presence from '@/components/shared/Presence';
import OpsStrip from '@/components/layout/OpsStrip';
import { withReducedMotion } from '@/lib/gsap-motion';
import { NAV_ITEMS, NAV_CTA } from '@/lib/constants';

// File level, outside the component: Next remounts on StrictMode and on every
// HMR patch, and a registration inside the body runs again on each of them.
gsap.registerPlugin(useGSAP);

/**
 * How far the page has to travel before the chrome collapses. Carried over
 * unchanged from the CSS version this replaces — short enough that the strip is
 * gone before the first section arrives, long enough to survive a trackpad
 * twitch at the top of the page.
 */
const CHROME_SCROLL_THRESHOLD = 24;

interface IndicatorRect {
  left: number;
  width: number;
}

interface NavbarProps {
  /**
   * Whether the hero behind the bar is a full-bleed photograph under a dark
   * scrim, which is true of eleven of the fifteen routes that mount this
   * component: `/`, `/about`, `/contact`, `/history`, `/team`, `/charter`,
   * `/services`, `/services/[slug]`, `/pricing`, `/blog` and `/the-aeroplex`.
   *
   * It selects the *palette*, not the transparency — the bar is transparent at
   * rest everywhere (see the note on the component below). The four paper
   * routes — `/blog/[slug]`, `/privacy-policy`, `/terms-of-use` and the 404 —
   * leave it unset and keep ink links, because white type on a near-white hero
   * is invisible. That is the one difference physics will not let us close.
   */
  hasPhotoHero?: boolean;
}

/**
 * The v7 nav: a 66px bar, hairline bottom rule, 12.5px uppercase links in
 * slate, brand-blue underline on the active item.
 *
 * Two deliberate departures from the prototype's `nav`, both forced by the fact
 * that this site's heroes are full-bleed and this is not a static page:
 *
 * 1. `fixed`, not `sticky`. Every page hero runs to the top of the viewport and
 *    offsets its own content (`pt-20` and up) to clear an overlaid bar. Making
 *    the nav sticky would push all thirteen heroes down by 66px, which is a
 *    change to every page rather than to this component.
 * 2. A mobile drawer exists. The prototype simply hides its links below 1120px.
 *
 * Everything else is the prototype: 66px, a 95% page-ground fill over
 * `blur(12px)`, a 1160px wrap at 26px gutters, 23px link gap, 200px dropdowns
 * on the raised step behind a hairline border, and the outline CTA at 11px.
 *
 * **One behaviour on all fifteen routes, two palettes.** The bar used to be
 * opaque paper everywhere, on the reasoning that the links are INK and only
 * some heroes are photographs. That conflated two separate questions, and the
 * split it assumed was wrong anyway — `/services`, `/pricing` and `/blog` are
 * scrimmed photographs too, so eleven of the fifteen are, not eight.
 *
 * The two questions, separated:
 *
 * 1. **Is the bar transparent at rest?** Always, on every route. Over a
 *    photograph it reveals the picture; over a paper hero it picks up that
 *    hero's own `ean-navy` rather than sitting on pure white, so the bar merges
 *    downward into the page instead of upward into the ops strip. Same
 *    behaviour, same collapse, one mental model.
 * 2. **What colour is the type?** Whatever the ground can carry, which is the
 *    `hasPhotoHero` prop. Over a photograph the links, CTA, chevron and
 *    underline all go to a literal `white` — the same white that
 *    `OutlineButton variant="photo"` and every hero headline already use, and
 *    which AGENTS.md §5 names as the one sanctioned exception to "always use
 *    the token". On paper they stay ink.
 *
 * Scrolled, every route converges on the identical bar: 95% paper over
 * `blur(12px)` behind a hairline, ink links. The drawer forces that bar early,
 * because it lays its own paper ground under the chrome.
 *
 * The ops strip above stays opaque paper throughout, which is deliberate — it
 * reports operating facts and is not part of the hero composition.
 */
export default function Navbar({ hasPhotoHero = false }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const opsStripRef = useRef<HTMLDivElement>(null);

  // Transparent at rest on every route — this is the half that is uniform.
  // Scrolled, the bar earns its fill; with the drawer open it has to take that
  // fill early, because the drawer lays its own paper ground beneath the chrome.
  const isFloating = !isScrolled && !isMobileMenuOpen;

  // ...and this is the half that cannot be. Ink over a scrimmed photograph is
  // invisible and white over a paper hero is too, so the palette follows the
  // ground. Only ever true while floating: once the bar has its own paper fill
  // the question of what is behind it stops mattering.
  const isOnPhoto = isFloating && hasPhotoHero;

  // Sliding brass underline. One absolutely positioned hairline inside the nav,
  // translated onto whichever item matches the current route. The prototype's is
  // a static `border-bottom` per item; at rest this renders identically — 1px
  // brass, square, no glow — and keeps the movement between routes. Delete the
  // indicator block and put `border-b border-ean-gold` on the active link if the
  // static version is wanted instead.
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  // Held false for the first paint so the underline appears in place rather
  // than gliding in from the left edge on every page load.
  const [isIndicatorAnimated, setIsIndicatorAnimated] = useState(false);

  const isItemActive = useCallback(
    (item: (typeof NAV_ITEMS)[number]) =>
      pathname === item.href || item.dropdownItems?.some((sub) => pathname === sub.href),
    [pathname]
  );

  const measureIndicator = useCallback(() => {
    const nav = navRef.current;
    const activeItem = NAV_ITEMS.find(isItemActive);
    const el = activeItem ? itemRefs.current[activeItem.name] : null;

    if (!nav || !el) {
      setIndicator(null);
      return;
    }

    const navBox = nav.getBoundingClientRect();
    const itemBox = el.getBoundingClientRect();
    setIndicator({ left: itemBox.left - navBox.left, width: itemBox.width });
  }, [isItemActive]);

  useEffect(() => {
    measureIndicator();
    const enableFrame = requestAnimationFrame(() => setIsIndicatorAnimated(true));

    const nav = navRef.current;
    if (!nav) {
      return () => cancelAnimationFrame(enableFrame);
    }

    // The bar no longer resizes on scroll, but the observer still earns its
    // keep: it catches the reflow when a web font lands or the viewport changes.
    const observer = new ResizeObserver(measureIndicator);
    observer.observe(nav);
    window.addEventListener('resize', measureIndicator);

    // Web fonts can change item widths after first measure.
    document.fonts?.ready.then(measureIndicator).catch(() => { });

    return () => {
      cancelAnimationFrame(enableFrame);
      observer.disconnect();
      window.removeEventListener('resize', measureIndicator);
    };
  }, [measureIndicator]);

  /**
   * The chrome collapse: the ops strip fades out and the whole header lifts by
   * the strip's own height, which lands the bar against the top of the
   * viewport.
   *
   * It *lifts* rather than collapsing the strip's `height` to zero, as the CSS
   * version did. The header is `fixed` and out of flow, so nothing below it
   * moves either way — but a transform stays on the compositor, where an
   * animated height is a layout pass on every frame of a scroll.
   *
   * One paused timeline, played forward on the way down and reversed on the way
   * up, so the two directions cannot drift apart. GSAP.md §6.6 prefers a scroll
   * listener to ScrollTrigger for exactly this, and the listener has to exist
   * regardless: `isScrolled` also drives the colour swap, which is React's job
   * and not GSAP's.
   */
  useGSAP(
    () => {
      const strip = opsStripRef.current;
      const header = headerRef.current;
      if (!strip || !header) return;

      // Measured rather than hardcoded against `h-9`: the lift has to equal the
      // strip's height exactly, or the bar settles short of the top.
      const lift = strip.offsetHeight;

      const attach = (isInstant: boolean) => {
        const timeline = gsap
          .timeline({ paused: true })
          .to(strip, { autoAlpha: 0, duration: isInstant ? 0 : 0.3, ease: 'power1.out' }, 0)
          .to(
            header,
            { y: -lift, duration: isInstant ? 0 : 0.4, ease: 'power2.inOut' },
            isInstant ? 0 : 0.1
          );

        const sync = () => {
          const isPast = window.scrollY > CHROME_SCROLL_THRESHOLD;
          setIsScrolled(isPast);
          if (isPast) timeline.play();
          else timeline.reverse();
        };

        // Jumped to, not played into. Someone reloading halfway down the page
        // should find the bar already collapsed rather than watch it collapse,
        // and this runs in a layout effect so it lands before the first paint.
        timeline.progress(window.scrollY > CHROME_SCROLL_THRESHOLD ? 1 : 0).pause();
        setIsScrolled(window.scrollY > CHROME_SCROLL_THRESHOLD);

        window.addEventListener('scroll', sync, { passive: true });
        return () => window.removeEventListener('scroll', sync);
      };

      return withReducedMotion(
        () => attach(false),
        // The same two states with no motion between them. Not a no-op branch:
        // skip it and the strip stays sitting over the bar for the whole page.
        () => attach(true)
      );
    },
    { scope: headerRef }
  );

  // Escape closes whichever layer is open. The prototype opens its menus on
  // `:hover` and `:focus-within` alone, which leaves a keyboard user with no way
  // back out of one.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setActiveDropdown(null);
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const toggleMobileDropdown = (name: string) => {
    setMobileDropdownOpen(mobileDropdownOpen === name ? null : name);
  };

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
        {/*
         * The ops strip rides above the bar and wipes away on the first scroll,
         * which is how it behaves in the prototype — there it simply is not
         * sticky. Here the whole header is fixed, so the strip has to be moved
         * deliberately rather than left behind. Chrome is 102px at rest and
         * 66px thereafter; the heroes clear both, being centred in 600px+ of
         * viewport.
         *
         * No transition classes on this wrapper any more: the fade belongs to
         * the timeline above, and a CSS transition on the same opacity would
         * fight it for the property.
         *
         * `inert` (React 19) takes the two links out of the tab order the
         * instant the collapse starts, and the timeline's `autoAlpha` adds
         * `visibility: hidden` once the fade lands — the strip leaves the
         * accessibility tree by both routes.
         */}
        <div ref={opsStripRef} inert={isScrolled}>
          <OpsStrip />
        </div>

        <div
          className={`h-16.5 border-b transition-colors duration-300 ${isScrolled
              ? 'bg-ean-black/95 backdrop-blur-md border-ean-border-dark'
              : isMobileMenuOpen
                ? 'bg-ean-black border-transparent'
                : 'bg-transparent border-transparent'
            }`}
        >
          <div className="max-w-ean mx-auto h-full px-6.5 flex items-center justify-between gap-4">
            {/* Brand */}
            <Link href="/" className="flex items-center shrink-0" aria-label="EAN Aviation, home">
              <Image
                src="/images/EAN-Logo.png"
                alt="EAN Aviation"
                width={180}
                height={48}
                // The one element in the bar that does NOT answer to the
                // ground. Links, CTA, chevron and underline all invert over a
                // photograph; the lockup is held to its brand colours on all
                // fourteen routes, floating or solid, and that is a decision
                // rather than an omission.
                //
                // It is not free: #2b0098 measures roughly 1.4:1 against the
                // heroes' black/60-black/80 scrim, so over a photograph the
                // wordmark reads as a dark shape and only the grey swoosh and
                // "AVIATION" carry. Dropping a reversed asset into
                // public/images and swapping src on isOnPhoto is the fix that
                // costs neither the colour on paper nor the legibility here.
                className="h-8 md:h-8.5 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop navigation + CTA. 1120px is the prototype's own breakpoint:
                seven uppercase links and a button stop fitting below it. */}
            <div className="hidden min-[1120px]:flex items-center gap-8">
              <nav ref={navRef} className="relative flex items-center gap-5.75">
                {NAV_ITEMS.map((item) => {
                  const isActive = isItemActive(item);
                  // Bound outside the render prop below so the narrowing survives.
                  const dropdownItems = item.dropdownItems;
                  const isOpen = activeDropdown === item.name;

                  // White at 70% is the hero subcopy's own value, so a resting
                  // link sits at the same weight as the copy beneath it instead
                  // of competing with the headline.
                  const linkTone = isOnPhoto
                    ? isActive
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                    : isActive
                      ? 'text-ean-text-light'
                      : 'text-ean-slate hover:text-ean-blue-light';

                  const linkClasses = `font-ui text-[12.5px] uppercase tracking-[0.06em] leading-none pt-2.5 pb-[3px] transition-colors duration-200 ${linkTone}`;

                  return (
                    <div
                      key={item.name}
                      ref={(el) => {
                        itemRefs.current[item.name] = el;
                      }}
                      className="relative"
                      onMouseEnter={() => dropdownItems && setActiveDropdown(item.name)}
                      onMouseLeave={() => dropdownItems && setActiveDropdown(null)}
                      // Focus-within, in the prototype's spirit but scoped: tabbing
                      // into the trigger opens the menu, tabbing past its last item
                      // closes it. `relatedTarget` is the element receiving focus.
                      onFocus={() => dropdownItems && setActiveDropdown(item.name)}
                      onBlur={(e) => {
                        if (dropdownItems && !e.currentTarget.contains(e.relatedTarget)) {
                          setActiveDropdown(null);
                        }
                      }}
                    >
                      {dropdownItems ? (
                        <>
                          <Link
                            href={item.href}
                            aria-current={pathname === item.href ? 'page' : undefined}
                            aria-expanded={isOpen}
                            className={`${linkClasses} flex items-center gap-1.5`}
                          >
                            <span>{item.name}</span>
                            <ChevronDown
                              size={13}
                              aria-hidden="true"
                              className={`transition-transform duration-200 ${isOpen ? (isOnPhoto ? 'rotate-180 text-white' : 'rotate-180 text-ean-gold') : ''
                                }`}
                            />
                          </Link>

                          <Presence show={isOpen} durationMs={200}>
                            {(state) => (
                              <div
                                className={`absolute top-full -left-4 mt-2 min-w-50 w-max bg-ean-black-accent border border-ean-border-dark py-2 shadow-[0_12px_32px_rgba(0,0,0,0.6)] z-50 flex flex-col ${state === 'open' ? 'ean-enter-dropdown' : 'ean-exit-dropdown'
                                  }`}
                              >
                                {dropdownItems.map((subItem) => {
                                  const isSubActive = pathname === subItem.href;
                                  return (
                                    <Link
                                      key={subItem.name}
                                      href={subItem.href}
                                      aria-current={isSubActive ? 'page' : undefined}
                                      onClick={() => setActiveDropdown(null)}
                                      className={`font-ui text-[13px] px-4.5 py-2 transition-colors duration-150 text-left whitespace-nowrap ${isSubActive
                                          ? 'text-ean-text-light bg-ean-text-light/5'
                                          : 'text-ean-slate hover:text-ean-blue-light hover:bg-ean-blue-muted/20'
                                        }`}
                                    >
                                      {subItem.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </Presence>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          aria-current={isActive ? 'page' : undefined}
                          className={`${linkClasses} block`}
                        >
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}

                {/* Single hairline shared by every nav item. Brand blue on
                    paper; over a photograph it is one step off black and
                    invisible, so it goes white with the links. */}
                <span
                  aria-hidden="true"
                  className={`${isIndicatorAnimated ? 'ean-indicator' : ''} absolute bottom-0 left-0 h-px ${isOnPhoto ? 'bg-white' : 'bg-ean-gold'} pointer-events-none`}
                  style={{
                    width: indicator?.width ?? 0,
                    transform: `translateX(${indicator?.left ?? 0}px)`,
                    opacity: indicator ? 1 : 0,
                  }}
                />
              </nav>

              {/* The floating pair mirrors `OutlineButton variant="photo"`,
                  the site's settled answer for an outline control on a scrimmed
                  photograph — a 50% white hairline resolving to a white fill
                  carrying blue type. */}
              <Link
                href={NAV_CTA.href}
                className={`font-ui font-semibold text-[11px] uppercase tracking-[0.08em] px-4 py-2.5 border transition-colors duration-300 whitespace-nowrap ${isOnPhoto
                    ? 'border-white/50 text-white hover:bg-white hover:text-ean-gold'
                    : 'border-ean-gold text-ean-text-light hover:bg-ean-gold hover:text-ean-text-dark'
                  }`}
              >
                {NAV_CTA.name}
              </Link>
            </div>

            {/* Below 1120px: the CTA stays reachable, as it does in the prototype,
                and everything else folds into the drawer. It is dropped on the
                narrowest phones, where it would crowd the mark. */}
            <div className="flex items-center gap-3 min-[1120px]:hidden">
              <Link
                href={NAV_CTA.href}
                className={`hidden sm:inline-block font-ui font-semibold text-[11px] uppercase tracking-[0.08em] px-4 py-2.5 border transition-colors duration-300 whitespace-nowrap ${isOnPhoto
                    ? 'border-white/50 text-white hover:bg-white hover:text-ean-gold'
                    : 'border-ean-gold text-ean-text-light hover:bg-ean-gold hover:text-ean-text-dark'
                  }`}
              >
                {NAV_CTA.name}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 -mr-2 transition-colors cursor-pointer ${isOnPhoto ? 'text-white hover:text-white/70' : 'text-ean-text-light hover:text-ean-blue-light'
                  }`}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Drawer */}
      <Presence show={isMobileMenuOpen} durationMs={300}>
        {(state) => (
          <div
            // The drawer sits under the header (z-40 to its z-50), so its top
            // padding has to clear whatever the chrome currently measures:
            // 102px with the ops strip open, 66px once it has wiped away.
            className={`fixed inset-0 z-40 bg-ean-black px-6.5 pb-12 flex flex-col overflow-y-auto min-[1120px]:hidden ${isScrolled ? 'pt-21.5' : 'pt-25.5'
              } ${state === 'open' ? 'ean-enter-down' : 'ean-exit-down'}`}
          >
            <nav className="flex flex-col border-t border-ean-border-dark">
              {NAV_ITEMS.map((item) => {
                const isActive = isItemActive(item);

                return (
                  <div key={item.name} className="flex flex-col border-b border-ean-border-dark">
                    {item.dropdownItems ? (
                      <>
                        <div className="flex items-center justify-between w-full">
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-current={pathname === item.href ? 'page' : undefined}
                            className={`font-ui text-sm uppercase tracking-[0.06em] transition-colors py-4 flex-1 text-left ${isActive ? 'text-ean-text-light' : 'text-ean-slate hover:text-ean-blue-light'
                              }`}
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => toggleMobileDropdown(item.name)}
                            className="p-3 -mr-3 text-ean-slate hover:text-ean-blue-light cursor-pointer shrink-0"
                            aria-label={`Toggle ${item.name} submenu`}
                            aria-expanded={mobileDropdownOpen === item.name}
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-300 ${mobileDropdownOpen === item.name ? 'rotate-180 text-ean-gold' : ''
                                }`}
                            />
                          </button>
                        </div>

                        {/* Grid-rows trick animates to intrinsic height without JS measurement */}
                        <div
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${mobileDropdownOpen === item.name
                              ? 'grid-rows-[1fr] opacity-100'
                              : 'grid-rows-[0fr] opacity-0'
                            }`}
                        >
                          <div className="overflow-hidden">
                            <div className="flex flex-col border-l border-ean-border-dark pl-4 ml-1 mb-4">
                              {item.dropdownItems.map((subItem) => {
                                const isSubActive = pathname === subItem.href;
                                return (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    onClick={() => {
                                      setIsMobileMenuOpen(false);
                                      setMobileDropdownOpen(null);
                                    }}
                                    aria-current={isSubActive ? 'page' : undefined}
                                    className={`font-ui text-[13px] transition-colors py-2.5 ${isSubActive ? 'text-ean-text-light' : 'text-ean-slate hover:text-ean-blue-light'
                                      }`}
                                  >
                                    {subItem.name}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`font-ui text-sm uppercase tracking-[0.06em] transition-colors py-4 ${isActive ? 'text-ean-text-light' : 'text-ean-slate hover:text-ean-blue-light'
                          }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* The one solid brass surface in the drawer: it is the single action
                on the screen, where the desktop bar's outline sits beside seven
                competing links. */}
            <Link
              href={NAV_CTA.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-8 w-full bg-ean-gold text-ean-text-dark py-4 text-center font-ui font-semibold text-[12.5px] uppercase tracking-[0.08em] hover:bg-ean-gold-light transition-colors duration-300"
            >
              {NAV_CTA.name}
            </Link>
          </div>
        )}
      </Presence>
    </>
  );
}
