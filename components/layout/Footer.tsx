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

  // The footer is a full-bleed photography band, not a paper section — it is
  // the closing half of the rhythm the paper ramp cannot carry on its own
  // (AGENTS.md §5). It therefore follows the photo idiom throughout: literal
  // white type over a black scrim, never a surface or text token. Do not
  // reintroduce `text-ean-text-light`, `ean-navy` or `ean-border-dark` here —
  // on a photograph they resolve to ink and near-white on near-black.
  //
  // `select-none` was removed because this footer prints the phone number and
  // email address, and blocking selection stopped visitors copying them.
  return (
    <footer className="bg-black pt-12 sm:pt-16 pb-8 mt-auto relative overflow-hidden">

      {/* Night-ramp photograph. Decorative, so `alt` is empty; no `priority`,
          because a footer is never the LCP element (AGENTS.md §8). */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Image
          src="/images/footer img.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={70}
          className="object-cover object-center"
        />
        {/* Two scrim layers, not one. The flat 65% is the legibility floor for
            the small type; the gradient adds weight only at the top and bottom
            — empty sky, and the brightest apron reflections under the legal
            line — so the middle band keeps the jet, the hangar and the taxiway
            lights visible instead of crushing the photograph to black. */}
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/10 to-black/55" />
      </div>

      <div className="max-w-ean mx-auto px-5 sm:px-6 md:px-8 relative z-10 space-y-10 sm:space-y-12">

        {/* Pre-Footer Action Banner */}
        <div className="p-4 sm:p-6 bg-black/40 border border-white/15 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-2.5 bg-white/10 text-white border border-white/20 shrink-0 hidden sm:block">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display text-base sm:text-lg font-light text-white">
                Pioneering Business Aviation in West Africa
              </div>
              <p className="font-ui text-xs text-white/65">
                Direct FBO Terminal Handling • AMO Hangar • Executive Jet Charters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <a
              href="tel:+2348050333410"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/25 hover:border-white/60 hover:bg-white/10 text-xs text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-white/70" />
              <span>+234 (0) 805 033 3410</span>
            </a>
            {/* The one accent that survives the scrim: the blue fill carries
                white type at 13.50:1 regardless of what is behind it, and the
                hero uses the same GoldButton over photography. */}
            <a
              href="/contact"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ean-gold border border-ean-gold text-ean-text-dark font-semibold text-xs hover:bg-ean-gold-light hover:border-ean-gold-light transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Flight Inquiry</span>
            </a>
          </div>
        </div>

        {/* Main Grid: 4 Columns (Brand, Services, Company, Inquiries & Access) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 sm:pb-12 border-b border-white/15">

          {/* Brand & Overview (Mobile: Full width, iPad: md:col-span-2, Desktop: lg:col-span-4) */}
          <div className="md:col-span-2 lg:col-span-4 space-y-4">
            <div className="space-y-2">
              <Link href="/" className="inline-flex items-center group">
                {/* The lockup is indigo-on-transparent and all but vanishes
                    against a night photograph. `brightness-0 invert` flattens
                    it to a white monochrome mark — the standard reverse
                    treatment — rather than setting it on a white plate that
                    would fight the image for attention. */}
                <Image
                  src="/images/new-logo.png"
                  alt="EAN Aviation Logo"
                  width={180}
                  height={48}
                  className="h-10 sm:h-11 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                />
              </Link>
            </div>

            <p className="font-ui text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm">
              Nigeria&apos;s first fully integrated Fixed Base Operator, operating an NCAA-approved Aircraft Maintenance Organization (AMO) and executive charter at Murtala Muhammed International Airport, Lagos.
            </p>

            <p className="font-ui text-xs sm:text-sm text-white/55 leading-relaxed pt-1">
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
                    className="w-9 h-9 bg-white/5 border border-white/20 flex items-center justify-center text-white/70 hover:border-white hover:text-white hover:-translate-y-0.5 transition-[color,border-color,transform] duration-200 cursor-pointer"
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
            <h4 className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-white">
              Services
            </h4>
            <ul className="space-y-2.5 font-ui text-xs sm:text-sm text-white/65">
              {FOOTER_SERVICES_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors flex items-center gap-1.5 group py-0.5"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-white" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links Column */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-white">
              Company
            </h4>
            <ul className="space-y-2.5 font-ui text-xs sm:text-sm text-white/65">
              {FOOTER_COMPANY_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors flex items-center gap-1.5 group py-0.5"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-white" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Inquiries & Access Card (Operations) */}
          <div className="md:col-span-2 lg:col-span-3 space-y-4">
            <h4 className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-white/70" />
              Inquiries & Access
            </h4>

            {/* The card carries the densest small type in the footer, so it
                gets its own darkening pass over the scrim rather than trusting
                whatever the photograph happens to put behind it. */}
            <div className="p-4 bg-black/35 border border-white/15 space-y-3.5 backdrop-blur-md font-ui text-xs sm:text-sm text-white/70">
              <div className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-white/70 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-white/85">
                  EAN Jet Center, FAAN Transit Camp Road, MMIA, Ikeja, Lagos, Nigeria
                </span>
              </div>

              <div className="flex gap-3 items-center pt-1 border-t border-white/15">
                <Phone className="w-4 h-4 text-white/70 shrink-0" />
                <a href="tel:+2348050333410" className="hover:text-white transition-colors text-white/85">
                  +234 (0) 805 033 3410
                </a>
              </div>

              <div className="flex gap-3 items-start pt-1 border-t border-white/15">
                <Mail className="w-4 h-4 text-white/70 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="mailto:dispatch@ean.aero" className="hover:text-white transition-colors text-white/85">
                    dispatch@ean.aero
                  </a>
                  <a href="mailto:info@ean.aero" className="hover:text-white transition-colors text-white/60 text-xs">
                    info@ean.aero
                  </a>
                </div>
              </div>

              {/* Badges Row */}
              <div className="pt-2 flex flex-wrap gap-2 items-center border-t border-white/15">
                <span className="inline-flex items-center gap-1.5 border border-white/30 bg-white/10 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  24/7 Ops Desk
                </span>

                <span className="inline-flex items-center gap-1.5 border border-white/20 bg-white/5 text-white/80 font-mono text-[10px] tracking-wider px-2.5 py-1">
                  LOS · DNMM · UTC+1
                </span>

                {lagosTime && (
                  <span className="inline-flex items-center gap-1.5 border border-white/20 bg-white/5 text-white/80 font-mono text-[10px] tracking-wider px-2.5 py-1">
                    <Clock className="w-3 h-3 text-white/60" />
                    LOS: {lagosTime}
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: 3 Columns (Copyright, NCAA AMO Center, Legal/BackToTop Right) */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60 font-ui text-center md:text-left">
          <div>
            <p suppressHydrationWarning>© {new Date().getFullYear()} EAN Aviation Limited. All rights reserved.</p>
          </div>

          <div>
            <p className="text-white/50">NCAA Approved Maintenance Organization (AMO) · MMIA, Lagos</p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/terms-of-use" className="hover:text-white transition-colors">
              Terms of Use
            </Link>

            {/* Touch-Friendly Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="group w-8 h-8 border border-white/20 hover:border-white flex items-center justify-center relative overflow-hidden transition-colors duration-300 text-white/70 hover:text-white cursor-pointer bg-white/5 shrink-0 ml-2"
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
