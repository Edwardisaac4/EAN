'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail,
  ArrowUpRight,
  ArrowUp,
  Clock,
  ShieldCheck,
  Plane,
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
  const [isArrowHovered, setIsArrowHovered] = useState(false);

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

  return (
    <footer className="bg-gradient-to-b from-[#2D0710] via-[#1E050B] to-[#140307] border-t border-ean-gold/30 pt-12 sm:pt-16 pb-8 mt-auto relative overflow-hidden select-none">
      {/* Ambient background gold lighting */}
      <div className="absolute bottom-0 right-0 w-80 sm:w-120 h-80 sm:h-120 rounded-full bg-ean-gold/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-10 w-72 h-72 rounded-full bg-blue-950/30 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 relative z-10 space-y-10 sm:space-y-12">
        
        {/* Pre-Footer Action Banner */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#3B0913]/90 via-[#22060D]/80 to-[#3B0913]/90 border border-white/15 rounded-xs backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-2.5 bg-ean-gold/10 text-ean-gold rounded-xs border border-ean-gold/20 shrink-0 hidden sm:block">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display text-base sm:text-lg font-light text-white">
                Pioneering Business Aviation in West Africa
              </div>
              <p className="font-ui text-xs text-ean-muted-light">
                Direct FBO Terminal Handling • NCAA Approved MRO Hangar • Executive Jet Charters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <a
              href="tel:+2348050333410"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:border-ean-gold/40 text-xs text-white rounded-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-ean-gold" />
              <span>+234 (0) 805 033 3410</span>
            </a>
            <a
              href="/contact"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ean-gold text-ean-navy font-semibold text-xs rounded-xs hover:bg-ean-gold-light transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Flight Inquiry</span>
            </a>
          </div>
        </div>

        {/* Main Grid: Mobile, iPad & Desktop Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-ean-border-dark">
          
          {/* Brand & Overview (Mobile: Full width, iPad: md:col-span-2, Desktop: lg:col-span-4) */}
          <div className="md:col-span-2 lg:col-span-4 space-y-5">
            <div className="space-y-2">
              <Link href="/" className="inline-block">
                <span className="font-ui font-bold text-xl tracking-[0.25em] text-white hover:text-ean-gold transition-colors duration-300">
                  EAN AVIATION
                </span>
              </Link>
              <div className="h-0.5 w-12 bg-ean-gold rounded-full" />
            </div>

            <p className="font-ui text-xs sm:text-sm text-ean-muted-light leading-relaxed max-w-md">
              West Africa&apos;s premier business aviation conglomerate, operating Murtala Muhammed International Airport&apos;s first integrated FBO terminal, NCAA-approved maintenance organisation (AMO), and executive jet charters.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
                { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
                { icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook' },
              ].map((soc, idx) => {
                const IconComponent = soc.icon;
                return (
                  <motion.a
                    key={idx}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -3, color: '#C4952A' }}
                    transition={{ duration: 0.2 }}
                    className="w-10 h-10 rounded-xs bg-white/5 border border-white/10 flex items-center justify-center text-ean-muted-light hover:border-ean-gold/40 hover:text-ean-gold transition-colors cursor-pointer"
                    aria-label={soc.label}
                  >
                    <IconComponent className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Navigation Grid on Mobile/Tablet */}
          <div className="md:col-span-2 lg:col-span-5 grid grid-cols-2 gap-6">
            {/* Services Links Column */}
            <div className="space-y-4">
              <h4 className="font-ui text-xs font-bold uppercase tracking-widest text-ean-gold flex items-center gap-2">
                <Plane className="w-3.5 h-3.5 text-ean-gold" />
                Services
              </h4>
              <ul className="space-y-3 font-ui text-xs sm:text-sm text-ean-muted-light">
                {FOOTER_SERVICES_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="hover:text-white transition-colors flex items-center gap-1.5 group py-0.5"
                    >
                      <span>{link.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 md:opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-ean-gold" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Corporate Links Column */}
            <div className="space-y-4">
              <h4 className="font-ui text-xs font-bold uppercase tracking-widest text-ean-gold flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-ean-gold" />
                Company
              </h4>
              <ul className="space-y-3 font-ui text-xs sm:text-sm text-ean-muted-light">
                {FOOTER_COMPANY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="hover:text-white transition-colors flex items-center gap-1.5 group py-0.5"
                    >
                      <span>{link.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 md:opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-ean-gold" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Operations & Location Card (Mobile: Full width, iPad: md:col-span-2, Desktop: lg:col-span-3) */}
          <div className="md:col-span-2 lg:col-span-3 space-y-4">
            <h4 className="font-ui text-xs font-bold uppercase tracking-widest text-ean-gold flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-ean-gold" />
              Inquiries & Access
            </h4>
            
            <div className="p-4 bg-ean-navy-mid/60 border border-white/10 rounded-xs space-y-3.5 backdrop-blur-xs font-ui text-xs sm:text-sm text-ean-muted-light">
              <div className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                <span className="leading-relaxed text-white/90">MMIA Airport Hangar, Ikeja, Lagos, Nigeria</span>
              </div>
              
              <div className="flex gap-3 items-center pt-1 border-t border-white/5">
                <Phone className="w-4 h-4 text-ean-gold shrink-0" />
                <a href="tel:+2348050333410" className="hover:text-white transition-colors text-white/90">
                  +234 (0) 805 033 3410
                </a>
              </div>
              
              <div className="flex gap-3 items-center">
                <Mail className="w-4 h-4 text-ean-gold shrink-0" />
                <a href="mailto:info@ean.aero" className="hover:text-white transition-colors text-white/90">
                  info@ean.aero
                </a>
              </div>

              {/* Badges Row */}
              <div className="pt-2 flex flex-wrap gap-2 items-center border-t border-white/5">
                <span className="inline-flex items-center gap-1.5 border border-ean-gold/30 bg-ean-gold/10 text-ean-gold text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-ean-gold animate-pulse" />
                  24/7 Ops Desk
                </span>
                
                {lagosTime && (
                  <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 text-white/80 font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-xs">
                    <Clock className="w-3 h-3 text-ean-gold/70" />
                    LOS: {lagosTime}
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-2 sm:pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 sm:gap-4 text-xs tracking-wider text-ean-muted-light font-ui text-center sm:text-left">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} EAN Aviation Limited. All rights reserved.</p>
            <p className="text-[10px] text-ean-muted-light/60">NCAA Approved Maintenance Organisation (AMO) • Murtala Muhammed Airport, Lagos</p>
          </div>

          <div className="flex items-center gap-5 sm:gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors text-xs">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use" className="hover:text-white transition-colors text-xs">
              Terms of Use
            </Link>
            
            {/* Touch-Friendly Back to Top Button */}
            <button
              onClick={scrollToTop}
              onMouseEnter={() => setIsArrowHovered(true)}
              onMouseLeave={() => setIsArrowHovered(false)}
              className="w-10 h-10 rounded-xs border border-white/10 hover:border-ean-gold/40 flex items-center justify-center relative overflow-hidden transition-colors duration-300 text-ean-muted-light hover:text-ean-gold cursor-pointer bg-white/5 shrink-0"
              aria-label="Scroll to top"
            >
              <motion.div
                animate={{ y: isArrowHovered ? -25 : 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="absolute"
              >
                <ArrowUp className="w-4 h-4" />
              </motion.div>
              <motion.div
                initial={{ y: 25 }}
                animate={{ y: isArrowHovered ? 0 : 25 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="absolute"
              >
                <ArrowUp className="w-4 h-4" />
              </motion.div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
