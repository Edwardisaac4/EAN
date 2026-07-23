'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Scale,
  FileText,
  CheckCircle2,
  UserCheck,
  Search,
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronRight,
  Send,
  AlertCircle,
  Building2,
  Database,
  Eye,
  RefreshCw,
  FileCheck,
  Globe2,
  Cookie,
  Share2,
  X
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import SectionReveal from '@/components/shared/SectionReveal';
import GoldButton from '@/components/shared/GoldButton';
import { PRIVACY_POLICY_SECTIONS, LegalSection } from '@/lib/constants';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale,
  Database,
  Eye,
  Globe2,
  FileCheck,
  UserCheck,
  Clock,
  RefreshCw,
  Lock,
  Share2,
  Cookie,
  Mail,
  ShieldCheck,
  FileText
};

export default function PrivacyPolicyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('lawful-basis');
  const [isDSAROpen, setIsDSAROpen] = useState(false);
  const [dsarForm, setDsarForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    requestType: 'access',
    details: ''
  });
  const [dsarSubmitted, setDsarSubmitted] = useState(false);
  const sidebarNavRef = useRef<HTMLDivElement>(null);
  const isManualScrollRef = useRef(false);

  // Filtered Sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return PRIVACY_POLICY_SECTIONS;
    const q = searchQuery.toLowerCase();
    return PRIVACY_POLICY_SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.content.some(
          (c) => c.subtitle.toLowerCase().includes(q) || c.text.toLowerCase().includes(q)
        )
    );
  }, [searchQuery]);

  // Scroll Spy to keep activeSection aligned as user scrolls through the document
  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrollRef.current) return;

      const headerOffset = 120;
      const scrollPosition = window.scrollY + headerOffset;

      for (let i = filteredSections.length - 1; i >= 0; i--) {
        const section = filteredSections[i];
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top - 10) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [filteredSections]);

  // Auto scroll sidebar list to keep active section item visible
  useEffect(() => {
    if (activeSection && sidebarNavRef.current) {
      const activeBtn = sidebarNavRef.current.querySelector<HTMLElement>(`[data-section-id="${activeSection}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeSection]);

  const handleDSARSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDsarSubmitted(true);
    setTimeout(() => {
      setDsarSubmitted(false);
      setIsDSAROpen(false);
      setDsarForm({
        fullName: '',
        email: '',
        phone: '',
        requestType: 'access',
        details: ''
      });
    }, 2500);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    isManualScrollRef.current = true;
    const element = document.getElementById(id);
    if (element) {
      const targetOffset = 110; // Clean clearance for sticky navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset - targetOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setTimeout(() => {
      isManualScrollRef.current = false;
    }, 900);
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col bg-ean-navy text-white min-h-screen">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 bg-linear-to-b from-ean-navy via-ean-navy-mid to-ean-navy border-b border-ean-border-dark overflow-hidden">
          {/* Ambient Gold Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 h-160 rounded-full bg-ean-gold/5 blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 border border-ean-gold/30 bg-ean-gold/10 text-ean-gold text-xs font-semibold uppercase tracking-[0.25em] px-4 py-1.5 rounded-xs">
              <ShieldCheck className="w-4 h-4 text-ean-gold" />
              <span>NDPA 2023 COMPLIANT • DATA PROTECTION</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
              Privacy Policy
            </h1>

            <p className="font-ui text-base sm:text-lg text-ean-muted-light max-w-3xl mx-auto leading-relaxed">
              EAN Aviation Limited (“EAN”, “we”, “us”, “our”) is committed to protecting your personal data in accordance with the provisions of the Nigeria Data Protection Act 2023 and applicable aviation data governance frameworks.
            </p>

            {/* Quick Metadata Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-ui text-ean-muted-light">
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xs">
                <Clock className="w-3.5 h-3.5 text-ean-gold" />
                Last Updated: <strong className="text-white">15 October 2025</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xs">
                <Building2 className="w-3.5 h-3.5 text-ean-gold" />
                Entity: <strong className="text-white">EAN Aviation Limited</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xs">
                <Mail className="w-3.5 h-3.5 text-ean-gold" />
                DPO Contact: <strong className="text-white">info@ean.aero</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:info@ean.aero?subject=Privacy%20Policy%20Inquiry"
                className="inline-flex items-center gap-2 bg-ean-gold hover:bg-ean-gold-light text-ean-navy border border-ean-gold text-xs uppercase tracking-wider font-bold px-6 py-3.5 rounded-xs transition-colors shadow-xs"
              >
                <Mail className="w-4 h-4 text-ean-navy" />
                <span>Contact DPO Desk</span>
              </a>
            </div>
          </div>
        </section>

        {/* MAIN BODY CONTENT */}
        <section className="bg-ean-white text-ean-text-dark py-16 sm:py-20 flex-1">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* LEFT SIDEBAR: Table of Contents */}
              <aside className="hidden lg:block lg:col-span-4 sticky top-40 space-y-6">
                <div className="bg-ean-surface border border-ean-border-light/60 p-6 rounded-xs space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-ean-border-light pb-3">
                    <FileText className="w-4 h-4 text-ean-gold" />
                    <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-ean-navy">
                      Policy Index
                    </h3>
                  </div>

                  {/* Clause Filter Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-ean-gold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search clauses (e.g. cookies)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-ean-white border border-ean-border-light rounded-xs pl-8 pr-7 py-2 text-xs text-ean-navy placeholder:text-ean-muted-dark/60 focus:outline-none focus:border-ean-gold transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ean-muted-dark hover:text-ean-navy text-xs font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <nav ref={sidebarNavRef} className="space-y-1 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredSections.map((sec) => {
                      const isActive = activeSection === sec.id;
                      return (
                        <button
                          key={sec.id}
                          data-section-id={sec.id}
                          onClick={() => scrollToSection(sec.id)}
                          className={`w-full text-left flex items-center justify-between gap-3 p-2.5 rounded-xs text-xs font-ui transition-all duration-200 cursor-pointer relative ${
                            isActive
                              ? 'bg-ean-navy text-white font-semibold shadow-xs border-l-2 border-ean-gold pl-3'
                              : 'text-ean-muted-dark hover:bg-black/5 hover:text-ean-navy'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-ean-gold' : 'text-ean-muted-dark'}`}>
                              {sec.num}
                            </span>
                            <span className="line-clamp-1">{sec.title}</span>
                          </div>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-ean-gold shrink-0 animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </aside>

              {/* RIGHT CONTENT AREA */}
              <div className="lg:col-span-8 space-y-12">
                
                {/* PREAMBLE CARD */}
                <SectionReveal>
                  <div className="bg-ean-navy text-white p-8 rounded-xs space-y-4 shadow-lg border-l-4 border-ean-gold">
                    <span className="font-ui text-xs uppercase tracking-[0.2em] text-ean-gold font-semibold block">
                      Scope & Acceptance
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-light text-white">
                      Application of Policy
                    </h2>
                    <p className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                      This privacy policy (“Policy”) applies to the website(s) and mobile application(s) (hereinafter referred to as, the “Sites”) provided by EAN Aviation Limited (“EAN”, “we”, “us”, “our”), including but not limited to flight operations, aircraft management, maintenance, ground handling, and other products/services of EAN. This Policy discloses our data protection practices on our Sites, products and service (“Services”), inclusive of the type of personal data that we collect, our method of collection of personal data, use of personal data and procedures for sharing personal data with third parties.
                    </p>
                    <p className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                      The Sites covered by this Policy include our existing websites, mobile applications and all other additional websites and mobile applications produced and managed by EAN. We are committed to protecting your personal data in accordance with the provisions of the <strong>Nigeria Data Protection Act 2023</strong> and other applicable data protection laws, Regulations and Directives (“Data Protection Laws”).
                    </p>
                    <div className="pt-2 border-t border-white/10 text-xs text-ean-gold/90 font-ui italic">
                      By visiting the Sites or continuing to use our services, you accept and consent to the practices contained in this privacy policy.
                    </div>
                  </div>
                </SectionReveal>

                {/* POLICY SECTIONS ITERATION */}
                {filteredSections.length === 0 ? (
                  <div className="text-center py-16 bg-ean-surface border border-ean-border-light rounded-xs space-y-3">
                    <AlertCircle className="w-8 h-8 text-ean-gold mx-auto" />
                    <h3 className="font-display text-xl font-medium text-ean-navy">No matching policy sections found</h3>
                    <p className="font-ui text-sm text-ean-muted-dark">Try searching with a different term like &quot;consent&quot;, &quot;retention&quot;, &quot;cookies&quot;, or &quot;DPO&quot;.</p>
                  </div>
                ) : (
                  filteredSections.map((section) => {
                    const IconComponent = ICON_MAP[section.iconName] || FileText;
                    return (
                      <SectionReveal key={section.id}>
                        <article
                          id={section.id}
                          className="bg-ean-surface border border-ean-border-light/60 p-8 sm:p-10 rounded-xs space-y-6 shadow-xs hover:border-ean-gold/30 transition-all duration-300 scroll-mt-36"
                        >
                          {/* Section Header */}
                          <div className="flex items-start justify-between gap-4 border-b border-ean-border-light/60 pb-5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs font-bold text-ean-gold bg-ean-gold/10 px-2.5 py-1 rounded-xs border border-ean-gold/20">
                                  SECTION {section.num}
                                </span>
                                <span className="font-ui text-xs font-semibold tracking-widest text-ean-muted-dark uppercase">
                                  Legal Framework
                                </span>
                              </div>
                              <h2 className="font-display text-2xl sm:text-3xl font-medium text-ean-navy pt-1">
                                {section.title}
                              </h2>
                            </div>
                            <div className="w-10 h-10 rounded-xs bg-ean-navy/5 flex items-center justify-center text-ean-gold shrink-0 border border-ean-gold/20">
                              <IconComponent className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Section Summary */}
                          <p className="font-ui text-sm font-semibold text-ean-navy bg-ean-white p-4 rounded-xs border-l-2 border-ean-gold">
                            {section.summary}
                          </p>

                          {/* Section Sub-blocks */}
                          <div className="space-y-6 font-ui text-sm sm:text-base text-ean-muted-dark leading-relaxed">
                            {section.content.map((block, idx) => (
                              <div key={idx} className="space-y-2">
                                <h3 className="font-ui font-bold text-sm text-ean-navy uppercase tracking-wider flex items-center gap-2">
                                  <ChevronRight className="w-4 h-4 text-ean-gold shrink-0" />
                                  <span>{block.subtitle}</span>
                                </h3>
                                <p className="pl-6 text-ean-muted-dark">{block.text}</p>
                              </div>
                            ))}
                          </div>

                          {/* SECTION SPECIFIC ENHANCEMENTS */}
                          
                          {/* Section 1: Lawful Basis Badges */}
                          {section.id === 'lawful-basis' && (
                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-4 font-ui text-xs font-semibold">
                              <div className="bg-ean-white p-3 border border-ean-border-light rounded-xs text-center text-ean-navy col-span-1 sm:col-span-2">
                                🔒 Consent
                              </div>
                              <div className="bg-ean-white p-3 border border-ean-border-light rounded-xs text-center text-ean-navy col-span-1 sm:col-span-2">
                                ✈️ Contract Performance
                              </div>
                              <div className="bg-ean-white p-3 border border-ean-border-light rounded-xs text-center text-ean-navy col-span-1 sm:col-span-2">
                                ⚖️ Legal Obligation
                              </div>
                              <div className="bg-ean-white p-3 border border-ean-border-light rounded-xs text-center text-ean-navy col-span-1 sm:col-span-3">
                                🚑 Vital Interest
                              </div>
                              <div className="bg-ean-white p-3 border border-ean-border-light rounded-xs text-center text-ean-navy col-span-2 sm:col-span-3">
                                🏛️ Public Interest
                              </div>
                            </div>
                          )}

                          {/* Section 6: Rights List Card */}
                          {section.id === 'data-subject-rights' && (
                            <div className="bg-ean-navy text-white p-6 rounded-xs space-y-4 font-ui text-xs sm:text-sm">
                              <h4 className="font-display text-lg text-white font-light border-b border-white/10 pb-2">
                                Summary of Your 9 Core NDPA Rights
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex gap-2 items-start">
                                  <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                                  <span>Right to be Informed</span>
                                </div>
                                <div className="flex gap-2 items-start">
                                  <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                                  <span>Right to Copy of Personal Data</span>
                                </div>
                                <div className="flex gap-2 items-start">
                                  <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                                  <span>Right to Correction / Rectification</span>
                                </div>
                                <div className="flex gap-2 items-start">
                                  <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                                  <span>Right to Erasure (&quot;Right to be Forgotten&quot;)</span>
                                </div>
                                <div className="flex gap-2 items-start">
                                  <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                                  <span>Right to Withdraw Consent</span>
                                </div>
                                <div className="flex gap-2 items-start">
                                  <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                                  <span>Right to Object to Processing</span>
                                </div>
                                <div className="flex gap-2 items-start">
                                  <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                                  <span>Right to Object to Automated Profiling</span>
                                </div>
                                <div className="flex gap-2 items-start">
                                  <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                                  <span>Right to Data Portability</span>
                                </div>
                                <div className="flex gap-2 items-start sm:col-span-2 text-ean-gold font-semibold pt-1">
                                  <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                                  <span>Right to Lodge a Complaint with the Nigeria Data Protection Commission (NDPC)</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Section 7: PCIDSS Highlight Box */}
                          {section.id === 'retention' && (
                            <div className="bg-ean-gold/10 border border-ean-gold/30 p-5 rounded-xs space-y-2 font-ui text-xs sm:text-sm text-ean-navy">
                              <div className="flex items-center gap-2 font-bold text-ean-navy uppercase tracking-wider">
                                <Lock className="w-4 h-4 text-ean-gold" />
                                <span>PCI DSS Mandatory 10-Year Retention Mandate</span>
                              </div>
                              <p className="text-ean-muted-dark">
                                Under our Payment Card Industry Data Security Standard (PCIDSS) obligation, we are legally required to retain transaction and identity records for a minimum of ten (10) years from the end date of our business relationship with you.
                              </p>
                            </div>
                          )}

                          {/* Section 11: Cookies Classification Table */}
                          {section.id === 'cookies' && (
                            <div className="overflow-x-auto pt-2">
                              <table className="w-full text-left border-collapse font-ui text-xs">
                                <thead>
                                  <tr className="bg-ean-navy text-white">
                                    <th className="p-3 font-semibold uppercase">Cookie Type</th>
                                    <th className="p-3 font-semibold uppercase">Description</th>
                                    <th className="p-3 font-semibold uppercase">User Control</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-ean-border-light text-ean-muted-dark">
                                  <tr className="bg-ean-white">
                                    <td className="p-3 font-bold text-ean-navy">Necessary Cookies</td>
                                    <td className="p-3">Essential for core security, session login, and flight engine features.</td>
                                    <td className="p-3 font-semibold text-xs text-red-600">Mandatory (Cannot Disable)</td>
                                  </tr>
                                  <tr className="bg-ean-surface">
                                    <td className="p-3 font-bold text-ean-navy">Performance & Analytics</td>
                                    <td className="p-3">Gathers technical metrics and traffic patterns to optimize layout.</td>
                                    <td className="p-3 font-semibold text-xs text-ean-gold">Configurable via Settings</td>
                                  </tr>
                                  <tr className="bg-ean-white">
                                    <td className="p-3 font-bold text-ean-navy">Advertising & Targeting</td>
                                    <td className="p-3">Delivers tailored aviation offers and relevant announcements.</td>
                                    <td className="p-3 font-semibold text-xs text-ean-gold">Configurable via Settings</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Section 13: DPO Contact Card */}
                          {section.id === 'contact-dpo' && (
                            <div className="bg-ean-navy text-white p-8 rounded-xs space-y-6 shadow-md border border-white/10">
                              <div className="space-y-2 border-b border-white/10 pb-4">
                                <span className="font-ui text-xs font-bold text-ean-gold uppercase tracking-widest">
                                  Official Contact Desk
                                </span>
                                <h3 className="font-display text-2xl font-light text-white">
                                  Data Protection Officer (DPO)
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-ui text-xs sm:text-sm">
                                <div className="space-y-1">
                                  <span className="text-ean-muted-light text-[10px] uppercase font-bold tracking-wider block">Address</span>
                                  <div className="flex gap-2 items-start text-white">
                                    <MapPin className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                                    <span>EAN Jet Center, FAAN Transit Camp Road, MMIA, Ikeja, Lagos State, Nigeria.</span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-ean-muted-light text-[10px] uppercase font-bold tracking-wider block">Official Email</span>
                                  <div className="flex gap-2 items-center text-white">
                                    <Mail className="w-4 h-4 text-ean-gold shrink-0" />
                                    <a href="mailto:info@ean.aero" className="hover:text-ean-gold transition-colors font-semibold">
                                      info@ean.aero
                                    </a>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-ean-muted-light text-[10px] uppercase font-bold tracking-wider block">Telephone</span>
                                  <div className="flex gap-2 items-center text-white">
                                    <Phone className="w-4 h-4 text-ean-gold shrink-0" />
                                    <a href="tel:+23412950960" className="hover:text-ean-gold transition-colors font-semibold">
                                      +234 (0) 1295 0960
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        </article>
                      </SectionReveal>
                    );
                  })
                )}

              </div>
            </div>
          </div>
        </section>

        {/* DSAR MODAL / DRAWER */}
        <AnimatePresence>
          {isDSAROpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-ean-navy border border-white/10 text-white w-full max-w-xl p-8 rounded-xs shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <button
                  onClick={() => setIsDSAROpen(false)}
                  className="absolute right-6 top-6 text-ean-muted-light hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="space-y-2 border-b border-white/10 pb-4">
                  <span className="font-ui text-xs uppercase font-bold text-ean-gold tracking-widest block">
                    Data Subject Portal
                  </span>
                  <h3 className="font-display text-2xl font-light text-white">
                    Submit Data Access / Rectification Request
                  </h3>
                  <p className="font-ui text-xs text-ean-muted-light">
                    Exercise your rights under the Nigeria Data Protection Act 2023 (NDPA). Our DPO team will process your request within 30 days.
                  </p>
                </div>

                {dsarSubmitted ? (
                  <div className="bg-ean-gold/10 border border-ean-gold/30 p-8 rounded-xs text-center space-y-4 py-12">
                    <CheckCircle2 className="w-12 h-12 text-ean-gold mx-auto" />
                    <h4 className="font-display text-xl font-light text-white">Request Received</h4>
                    <p className="font-ui text-xs text-ean-muted-light max-w-sm mx-auto">
                      Your Data Subject Access Request (DSAR) has been logged. A reference token has been routed to our Data Protection Officer.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleDSARSubmit} className="space-y-4 font-ui text-xs">
                    <div className="space-y-1.5">
                      <label className="uppercase tracking-wider font-semibold text-ean-muted-light">
                        Full Legal Name <span className="text-ean-gold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Chief Segun Demuren"
                        value={dsarForm.fullName}
                        onChange={(e) => setDsarForm({ ...dsarForm, fullName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm rounded-xs text-white placeholder:text-white/20 focus:outline-none focus:border-ean-gold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="uppercase tracking-wider font-semibold text-ean-muted-light">
                          Registered Email <span className="text-ean-gold">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="client@company.com"
                          value={dsarForm.email}
                          onChange={(e) => setDsarForm({ ...dsarForm, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm rounded-xs text-white placeholder:text-white/20 focus:outline-none focus:border-ean-gold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="uppercase tracking-wider font-semibold text-ean-muted-light">
                          Phone Number <span className="text-ean-gold">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+234 (0) 800..."
                          value={dsarForm.phone}
                          onChange={(e) => setDsarForm({ ...dsarForm, phone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm rounded-xs text-white placeholder:text-white/20 focus:outline-none focus:border-ean-gold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="uppercase tracking-wider font-semibold text-ean-muted-light">
                        Right Being Exercised <span className="text-ean-gold">*</span>
                      </label>
                      <select
                        value={dsarForm.requestType}
                        onChange={(e) => setDsarForm({ ...dsarForm, requestType: e.target.value })}
                        className="w-full bg-ean-navy border border-white/10 px-4 py-3 text-sm rounded-xs text-white focus:outline-none focus:border-ean-gold cursor-pointer"
                      >
                        <option value="access">Access / Copy of Personal Data</option>
                        <option value="rectification">Correction / Rectification of Inaccurate Data</option>
                        <option value="erasure">Erasure (&quot;Right to be Forgotten&quot;)</option>
                        <option value="consent_withdrawal">Withdrawal of Processing Consent</option>
                        <option value="objection">Objection to Processing / Profiling</option>
                        <option value="portability">Data Portability Request</option>
                        <option value="general">General Privacy Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="uppercase tracking-wider font-semibold text-ean-muted-light">
                        Request Details & Context
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Please detail your flight booking reference, manifest records, or specific fields you wish to inspect/update..."
                        value={dsarForm.details}
                        onChange={(e) => setDsarForm({ ...dsarForm, details: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm rounded-xs text-white placeholder:text-white/20 focus:outline-none focus:border-ean-gold resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <GoldButton type="submit" className="w-full py-3.5 flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        <span>Transmit Formal DSAR Notice</span>
                      </GoldButton>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
