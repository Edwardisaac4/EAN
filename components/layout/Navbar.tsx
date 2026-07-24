'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { NAV_ITEMS, NAV_CTA } from '@/lib/constants';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
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
            <nav className="flex items-center gap-4 xl:gap-7">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdownItems && setActiveDropdown(item.name)}
                  onMouseLeave={() => item.dropdownItems && setActiveDropdown(null)}
                >
                  {item.dropdownItems ? (
                    <>
                      <Link
                        href={item.href}
                        className={`font-ui text-xs xl:text-sm tracking-widest transition-colors duration-300 relative py-2 flex items-center gap-1 cursor-pointer ${pathname === item.href || item.dropdownItems.some((sub) => pathname === sub.href)
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
                        {(pathname === item.href || item.dropdownItems.some((sub) => pathname === sub.href)) && (
                          <motion.span
                            layoutId="activeNavIndicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-ean-gold rounded-full shadow-[0_0_8px_rgba(196,149,42,0.8)]"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </Link>

                      <AnimatePresence>
                        {activeDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-52 bg-ean-navy-mid border border-ean-border-dark py-2 rounded-xs shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-50 flex flex-col"
                          >
                            {item.dropdownItems.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="font-ui text-xs tracking-widest text-ean-muted-light hover:text-white hover:bg-white/5 px-4 py-2.5 transition-colors duration-200 text-left"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`font-ui text-xs xl:text-sm tracking-widest transition-colors duration-300 relative py-2 block ${pathname === item.href
                          ? 'text-ean-gold font-medium'
                          : 'text-ean-muted-light hover:text-white'
                        }`}
                    >
                      <span>{item.name}</span>
                      {pathname === item.href && (
                        <motion.span
                          layoutId="activeNavIndicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-ean-gold rounded-full shadow-[0_0_8px_rgba(196,149,42,0.8)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  )}
                </div>
              ))}
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-ean-navy pt-24 px-6 md:px-12 flex flex-col gap-6 lg:hidden overflow-y-auto"
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

                      <AnimatePresence>
                        {mobileDropdownOpen === item.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden pl-4 flex flex-col gap-3 py-2 bg-black/10 rounded-sm"
                          >
                            {item.dropdownItems.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setMobileDropdownOpen(null);
                                }}
                                className="font-ui text-base tracking-widest text-ean-muted-light hover:text-white transition-colors py-1.5"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

