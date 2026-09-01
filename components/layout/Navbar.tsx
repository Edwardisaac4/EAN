'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import Presence from '@/components/shared/Presence';
import OpsStrip from '@/components/layout/OpsStrip';
import { NAV_ITEMS, NAV_CTA } from '@/lib/constants';

interface IndicatorRect {
  left: number;
  width: number;
}

/**
 * The v7 nav: a 66px ink bar, hairline bottom rule, 12.5px uppercase links in
 * slate, brass underline on the active item.
 *
 * Two deliberate departures from the prototype's `nav`, both forced by the fact
 * that this site's heroes are full-bleed and this is not a static page:
 *
 * 1. `fixed`, not `sticky`. Every page hero runs to the top of the viewport and
 *    offsets its own content (`pt-20` and up) to clear an overlaid bar. Making
 *    the nav sticky would push all thirteen heroes down by 66px, which is a
 *    change to every page rather than to this component. So the bar overlays,
 *    and earns its opaque background on scroll instead of carrying it at rest.
 * 2. A mobile drawer exists. The prototype simply hides its links below 1120px.
 *
 * Everything else is the prototype: 66px, a 95% page-ground fill over
 * `blur(12px)`, a 1160px wrap at 26px gutters, 23px link gap, 200px dropdowns
 * on the raised step behind a hairline border, and the outline CTA at 11px.
 *
 * The resting bar is opaque paper, not transparent, and that is a deliberate
 * change made with the v8 light theme rather than an oversight.
 *
 * On ink it could float: ivory links read over any hero. On paper the links are
 * INK, and the thirteen heroes are split — seven are full-bleed photographs
 * (home, /about, /contact, /history, /team, /charter, /services/[slug],
 * /the-aeroplex) where ink is invisible, and the rest are white sections where
 * white would be. One transparent bar cannot serve both, and the ops strip
 * above it is already opaque, so the bar carries the page ground at rest and
 * only gains its hairline and blur on scroll.
 *
 * The alternative — per-route knowledge of which heroes are photographs — is
 * real design work and belongs with the navbar comp, not with the palette swap.
 */
export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header className="fixed top-0 left-0 right-0 z-50">
        {/*
         * The ops strip rides above the bar and wipes away on the first scroll,
         * which is how it behaves in the prototype — there it simply is not
         * sticky. Here the whole header is fixed, so the strip has to be
         * collapsed deliberately rather than left behind. Chrome is 102px at
         * rest and 66px thereafter; the heroes clear both, being centred in
         * 600px+ of viewport.
         *
         * `inert` (React 19) takes the two links out of the tab order and the
         * accessibility tree while the strip is clipped to zero height.
         */}
        <div
          inert={isScrolled}
          className={`overflow-hidden transition-[height,opacity] duration-300 ${isScrolled ? 'h-0 opacity-0' : 'h-9 opacity-100'
            }`}
        >
          <OpsStrip />
        </div>

        <div
          className={`h-16.5 border-b transition-colors duration-300 ${isScrolled
              ? 'bg-ean-black/95 backdrop-blur-md border-ean-border-dark'
              : 'bg-ean-black border-transparent'
            }`}
        >
          <div className="max-w-ean mx-auto h-full px-6.5 flex items-center justify-between gap-4">
            {/* Brand */}
            <Link href="/" className="flex items-center shrink-0" aria-label="EAN Aviation, home">
              <Image
                src="/images/new-logo.png"
                alt="EAN Aviation"
                width={180}
                height={48}
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

                  const linkClasses = `font-ui text-[12.5px] uppercase tracking-[0.06em] leading-none pt-2.5 pb-[3px] transition-colors duration-200 ${isActive ? 'text-ean-text-light' : 'text-ean-slate hover:text-ean-blue-light'
                    }`;

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
                              className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-ean-gold' : ''
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

                {/* Single brass hairline shared by every nav item */}
                <span
                  aria-hidden="true"
                  className={`${isIndicatorAnimated ? 'ean-indicator' : ''} absolute bottom-0 left-0 h-px bg-ean-gold pointer-events-none`}
                  style={{
                    width: indicator?.width ?? 0,
                    transform: `translateX(${indicator?.left ?? 0}px)`,
                    opacity: indicator ? 1 : 0,
                  }}
                />
              </nav>

              <Link
                href={NAV_CTA.href}
                className="font-ui font-semibold text-[11px] uppercase tracking-[0.08em] px-4 py-2.5 border border-ean-gold text-ean-text-light hover:bg-ean-gold hover:text-ean-text-dark transition-colors duration-300 whitespace-nowrap"
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
                className="hidden sm:inline-block font-ui font-semibold text-[11px] uppercase tracking-[0.08em] px-4 py-2.5 border border-ean-gold text-ean-text-light hover:bg-ean-gold hover:text-ean-text-dark transition-colors duration-300 whitespace-nowrap"
              >
                {NAV_CTA.name}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-ean-text-light p-2 -mr-2 hover:text-ean-blue-light transition-colors cursor-pointer"
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
