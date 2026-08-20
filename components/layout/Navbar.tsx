'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import Presence from '@/components/shared/Presence';
import { NAV_ITEMS, NAV_CTA } from '@/lib/constants';

interface IndicatorRect {
  left: number;
  width: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);

  // Sliding gold underline. Replaces framer-motion's layoutId morph: one
  // absolutely positioned bar inside the nav, translated onto whichever item
  // matches the current route.
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

    // The nav resizes while the header shrinks on scroll, so observing it keeps
    // the underline attached to its item throughout that transition.
    const observer = new ResizeObserver(measureIndicator);
    observer.observe(nav);
    window.addEventListener('resize', measureIndicator);

    // Web fonts can change item widths after first measure.
    document.fonts?.ready.then(measureIndicator).catch(() => {});

    return () => {
      cancelAnimationFrame(enableFrame);
      observer.disconnect();
      window.removeEventListener('resize', measureIndicator);
    };
  }, [measureIndicator]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileDropdown = (name: string) => {
    setMobileDropdownOpen(mobileDropdownOpen === name ? null : name);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 pointer-events-none ${isScrolled ? 'py-0' : 'py-6'
          }`}
      >
        <div
          className={`transition-all duration-500 ease-in-out flex items-center justify-between pointer-events-auto ${isScrolled
              ? 'max-w-6xl mx-auto mt-4 px-6 md:px-8 py-3.5 rounded-full bg-ean-navy/80 dark:bg-ean-navy/60 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] w-[calc(100%-2rem)] lg:w-[calc(100%-4rem)]'
              : 'max-w-7xl mx-auto px-6 md:px-8 py-0 rounded-none bg-transparent border-b border-transparent w-full'
            }`}
        >
          {/* Logo */}
          <Link href="/" className="group flex items-center">
            <Image
              src="/images/EAN-Logo.png"
              alt="EAN Aviation Logo"
              width={180}
              height={48}
              className="h-8 sm:h-9 md:h-10 w-auto object-contain filter brightness-0 invert opacity-95 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop & Tablet Landscape Navigation + CTA */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-8">
            <nav ref={navRef} className="relative flex items-center gap-4 xl:gap-7">
              {NAV_ITEMS.map((item) => {
                const isActive = isItemActive(item);
                // Bound outside the render prop below so the narrowing survives.
                const dropdownItems = item.dropdownItems;

                return (
                  <div
                    key={item.name}
                    ref={(el) => {
                      itemRefs.current[item.name] = el;
                    }}
                    className="relative"
                    onMouseEnter={() => dropdownItems && setActiveDropdown(item.name)}
                    onMouseLeave={() => dropdownItems && setActiveDropdown(null)}
                  >
                    {dropdownItems ? (
                      <>
                        <Link
                          href={item.href}
                          className={`font-ui text-xs xl:text-sm tracking-widest transition-colors duration-300 relative py-2 flex items-center gap-1 cursor-pointer ${isActive
                              ? 'text-ean-gold font-medium'
                              : 'text-ean-muted-light hover:text-white'
                            }`}
                        >
                          <span>{item.name}</span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180 text-ean-gold' : ''
                              }`}
                          />
                        </Link>

                        <Presence show={activeDropdown === item.name} durationMs={200}>
                          {(state) => (
                            <div
                              className={`absolute top-full left-1/2 mt-1 min-w-55 w-max bg-ean-navy-mid border border-ean-border-dark py-2 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-50 flex flex-col ${state === 'open' ? 'ean-enter-dropdown' : 'ean-exit-dropdown'
                                }`}
                            >
                              {dropdownItems.map((subItem) => {
                                const isSubActive = pathname === subItem.href;
                                return (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    className={`font-ui text-xs tracking-wider px-4 py-2.5 transition-colors duration-200 text-left whitespace-nowrap ${isSubActive
                                        ? 'text-ean-gold font-medium bg-white/5'
                                        : 'text-ean-muted-light hover:text-white hover:bg-white/5'
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
                        className={`font-ui text-xs xl:text-sm tracking-widest transition-colors duration-300 relative py-2 block ${isActive
                            ? 'text-ean-gold font-medium'
                            : 'text-ean-muted-light hover:text-white'
                          }`}
                      >
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* Single sliding underline shared by every nav item */}
              <span
                aria-hidden="true"
                className={`${isIndicatorAnimated ? 'ean-indicator' : ''} absolute bottom-0 left-0 h-0.5 bg-ean-gold rounded-full shadow-[0_0_8px_rgba(196,149,42,0.8)] pointer-events-none`}
                style={{
                  width: indicator?.width ?? 0,
                  transform: `translateX(${indicator?.left ?? 0}px)`,
                  opacity: indicator ? 1 : 0,
                }}
              />
            </nav>
            <Link href={NAV_CTA.href}>
              <button className="bg-ean-gold hover:bg-ean-gold-light text-ean-navy text-xs font-ui font-bold uppercase tracking-widest px-5 xl:px-6 py-2 rounded-full transition-all duration-300 cursor-pointer shadow-[0_4px_12px_rgba(196,149,42,0.15)] hover:shadow-[0_4px_18px_rgba(196,149,42,0.3)]">
                {NAV_CTA.name}
              </button>
            </Link>
          </div>

          {/* Mobile & iPad Portrait Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2 focus:outline-none hover:text-ean-gold transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile & iPad Menu Drawer Overlay */}
      <Presence show={isMobileMenuOpen} durationMs={300}>
        {(state) => (
          <div
            className={`fixed inset-0 z-40 bg-ean-navy pt-24 px-6 md:px-12 flex flex-col gap-6 lg:hidden overflow-y-auto ${state === 'open' ? 'ean-enter-down' : 'ean-exit-down'
              }`}
          >
            <nav className="flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <div key={item.name} className="flex flex-col border-b border-ean-border-dark py-1">
                  {item.dropdownItems ? (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`font-ui text-lg tracking-widest transition-colors py-2 flex-1 text-left ${pathname === item.href
                              ? 'text-ean-gold font-semibold'
                              : 'text-white hover:text-ean-gold'
                            }`}
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => toggleMobileDropdown(item.name)}
                          className="p-2.5 text-ean-muted-light hover:text-ean-gold cursor-pointer shrink-0"
                          aria-label={`Toggle ${item.name} Submenu`}
                        >
                          <ChevronDown
                            size={18}
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
                          <div className="pl-4 flex flex-col gap-3 py-2 bg-black/10 rounded-sm">
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
                                  className={`font-ui text-base tracking-widest transition-colors py-1.5 ${isSubActive
                                      ? 'text-ean-gold font-semibold'
                                      : 'text-ean-muted-light hover:text-white'
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
                      className="font-ui text-lg tracking-widest text-white hover:text-ean-gold transition-colors py-2"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile CTA */}
            <div className="mt-6 pt-4 border-t border-ean-border-dark flex flex-col">
              <Link href={NAV_CTA.href} onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full bg-ean-gold hover:bg-ean-gold-light text-ean-navy py-3.5 text-center text-sm font-ui font-semibold uppercase tracking-widest rounded-full cursor-pointer shadow-[0_4px_12px_rgba(196,149,42,0.15)]">
                  {NAV_CTA.name}
                </button>
              </Link>
            </div>
          </div>
        )}
      </Presence>
    </>
  );
}
