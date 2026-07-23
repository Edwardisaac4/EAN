'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  ShieldCheck,
  FileText,
  RefreshCw,
  Globe2,
  Smartphone,
  Award,
  ShieldAlert,
  UserCheck,
  Globe,
  Clock,
  UserX,
  AlertCircle,
  Building2,
  FileCheck,
  Mail,
  Search,
  ChevronRight,
  Printer,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  MapPin,
  Phone,
  FileCode,
  HelpCircle
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import SectionReveal from '@/components/shared/SectionReveal';
import { TERMS_OF_USE_SECTIONS, LegalSection } from '@/lib/constants';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale,
  ShieldCheck,
  FileText,
  RefreshCw,
  Globe2,
  Smartphone,
  Award,
  ShieldAlert,
  UserCheck,
  Globe,
  Clock,
  UserX,
  AlertCircle,
  Building2,
  FileCheck,
  Mail
};

export default function TermsOfUsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('acceptance');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    topic: 'violation',
    details: ''
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const sidebarNavRef = useRef<HTMLDivElement>(null);
  const isManualScrollRef = useRef(false);

  // Filtered Sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return TERMS_OF_USE_SECTIONS;
    const q = searchQuery.toLowerCase();
    return TERMS_OF_USE_SECTIONS.filter(
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

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setIsReportOpen(false);
      setReportForm({
        fullName: '',
        email: '',
        phone: '',
        topic: 'violation',
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

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col bg-ean-navy text-white min-h-screen">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 bg-linear-to-b from-ean-navy via-ean-navy-mid to-ean-navy border-b border-ean-border-dark overflow-hidden print:hidden">
          {/* Ambient Gold Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 h-160 rounded-full bg-ean-gold/5 blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 border border-ean-gold/30 bg-ean-gold/10 text-ean-gold text-xs font-semibold uppercase tracking-[0.25em] px-4 py-1.5 rounded-xs">
              <Scale className="w-4 h-4 text-ean-gold" />
              <span>ARBITRATION & MEDIATION ACT 2022 • LEGAL GOVERNANCE</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
              Terms of Use
            </h1>

            <p className="font-ui text-base sm:text-lg text-ean-muted-light max-w-3xl mx-auto leading-relaxed">
              This Website Terms of Use Agreement governs your access to and use of the website located at <strong className="text-white">ean.aero</strong> owned and operated by EAN Aviation Limited (“EAN Group”, “we”, “us”, “our”).
            </p>

            {/* Quick Metadata Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-ui text-ean-muted-light">
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xs">
                <Clock className="w-3.5 h-3.5 text-ean-gold" />
                Last Updated: <strong className="text-white">16 October 2025</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xs">
                <Globe className="w-3.5 h-3.5 text-ean-gold" />
                Jurisdiction: <strong className="text-white">Federal Republic of Nigeria</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xs">
                <Building2 className="w-3.5 h-3.5 text-ean-gold" />
                Entity: <strong className="text-white">EAN Aviation Limited</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setIsReportOpen(true)}
                className="inline-flex items-center gap-2 bg-ean-gold hover:bg-ean-gold-light text-ean-navy border border-ean-gold text-xs uppercase tracking-wider font-bold px-6 py-3.5 rounded-xs transition-colors shadow-xs cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-ean-navy" />
                <span>Submit Legal Inquiry / Report</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 text-xs uppercase tracking-wider font-semibold px-6 py-3.5 rounded-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-ean-gold" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </section>

        {/* MAIN BODY CONTENT */}
        <section className="bg-ean-white text-ean-text-dark py-16 sm:py-20 flex-1">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* LEFT SIDEBAR: Table of Contents */}
              <aside className="hidden lg:block lg:col-span-4 sticky top-40 space-y-6 print:hidden">
                <div className="bg-ean-surface border border-ean-border-light/60 p-6 rounded-xs space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-ean-border-light pb-3">
                    <FileCode className="w-4 h-4 text-ean-gold" />
                    <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-ean-navy">
                      Terms Clause Index
                    </h3>
                  </div>

                  {/* Clause Filter Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-ean-gold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filter clauses (e.g. arbitration, IP)..."
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

                {/* Quick Assistance Box */}
                <div className="p-5 bg-ean-navy text-white rounded-xs space-y-3 border border-white/10 shadow-xs">
                  <div className="flex items-center gap-2 text-ean-gold text-xs font-bold uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    <span>Legal Support Desk</span>
                  </div>
                  <p className="font-ui text-xs text-ean-muted-light leading-relaxed">
                    Have questions regarding corporate licensing, FBO agreements, or copyright permissions?
                  </p>
                  <a
                    href="mailto:info@ean.aero?subject=Legal%20Terms%20Inquiry"
                    className="inline-flex items-center gap-1.5 text-xs text-ean-gold hover:underline font-semibold"
                  >
                    <span>Email info@ean.aero</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </aside>

              {/* RIGHT CONTENT AREA */}
              <div className="lg:col-span-8 space-y-12">
                
                {/* PREAMBLE CARD */}
                <SectionReveal>
                  <div className="bg-ean-navy text-white p-8 rounded-xs space-y-4 shadow-lg border-l-4 border-ean-gold">
                    <span className="font-ui text-xs uppercase tracking-[0.2em] text-ean-gold font-semibold block">
                      Legal Binding & Capacity
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-light text-white">
                      Notice of Agreement & Requirement of Capacity
                    </h2>
                    <p className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                      By accessing, browsing or using the Site or any pages of the Site, you indicate that you have read, acknowledge and agree to be bound by this Website Terms of Use Agreement and the EAN Group Privacy Policy located at{' '}
                      <Link href="/privacy-policy" className="text-ean-gold underline underline-offset-4 hover:text-white transition-colors">
                        https://ean.aero/privacy-policy/
                      </Link>.
                    </p>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xs space-y-2 font-ui text-xs text-ean-muted-light">
                      <div className="flex items-center gap-2 text-ean-gold font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Representation of Age & Authority</span>
                      </div>
                      <p>
                        You represent and warrant that you are <strong>18 years of age or older</strong> and that, if accepting on behalf of any business (such as a corporation, partnership, or limited liability entity), you have legal authority to bind that entity.
                      </p>
                    </div>
                  </div>
                </SectionReveal>

                {/* TERMS SECTIONS ITERATION */}
                {filteredSections.length === 0 ? (
                  <div className="text-center py-16 bg-ean-surface border border-ean-border-light rounded-xs space-y-3">
                    <AlertCircle className="w-8 h-8 text-ean-gold mx-auto" />
                    <h3 className="font-display text-xl font-medium text-ean-navy">No matching terms clauses found</h3>
                    <p className="font-ui text-sm text-ean-muted-dark">Try searching with a different term like &quot;arbitration&quot;, &quot;indemnity&quot;, &quot;trademarks&quot;, or &quot;limitation&quot;.</p>
                  </div>
                ) : (
                  filteredSections.map((section) => {
                    const IconComponent = ICON_MAP[section.iconName] || FileText;
                    return (
                      <SectionReveal key={section.id}>
                        <article
                          id={section.id}
                          className="bg-ean-surface border border-ean-border-light/60 p-8 sm:p-10 rounded-xs space-y-6 shadow-xs hover:border-ean-gold/30 transition-all duration-300 scroll-mt-36 print:border-none print:shadow-none print:p-0"
                        >
                          {/* Section Header */}
                          <div className="flex items-start justify-between gap-4 border-b border-ean-border-light/60 pb-5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs font-bold text-ean-gold bg-ean-gold/10 px-2.5 py-1 rounded-xs border border-ean-gold/20">
                                  CLAUSE {section.num}
                                </span>
                                <span className="font-ui text-xs font-semibold tracking-widest text-ean-muted-dark uppercase">
                                  Legal Governance
                                </span>
                              </div>
                              <h2 className="font-display text-2xl sm:text-3xl font-medium text-ean-navy pt-1">
                                {section.title}
                              </h2>
                            </div>
                            <div className="w-10 h-10 rounded-xs bg-ean-navy/5 flex items-center justify-center text-ean-gold shrink-0 border border-ean-gold/20 print:hidden">
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
                                <p className="pl-6 text-ean-muted-dark select-text">{block.text}</p>
                              </div>
                            ))}
                          </div>

                          {/* SECTION-SPECIFIC VISUAL ENHANCEMENTS */}

                          {/* Section 08: Prohibited Activities Matrix */}
                          {section.id === 'your-use' && (
                            <div className="bg-ean-navy text-white p-6 rounded-xs space-y-4 font-ui text-xs sm:text-sm">
                              <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-ean-gold font-bold uppercase tracking-wider">
                                <AlertTriangle className="w-4 h-4 text-ean-gold" />
                                <span>Strictly Prohibited User Activities</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-ean-muted-light">
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xs">
                                  ❌ <strong>Unlawful Content:</strong> Defamatory, obscene, harassing, or privacy-invasive materials.
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xs">
                                  ❌ <strong>Malware & Viruses:</strong> Code designed to damage hardware, software, or network data.
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xs">
                                  ❌ <strong>Web Scraping:</strong> Robots, spiders, or automated monitoring devices without prior written consent.
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xs">
                                  ❌ <strong>Framing & Deep Links:</strong> Framing the site or unauthorized hypertext linking.
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xs sm:col-span-2">
                                  ❌ <strong>Commercial Exploitation & Impersonation:</strong> Selling, sub-licensing, or misrepresenting affiliation with EAN Group.
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Section 13: Liability Cap Box */}
                          {section.id === 'disclaimers-liability' && (
                            <div className="bg-ean-gold/10 border border-ean-gold/30 p-5 rounded-xs space-y-2 font-ui text-xs sm:text-sm text-ean-navy">
                              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-ean-navy">
                                <AlertCircle className="w-4 h-4 text-ean-gold" />
                                <span>Maximum Liability Cap & Sole Remedy</span>
                              </div>
                              <p className="text-ean-muted-dark">
                                Your sole and exclusive remedy for dissatisfaction with the site is to stop using the site. The maximum aggregate liability of EAN Group for all causes of action is strictly limited to the total amount paid by you, if any, to EAN Group to access and use the site.
                              </p>
                            </div>
                          )}

                          {/* Section 14: Dispute Resolution Workflow Diagram */}
                          {section.id === 'governing-law' && (
                            <div className="bg-ean-navy text-white p-6 rounded-xs space-y-5">
                              <h4 className="font-display text-lg font-light text-white border-b border-white/10 pb-3">
                                Dispute Resolution Workflow (Arbitration & Mediation Act 2022)
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-ui text-xs">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xs space-y-2">
                                  <span className="font-mono text-[10px] text-ean-gold font-bold block">STEP 01</span>
                                  <h5 className="font-bold text-white uppercase">30-Day Amicable Notice</h5>
                                  <p className="text-ean-muted-light text-[11px]">
                                    User submits formal written complaint to EAN Group allowing 30 days for amicable settlement.
                                  </p>
                                </div>

                                <div className="p-4 bg-white/5 border border-white/10 rounded-xs space-y-2">
                                  <span className="font-mono text-[10px] text-ean-gold font-bold block">STEP 02</span>
                                  <h5 className="font-bold text-white uppercase">Binding Arbitration</h5>
                                  <p className="text-ean-muted-light text-[11px]">
                                    If unresolved after 30 days, referred to binding arbitration under the Arbitration & Mediation Act 2022.
                                  </p>
                                </div>

                                <div className="p-4 bg-white/5 border border-white/10 rounded-xs space-y-2">
                                  <span className="font-mono text-[10px] text-ean-gold font-bold block">STEP 03</span>
                                  <h5 className="font-bold text-white uppercase">Exclusive Courts Forum</h5>
                                  <p className="text-ean-muted-light text-[11px]">
                                    Urgent or injunctive court relief preserved; exclusive jurisdiction in courts of Nigeria.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Section 16: Notice & Official Contact Card */}
                          {section.id === 'notice' && (
                            <div className="bg-ean-navy text-white p-8 rounded-xs space-y-6 shadow-md border border-white/10">
                              <div className="space-y-2 border-b border-white/10 pb-4">
                                <span className="font-ui text-xs font-bold text-ean-gold uppercase tracking-widest">
                                  Official Legal Notices Desk
                                </span>
                                <h3 className="font-display text-2xl font-light text-white">
                                  EAN Aviation Limited
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-ui text-xs sm:text-sm">
                                <div className="space-y-1">
                                  <span className="text-ean-muted-light text-[10px] uppercase font-bold tracking-wider block">Physical Address</span>
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

        {/* LEGAL INQUIRY / REPORT MODAL */}
        <AnimatePresence>
          {isReportOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-ean-navy border border-white/10 text-white w-full max-w-xl p-8 rounded-xs shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="absolute right-6 top-6 text-ean-muted-light hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="space-y-2 border-b border-white/10 pb-4">
                  <span className="font-ui text-xs uppercase font-bold text-ean-gold tracking-widest block">
                    EAN Legal Desk
                  </span>
                  <h3 className="font-display text-2xl font-light text-white">
                    Submit Terms Inquiry or Report Violation
                  </h3>
                  <p className="font-ui text-xs text-ean-muted-light">
                    Use this form to submit copyright inquiries, reporting terms violations, or request licensing permissions from EAN Group legal representatives.
                  </p>
                </div>

                {reportSubmitted ? (
                  <div className="bg-ean-gold/10 border border-ean-gold/30 p-8 rounded-xs text-center space-y-4 py-12">
                    <CheckCircle2 className="w-12 h-12 text-ean-gold mx-auto" />
                    <h4 className="font-display text-xl font-light text-white">Submission Received</h4>
                    <p className="font-ui text-xs text-ean-muted-light max-w-md mx-auto">
                      Thank you for contacting EAN Aviation Limited legal team. We have received your message and will review it promptly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReportSubmit} className="space-y-4 font-ui text-xs">
                    <div className="space-y-1.5">
                      <label className="text-ean-muted-light uppercase tracking-wider font-semibold">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Adebayo Johnson"
                        value={reportForm.fullName}
                        onChange={(e) => setReportForm({ ...reportForm, fullName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xs px-3.5 py-2.5 text-white placeholder:text-ean-muted-light/40 focus:outline-none focus:border-ean-gold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-ean-muted-light uppercase tracking-wider font-semibold">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="adebayo@company.com"
                          value={reportForm.email}
                          onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xs px-3.5 py-2.5 text-white placeholder:text-ean-muted-light/40 focus:outline-none focus:border-ean-gold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-ean-muted-light uppercase tracking-wider font-semibold">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+234 800 000 0000"
                          value={reportForm.phone}
                          onChange={(e) => setReportForm({ ...reportForm, phone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xs px-3.5 py-2.5 text-white placeholder:text-ean-muted-light/40 focus:outline-none focus:border-ean-gold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-ean-muted-light uppercase tracking-wider font-semibold">Inquiry Type *</label>
                      <select
                        value={reportForm.topic}
                        onChange={(e) => setReportForm({ ...reportForm, topic: e.target.value })}
                        className="w-full bg-ean-navy-mid border border-white/10 rounded-xs px-3.5 py-2.5 text-white focus:outline-none focus:border-ean-gold"
                      >
                        <option value="violation">Report Terms / IP Violation</option>
                        <option value="licensing">Site Content & Trademark Licensing</option>
                        <option value="dispute">30-Day Amicable Notice of Dispute</option>
                        <option value="other">General Legal Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-ean-muted-light uppercase tracking-wider font-semibold">Details & Statement *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Provide details regarding your inquiry, specific clause reference, or nature of the notice..."
                        value={reportForm.details}
                        onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xs px-3.5 py-2.5 text-white placeholder:text-ean-muted-light/40 focus:outline-none focus:border-ean-gold"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsReportOpen(false)}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-ean-gold hover:bg-ean-gold-light text-ean-navy font-bold rounded-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4 text-ean-navy" />
                        <span>Submit to Legal Desk</span>
                      </button>
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
