'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  ArrowUp,
  Clock,
  Compass
} from 'lucide-react';

import { FOOTER_SERVICES_LINKS, FOOTER_COMPANY_LINKS } from '@/lib/constants';

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function Footer() {
  const [lagosTime, setLagosTime] = useState('');

  // Live Lagos Local Time (GMT+1) Clock
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const updateLagosTime = () => {
      try {
        const formatted = new Date().toLocaleTimeString('en-US', {
          timeZone: 'Africa/Lagos',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
        setLagosTime((prev) => (prev !== formatted ? formatted : prev));
      } catch {
        // Fallback safety
      }
    };

    const timeoutId = setTimeout(() => {
      updateLagosTime();
      intervalId = setInterval(updateLagosTime, 1000);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gradient uses tokens, not raw hex — #2D0710/#1E050B/#140307 were literal
  // restatements of ean-navy / ean-navy-mid / ean-black (AGENTS.md §5).
  // `select-none` was removed because this footer prints the phone number and
  // email address, and blocking selection stopped visitors copying them.
  return (
    <footer className="bg-linear-to-b from-ean-navy via-ean-navy-mid to-ean-black border-t border-ean-gold/30 pt-12 sm:pt-16 pb-8 mt-auto relative overflow-hidden">
      {/* Ambient background gold lighting */}
      <div className="absolute bottom-0 right-0 w-80 sm:w-120 h-80 sm:h-120 rounded-full bg-ean-gold/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-10 w-72 h-72 rounded-full bg-blue-950/30 blur-[100px] pointer-events-none" />

      <div className="max-w-ean mx-auto px-5 sm:px-6 md:px-8 relative z-10 space-y-10 sm:space-y-12">

        {/* Pre-Footer Action Banner */}
        <div className="p-4 sm:p-6 bg-linear-to-r from-ean-navy via-ean-navy-mid to-ean-navy border border-ean-border-dark backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-2.5 bg-ean-gold/10 text-ean-gold border border-ean-gold/20 shrink-0 hidden sm:block">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display text-base sm:text-lg font-light text-ean-text-light">
                Pioneering Business Aviation in West Africa
              </div>
              <p className="font-ui text-xs text-ean-muted-light">
                Direct FBO Terminal Handling • AMO Hangar • Executive Jet Charters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <a
              href="tel:+2348050333410"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-ean-border-dark hover:border-ean-blue/50 text-xs text-ean-text-light transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-ean-gold" />
              <span>+234 (0) 805 033 3410</span>
            </a>
            <a
              href="/contact"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ean-gold text-ean-navy font-semibold text-xs hover:bg-ean-gold-light transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Flight Inquiry</span>
            </a>
          </div>
        </div>

        {/* Main Grid: 4 Columns (Brand, Services, Company, Inquiries & Access) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 sm:pb-12 border-b border-ean-border-dark">

          {/* Brand & Overview (Mobile: Full width, iPad: md:col-span-2, Desktop: lg:col-span-4) */}
          <div className="md:col-span-2 lg:col-span-4 space-y-4">
            <div className="space-y-2">
              <Link href="/" className="inline-flex items-center group">
                <Image
                  src="/images/new-logo.png"
                  alt="EAN Aviation Logo"
                  width={180}
                  height={48}
                  className="h-10 sm:h-11 w-auto object-contain opacity-95 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                />
              </Link>
            </div>

            <p className="font-ui text-xs sm:text-sm text-ean-muted-light leading-relaxed max-w-sm">
              Nigeria&apos;s first fully integrated Fixed Base Operator, operating an NCAA-approved Aircraft Maintenance Organization (AMO) and executive charter at Murtala Muhammed International Airport, Lagos.
            </p>

            <p className="font-ui text-xs sm:text-sm text-ean-muted-light/80 leading-relaxed pt-1">
              EAN Jet Center, FAAN Transit Camp Road<br />
              MMIA, Ikeja, Lagos, Nigeria
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: LinkedinIcon, href: 'https://www.linkedin.com/company/ean-aviation-limited/', label: 'LinkedIn' },
                { icon: InstagramIcon, href: 'https://www.instagram.com/eanaviationltd/', label: 'Instagram' },
                { icon: FacebookIcon, href: 'https://www.facebook.com/eanaviationltd/', label: 'Facebook' },
              ].map((soc, idx) => {
                const IconComponent = soc.icon;
                return (
                  <a
                    key={idx}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/5 border border-ean-border-dark flex items-center justify-center text-ean-muted-light hover:border-ean-blue/60 hover:text-ean-blue-light hover:-translate-y-0.5 transition-[color,border-color,transform] duration-200 cursor-pointer"
                    aria-label={soc.label}
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services Links Column */}
          <div className="space-y-4 lg:col-span-3">
            <h4 className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-ean-gold">
              Services
            </h4>
            <ul className="space-y-2.5 font-ui text-xs sm:text-sm text-ean-muted-light">
              {FOOTER_SERVICES_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-ean-text-light transition-colors flex items-center gap-1.5 group py-0.5"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-ean-gold" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links Column */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-ean-gold">
              Company
            </h4>
            <ul className="space-y-2.5 font-ui text-xs sm:text-sm text-ean-muted-light">
              {FOOTER_COMPANY_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-ean-text-light transition-colors flex items-center gap-1.5 group py-0.5"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-ean-gold" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Inquiries & Access Card (Operations) */}
          <div className="md:col-span-2 lg:col-span-3 space-y-4">
            <h4 className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-ean-gold flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-ean-gold" />
              Inquiries & Access
            </h4>

            <div className="p-4 bg-ean-navy-mid/60 border border-ean-border-dark space-y-3.5 backdrop-blur-xs font-ui text-xs sm:text-sm text-ean-muted-light">
              <div className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                <span className="leading-relaxed text-ean-text-light/90">
                  EAN Jet Center, FAAN Transit Camp Road, MMIA, Ikeja, Lagos, Nigeria
                </span>
              </div>

              <div className="flex gap-3 items-center pt-1 border-t border-ean-border-dark">
                <Phone className="w-4 h-4 text-ean-gold shrink-0" />
                <a href="tel:+2348050333410" className="hover:text-ean-text-light transition-colors text-ean-text-light/90">
                  +234 (0) 805 033 3410
                </a>
              </div>

              <div className="flex gap-3 items-start pt-1 border-t border-ean-border-dark">
                <Mail className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="mailto:dispatch@ean.aero" className="hover:text-ean-text-light transition-colors text-ean-text-light/90">
                    dispatch@ean.aero
                  </a>
                  <a href="mailto:info@ean.aero" className="hover:text-ean-text-light transition-colors text-ean-muted-light text-xs">
                    info@ean.aero
                  </a>
                </div>
              </div>

              {/* Badges Row */}
              <div className="pt-2 flex flex-wrap gap-2 items-center border-t border-ean-border-dark">
                <span className="inline-flex items-center gap-1.5 border border-ean-gold/30 bg-ean-gold/10 text-ean-gold text-[10px] uppercase font-bold tracking-widest px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ean-gold animate-pulse" />
                  24/7 Ops Desk
                </span>

                <span className="inline-flex items-center gap-1.5 border border-ean-border-dark bg-white/5 text-ean-text-light/80 font-mono text-[10px] tracking-wider px-2.5 py-1">
                  LOS · DNMM · UTC+1
                </span>

                {lagosTime && (
                  <span className="inline-flex items-center gap-1.5 border border-ean-border-dark bg-white/5 text-ean-text-light/80 font-mono text-[10px] tracking-wider px-2.5 py-1">
                    <Clock className="w-3 h-3 text-ean-gold/70" />
                    LOS: {lagosTime}
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: 3 Columns (Copyright, NCAA AMO Center, Legal/BackToTop Right) */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ean-muted-light font-ui text-center md:text-left">
          <div>
            <p suppressHydrationWarning>© {new Date().getFullYear()} EAN Aviation Limited. All rights reserved.</p>
          </div>

          <div>
            <p className="text-ean-muted-light/70">NCAA Approved Maintenance Organization (AMO) · MMIA, Lagos</p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-ean-text-light transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/terms-of-use" className="hover:text-ean-text-light transition-colors">
              Terms of Use
            </Link>

            {/* Touch-Friendly Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="group w-8 h-8 border border-ean-border-dark hover:border-ean-blue/60 flex items-center justify-center relative overflow-hidden transition-colors duration-300 text-ean-muted-light hover:text-ean-blue-light cursor-pointer bg-white/5 shrink-0 ml-2"
              aria-label="Scroll to top"
            >
              <div className="absolute transition-transform duration-220 ease-in-out group-hover:-translate-y-5.5">
                <ArrowUp className="w-3.5 h-3.5" />
              </div>
              <div className="absolute translate-y-5.5 transition-transform duration-220 ease-in-out group-hover:translate-y-0">
                <ArrowUp className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
