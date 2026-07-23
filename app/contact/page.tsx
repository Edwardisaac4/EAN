'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ChevronDown, 
  HelpCircle,
  Send,
  CheckCircle
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import SectionReveal from '@/components/shared/SectionReveal';
import GoldButton from '@/components/shared/GoldButton';

// Static Data Structures
import { FAQ_ITEMS, LAGOS_HQ } from '@/lib/constants';

// Helper to map service slug to form select option value
const getServiceFromSlug = (slug: string): string => {
  const val = slug.toLowerCase();
  const mapping: Record<string, string> = {
    'fbo-ground-support': 'fbo',
    'fbo': 'fbo',
    'aircraft-maintenance': 'maintenance',
    'maintenance': 'maintenance',
    'aircraft-sales-charter': 'charter',
    'charter': 'charter',
    'wings-catering': 'catering',
    'catering': 'catering',
    'vip-lounge': 'lounge',
    'lounge': 'lounge',
    'leased-offices': 'offices',
    'offices': 'offices',
  };
  return mapping[val] || 'general';
};

export default function ContactPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'charter',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-select service from URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const serviceParam = params.get('service');
      if (serviceParam) {
        const mappedService = getServiceFromSlug(serviceParam);
        // Defer state update to avoid synchronous cascading renders during mount
        setTimeout(() => {
          setFormData((prev) => ({ ...prev, service: mappedService }));
        }, 0);
      }
    }
  }, []);

  // FAQ Accordion State
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  useGSAP(
    () => {
      // Elegant Header fade-in
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        heroTitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
      );

      tl.fromTo(
        heroSubtitleRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      );
    },
    { scope: heroRef }
  );

  // Form Input Change Handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error once modified
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Form Submission Validation
  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.name.trim()) tempErrors.name = 'Full name is required.';
    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Invalid email address format.';
    }
    if (!formData.phone.trim()) tempErrors.phone = 'Phone number is required.';
    if (!formData.message.trim()) tempErrors.message = 'Message content cannot be blank.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Form Submission Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Mock network request delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: 'charter',
        message: '',
      });
    }, 1800);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col bg-ean-navy text-white">
        {/* SECTION 1: Contact Hero */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-20 bg-linear-to-b from-ean-navy to-ean-navy-mid border-b border-ean-border-dark overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-ean-gold/5 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-center space-y-4">
            <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase block">
              Concierge Desk
            </span>
            <h1
              ref={heroTitleRef}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-light text-white leading-tight opacity-0"
            >
              Connect with EAN
            </h1>
            <p
              ref={heroSubtitleRef}
              className="font-ui text-base sm:text-lg text-ean-muted-light max-w-xl mx-auto leading-relaxed opacity-0"
            >
              Whether arranging international flight support, booking private charters, or visiting our MMIA hangar, our crew is at your service.
            </p>
          </div>
        </section>

        {/* SECTION 2: 2-Column Main Contact Block */}
        <section className="bg-ean-white text-ean-text-dark py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left Column: Office & Hangar Info */}
              <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-32">
                <SectionReveal className="space-y-4">
                  <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase block">
                    Our Location
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-medium text-ean-navy leading-tight">
                    Murtala Muhammed International Airport
                  </h2>
                  <p className="font-ui text-base text-ean-muted-dark leading-relaxed">
                    EAN Aviation operates private FBO facilities right at the MMIA terminal in Lagos, giving you secure, direct airport apron access.
                  </p>
                </SectionReveal>

                {/* HQ Detail Card */}
                <SectionReveal>
                  <div className="bg-ean-surface border border-ean-border-light/60 p-8 rounded-xs space-y-6 shadow-xs">
                    <h3 className="font-ui text-lg font-bold text-ean-navy border-b border-ean-border-light/60 pb-3">
                      {LAGOS_HQ.title}
                    </h3>
                    
                    <div className="space-y-4 font-ui text-sm sm:text-base text-ean-muted-dark">
                      <div className="flex gap-4 items-start">
                        <MapPin className="w-5 h-5 text-ean-gold shrink-0 mt-0.5" />
                        <span>{LAGOS_HQ.address}</span>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <Phone className="w-5 h-5 text-ean-gold shrink-0 mt-0.5" />
                        <span>{LAGOS_HQ.phone}</span>
                      </div>

                      <div className="flex gap-4 items-start">
                        <Mail className="w-5 h-5 text-ean-gold shrink-0 mt-0.5" />
                        <a href={`mailto:${LAGOS_HQ.email}`} className="hover:text-ean-gold transition-colors">
                          {LAGOS_HQ.email}
                        </a>
                      </div>

                      <div className="flex gap-4 items-start border-t border-ean-border-light/40 pt-4 mt-4">
                        <Clock className="w-5 h-5 text-ean-gold shrink-0 mt-0.5" />
                        <span className="font-semibold text-ean-navy">{LAGOS_HQ.hours}</span>
                      </div>
                    </div>
                  </div>
                </SectionReveal>
              </div>

              {/* Right Column: Inquiry Form */}
              <div className="lg:col-span-7">
                <SectionReveal>
                  <div className="bg-ean-navy text-white p-8 sm:p-10 rounded-xs shadow-lg border border-white/5 relative overflow-hidden">
                    {/* Visual Gold glow light source on top corner */}
                    <div className="absolute -top-36 -right-36 w-72 h-72 rounded-full bg-ean-gold/5 blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-display text-2xl sm:text-3xl font-light text-white">
                          Inquiry Concierge
                        </h3>
                        <p className="font-ui text-xs sm:text-sm text-ean-muted-light">
                          Please fill out the form below. A client relations manager will contact you shortly.
                        </p>
                      </div>

                      <AnimatePresence mode="wait">
                        {!submitSuccess ? (
                          <motion.form
                            key="contact-form"
                            ref={formRef}
                            onSubmit={handleSubmit}
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-5 font-ui"
                            noValidate
                          >
                            {/* Row 1: Name */}
                            <div className="flex flex-col gap-1.5">
                              <label htmlFor="name" className="text-xs uppercase tracking-wider text-ean-muted-light font-medium">
                                Full Name <span className="text-ean-gold">*</span>
                              </label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Segun Demuren"
                                className={`bg-white/5 border px-4 py-3 text-sm rounded-xs placeholder:text-white/20 focus:outline-none focus:border-ean-gold focus:ring-1 focus:ring-ean-gold/30 transition-colors duration-300 ${
                                  errors.name ? 'border-red-500' : 'border-white/10'
                                }`}
                              />
                              {errors.name && (
                                <span className="text-xs text-red-400 mt-1">{errors.name}</span>
                              )}
                            </div>

                            {/* Row 2: Email & Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="flex flex-col gap-1.5">
                                <label htmlFor="email" className="text-xs uppercase tracking-wider text-ean-muted-light font-medium">
                                  Email Address <span className="text-ean-gold">*</span>
                                </label>
                                <input
                                  type="email"
                                  id="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  placeholder="client@company.com"
                                  className={`bg-white/5 border px-4 py-3 text-sm rounded-xs placeholder:text-white/20 focus:outline-none focus:border-ean-gold focus:ring-1 focus:ring-ean-gold/30 transition-colors duration-300 ${
                                    errors.email ? 'border-red-500' : 'border-white/10'
                                  }`}
                                />
                                {errors.email && (
                                  <span className="text-xs text-red-400 mt-1">{errors.email}</span>
                                )}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label htmlFor="phone" className="text-xs uppercase tracking-wider text-ean-muted-light font-medium">
                                  Phone Number <span className="text-ean-gold">*</span>
                                </label>
                                <input
                                  type="tel"
                                  id="phone"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  placeholder="+234 (0) 800..."
                                  className={`bg-white/5 border px-4 py-3 text-sm rounded-xs placeholder:text-white/20 focus:outline-none focus:border-ean-gold focus:ring-1 focus:ring-ean-gold/30 transition-colors duration-300 ${
                                    errors.phone ? 'border-red-500' : 'border-white/10'
                                  }`}
                                />
                                {errors.phone && (
                                  <span className="text-xs text-red-400 mt-1">{errors.phone}</span>
                                )}
                              </div>
                            </div>

                            {/* Row 3: Company & Service */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="flex flex-col gap-1.5">
                                <label htmlFor="company" className="text-xs uppercase tracking-wider text-ean-muted-light font-medium">
                                  Company Name
                                </label>
                                <input
                                  type="text"
                                  id="company"
                                  name="company"
                                  value={formData.company}
                                  onChange={handleChange}
                                  placeholder="Corporate Aviation Ltd"
                                  className="bg-white/5 border border-white/10 px-4 py-3 text-sm rounded-xs placeholder:text-white/20 focus:outline-none focus:border-ean-gold focus:ring-1 focus:ring-ean-gold/30 transition-colors duration-300"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label htmlFor="service" className="text-xs uppercase tracking-wider text-ean-muted-light font-medium">
                                  Service Required
                                </label>
                                <div className="relative">
                                  <select
                                    id="service"
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm rounded-xs focus:outline-none focus:border-ean-gold focus:ring-1 focus:ring-ean-gold/30 transition-colors duration-300 appearance-none cursor-pointer text-white"
                                  >
                                    <option value="charter" className="bg-ean-navy text-white">Private Jet & Helicopter Charter</option>
                                    <option value="fbo" className="bg-ean-navy text-white">FBO & Ground Support</option>
                                    <option value="maintenance" className="bg-ean-navy text-white">Aircraft Maintenance (AMO)</option>
                                    <option value="catering" className="bg-ean-navy text-white">Wings™ Catering</option>
                                    <option value="lounge" className="bg-ean-navy text-white">VIP Lounge Experience</option>
                                    <option value="offices" className="bg-ean-navy text-white">Hangar & Office Leases</option>
                                    <option value="general" className="bg-ean-navy text-white">General Business Inquiry</option>
                                  </select>
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ean-gold">
                                    <ChevronDown className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Row 4: Message */}
                            <div className="flex flex-col gap-1.5">
                              <label htmlFor="message" className="text-xs uppercase tracking-wider text-ean-muted-light font-medium">
                                Your Message <span className="text-ean-gold">*</span>
                              </label>
                              <textarea
                                id="message"
                                name="message"
                                rows={4}
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Describe your flight routing, date, passenger size, or hangar support requirements..."
                                className={`bg-white/5 border px-4 py-3 text-sm rounded-xs placeholder:text-white/20 focus:outline-none focus:border-ean-gold focus:ring-1 focus:ring-ean-gold/30 transition-colors duration-300 resize-none ${
                                  errors.message ? 'border-red-500' : 'border-white/10'
                                }`}
                              />
                              {errors.message && (
                                <span className="text-xs text-red-400 mt-1">{errors.message}</span>
                              )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                              <GoldButton
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 py-4"
                              >
                                {isSubmitting ? (
                                  <>
                                    <span className="w-4 h-4 border-2 border-ean-navy border-t-transparent rounded-full animate-spin" />
                                    <span>Processing Inquiry...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4" />
                                    <span>Send Message</span>
                                  </>
                                )}
                              </GoldButton>
                            </div>
                          </motion.form>
                        ) : (
                          <motion.div
                            key="success-message"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="bg-ean-gold/10 border border-ean-gold/20 p-8 rounded-xs text-center flex flex-col items-center gap-4 py-16"
                          >
                            <div className="w-16 h-16 rounded-full bg-ean-gold/20 flex items-center justify-center text-ean-gold mb-2 border border-ean-gold/30">
                              <CheckCircle className="w-8 h-8" />
                            </div>
                            <h4 className="font-display text-2xl font-light text-white">
                              Thank You
                            </h4>
                            <p className="font-ui text-sm text-ean-muted-light leading-relaxed max-w-sm">
                              Your inquiry has been successfully sent. A flight operations coordinator or corporate concierge will review your parameters and follow up within 2 hours.
                            </p>
                            <button
                              onClick={() => setSubmitSuccess(false)}
                              className="mt-4 font-ui text-xs font-semibold uppercase tracking-wider text-ean-gold hover:text-ean-gold-light underline focus:outline-none cursor-pointer"
                            >
                              Send Another Inquiry
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </SectionReveal>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: FAQ Accordion */}
        <section className="bg-ean-surface text-ean-text-dark py-20 sm:py-24 border-t border-ean-border-light/60">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <SectionReveal className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase block">
                Information
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-medium text-ean-navy leading-tight">
                Frequently Asked Questions
              </h2>
              <p className="font-ui text-base text-ean-muted-dark leading-relaxed">
                Review immediate solutions to common questions regarding EAN’s flight approvals, MMIA ground support, and scheduling.
              </p>
            </SectionReveal>

            {/* Accordion List */}
            <div className="max-w-3xl mx-auto space-y-4 font-ui">
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = openFAQIndex === idx;
                return (
                  <SectionReveal key={idx}>
                    <div className="bg-ean-white border border-ean-border-light/60 rounded-xs overflow-hidden shadow-xs hover:border-ean-gold/30 transition-all duration-300">
                      <button
                        onClick={() => toggleFAQ(idx)}
                        className="w-full px-6 py-5 sm:px-8 flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                      >
                        <div className="flex gap-4 items-center">
                          <HelpCircle className="w-5 h-5 text-ean-gold shrink-0" />
                          <span className="font-semibold text-ean-navy text-sm sm:text-base group-hover:text-ean-gold transition-colors duration-200">
                            {faq.question}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-ean-gold shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <div className="px-6 pb-6 pt-0 sm:px-8 sm:pb-6 text-sm sm:text-base text-ean-muted-dark border-t border-ean-border-light/25 leading-relaxed pl-14">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </SectionReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 4: Stylized MMIA Airport Location Spotlight */}
        <section className="relative w-full h-87.5 sm:h-112.5 bg-ean-navy flex items-center justify-center overflow-hidden border-t border-ean-border-dark">
          <Image
            src="/images/contact-cta.png"
            alt="EAN Aviation corporate helicopter on runway apron at sunset"
            fill
            sizes="100vw"
            className="object-cover"
            quality={90}
          />
          {/* Visual Dark Overlay to match page transition */}
          <div className="absolute inset-0 bg-linear-to-t from-ean-navy via-ean-navy/40 to-transparent" />
          
          {/* Subtle location card */}
          <div className="relative z-10 max-w-md bg-ean-navy/90 backdrop-blur-md border border-white/10 p-8 rounded-xs text-center space-y-4 shadow-2xl mx-4 sm:mx-auto">
            <span className="font-ui text-[10px] uppercase tracking-widest text-ean-gold font-bold">
              Coordinates & Access
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-light text-white leading-tight">
              Direct Airside Support
            </h3>
            <p className="font-ui text-xs sm:text-sm text-ean-muted-light leading-relaxed">
              Our FBO terminal is situated airside at Murtala Muhammed Airport, Lagos. Ground transfers and executive escorts are coordinated by EAN security personnel.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
