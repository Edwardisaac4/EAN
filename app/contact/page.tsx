'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sendGAEvent } from '@next/third-parties/google';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  HelpCircle,
  Send,
  CheckCircle,
  Navigation
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import SectionReveal from '@/components/shared/SectionReveal';
import GoldButton from '@/components/shared/GoldButton';
import HoneypotField from '@/components/shared/HoneypotField';
import LocationMap from '@/components/shared/LocationMap';
import { withReducedMotion } from '@/lib/gsap-motion';

// Register GSAP plugins at the file level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Static Data Structures
import { FAQ_ITEMS, LAGOS_HQ } from '@/lib/constants';
import { getTrackingContext } from '@/lib/lead-tracking';
import { mapDirectionsUrl } from '@/lib/maps';

// Helper to map service slug to form select option value
const getServiceFromSlug = (slug: string): string => {
  const val = slug.toLowerCase();
  const mapping: Record<string, string> = {
    'aircraft-sales-leasing': 'sales_leasing',
    'aircraft-sales': 'sales_leasing',
    'sales-leasing': 'sales_leasing',
    'sales': 'sales_leasing',
    'aircraft-charter': 'charter',
    'charter': 'charter',
    'aircraft-sales-charter': 'sales_leasing',
    'fbo-ground-support': 'fbo',
    'fbo': 'fbo',
    'aircraft-maintenance': 'maintenance',
    'maintenance': 'maintenance',
    'wings-catering': 'catering',
    'catering': 'catering',
    'vip-lounge': 'vip',
    'lounge': 'vip',
    'vip': 'vip',
    'leased-offices': 'leasing',
    'offices': 'leasing',
    'leasing': 'leasing',
    'hangarage': 'leasing',
    'flight-support': 'flight_support',
    'global-flight-support': 'flight_support',
    'flight_support': 'flight_support',
    'aeroplex': 'aeroplex',
    'investor': 'aeroplex',
    'press': 'press',
    'media': 'press',
    'press-media': 'press',
  };
  return mapping[val] || 'general';
};

const AVAILABLE_SERVICES = [
  { id: 'sales_leasing', label: 'Aircraft Sales & Leasing' },
  { id: 'charter', label: 'Aircraft Charter' },
  { id: 'fbo', label: 'FBO & Ground Handling' },
  { id: 'maintenance', label: 'Aircraft Maintenance' },
  { id: 'catering', label: 'Wings Catering' },
  { id: 'vip', label: 'VIP Lounge' },
  { id: 'leasing', label: 'Hangarage & Offices' },
  { id: 'flight_support', label: 'Global Flight Support' },
  { id: 'aeroplex', label: 'Aeroplex / Investor' },
  { id: 'press', label: 'Press & Media' },
  { id: 'general', label: 'General' },
];

export default function ContactPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroEyebrowRef = useRef<HTMLSpanElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  // Spam trap — see components/shared/HoneypotField.tsx. Never rendered visibly,
  // so any value here came from a bot.
  const [honeypot, setHoneypot] = useState('');

  // Starts empty. Anything pre-ticked here is a guess at the visitor's intent
  // that arrives in the lead data as if they had chosen it, and 'charter' was
  // being attributed to every contact-page lead that never touched the boxes.
  // A genuine intent signal comes from `?service=` below, or from the visitor.
  // The field is optional: handleSubmit falls back to 'general'.
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        // No floor at one selection: a visitor who ticked the wrong box must be
        // able to untick it, and zero is a valid answer here.
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Auto-select service from URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const serviceParam = params.get('service');
      if (serviceParam) {
        const mappedService = getServiceFromSlug(serviceParam);
        setTimeout(() => {
          setSelectedServices([mappedService]);
        }, 0);
      }
    }
  }, []);

  // FAQ Accordion State
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          // Elegant Header entrance animation
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          tl.fromTo(
            heroEyebrowRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.2 }
          );

          tl.fromTo(
            heroTitleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8 },
            '-=0.4'
          );

          tl.fromTo(
            heroSubtitleRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.5'
          );

          // Parallax effect on hero background image
          if (heroBgRef.current && heroRef.current) {
            gsap.to(heroBgRef.current, {
              yPercent: 15,
              ease: 'none',
              scrollTrigger: {
                trigger: heroRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            });
          }
        },
        () => {
          gsap.set(
            [heroEyebrowRef.current, heroTitleRef.current, heroSubtitleRef.current],
            { opacity: 1, y: 0, clearProps: 'transform' }
          );
          if (heroBgRef.current) {
            gsap.set(heroBgRef.current, { yPercent: 0, clearProps: 'transform' });
          }
        }
      ),
    { scope: heroRef }
  );

  // Form Input Change Handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  // Form Submission Handler calling POST /api/leads
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validateForm() replaces the whole error map, which also clears any
    // `form`-level failure left over from a previous submission.
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const trackingContext = getTrackingContext('contact-page-form');

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          service: selectedServices[0] || 'general',
          message:
            selectedServices.length > 1
              ? `[Services required: ${selectedServices
                  .map((id) => AVAILABLE_SERVICES.find((s) => s.id === id)?.label || id)
                  .join(', ')}]\n${formData.message}`
              : formData.message,
          tracking: trackingContext,
          website: honeypot,
        }),
      });

      const resData = await response.json().catch(() => null);

      // The lead is only captured if the database accepted it — never report
      // success off the back of a failed request.
      if (!response.ok || !resData?.success) {
        setIsSubmitting(false);
        setErrors({
          form:
            resData?.error ??
            'We could not submit your inquiry. Please try again or call our 24/7 desk.',
        });
        return;
      }

      sendGAEvent('event', 'generate_lead', {
        category: 'Inquiry',
        service: selectedServices.join(', ') || 'general',
        value: 1,
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
      });
      setSelectedServices([]);
    } catch (err) {
      console.error('Error submitting lead form:', err);
      setIsSubmitting(false);
      setErrors({ form: 'Network error submitting form. Please try again or call our 24/7 desk.' });
    }
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <>
      <Navbar hasPhotoHero />

      <main className="flex-1 flex flex-col bg-ean-navy text-ean-text-light">
        {/* SECTION 1: Contact Hero */}
        <section
          ref={heroRef}
          className="relative min-h-105 sm:min-h-120 lg:min-h-130 flex items-center pt-36 pb-20 sm:pt-44 sm:pb-28 overflow-hidden bg-ean-obsidian border-b border-ean-border-dark"
        >
          {/* Parallax Background with Runway Jet */}
          <div ref={heroBgRef} className="absolute inset-0 w-full h-[120%] top-[-10%] pointer-events-none">
            <Image
              src="/images/runway.jpg"
              alt="Private jet on runway approaching city skyline"
              fill
              sizes="100vw"
              priority
              quality={80}
              className="object-cover object-center"
            />
            {/* Cinematic Obsidian Black luxury overlays — evenly balanced across the image */}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-linear-to-b from-black/80 via-transparent to-black/90" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/60" />
          </div>

          <div className="max-w-ean mx-auto px-6 md:px-8 relative z-10 w-full">
            <div className="max-w-3xl space-y-4 sm:space-y-5 text-left">
              <span
                ref={heroEyebrowRef}
                className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/70 uppercase block"
              >
                Contact
              </span>
              <h1
                ref={heroTitleRef}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-[1.1] tracking-tight"
              >
                Every inquiry answered by a person.
              </h1>
              <p
                ref={heroSubtitleRef}
                className="font-ui text-base sm:text-lg md:text-xl text-white/80 max-w-xl leading-relaxed"
              >
                Our operations desk runs 24 hours a day. For anything time-critical, call or email dispatch directly.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: 2-Column Main Contact Block */}
        <section className="bg-ean-white text-ean-text-light py-20 sm:py-24">
          <div className="max-w-ean mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left Column: Office & Hangar Info */}
              <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-32">
                <SectionReveal className="space-y-4">
                  <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase block">
                    Our Location
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-medium text-ean-text-light leading-tight">
                    Murtala Muhammed International Airport
                  </h2>
                  <p className="font-ui text-base text-ean-muted-light leading-relaxed">
                    EAN Aviation operates private FBO facilities right at the MMIA terminal in Lagos, giving you secure, direct airport apron access.
                  </p>
                </SectionReveal>

                {/* HQ Detail Card */}
                <SectionReveal>
                  <div className="bg-ean-surface border border-ean-border-light/60 p-8 space-y-6 shadow-xs">
                    <h3 className="font-ui text-lg font-bold text-ean-text-light border-b border-ean-border-light/60 pb-3">
                      {LAGOS_HQ.title}
                    </h3>

                    <div className="space-y-4 font-ui text-sm sm:text-base text-ean-muted-light">
                      <div className="flex gap-4 items-start">
                        <MapPin className="w-5 h-5 text-ean-gold shrink-0 mt-0.5" />
                        {/*
                          The address and the way to get there, together. The
                          map lower down is the browsable version; this is the
                          one-tap version for someone already in a car.
                        */}
                        <span className="space-y-1.5">
                          <span className="block">{LAGOS_HQ.address}</span>
                          <a
                            href={mapDirectionsUrl(LAGOS_HQ.map)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-semibold text-ean-gold hover:underline"
                          >
                            <Navigation className="w-3.5 h-3.5" aria-hidden />
                            Get directions
                          </a>
                        </span>
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
                        <span className="font-semibold text-ean-text-light">{LAGOS_HQ.hours}</span>
                      </div>
                    </div>
                  </div>
                </SectionReveal>
              </div>

              {/* Right Column: Inquiry Form */}
              <div className="lg:col-span-7">
                <SectionReveal>
                  <div className="bg-ean-navy text-ean-text-light p-8 sm:p-10 shadow-lg border border-ean-border-dark relative overflow-hidden">
                    {/* Visual Gold glow light source on top corner */}
                    <div className="absolute -top-36 -right-36 w-72 h-72 rounded-full bg-ean-gold/5 blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-display text-2xl sm:text-2xl font-light text-ean-text-light">
                          Inquiry Concierge
                        </h3>
                        <p className="font-ui text-xs sm:text-sm text-ean-muted-light">
                          Please fill out the form below. A client relations manager will contact you shortly.
                        </p>
                      </div>

                      {!submitSuccess ? (
                        <form
                          key="contact-form"
                          ref={formRef}
                          onSubmit={handleSubmit}
                          className="relative space-y-5 font-ui"
                          noValidate
                        >
                          <HoneypotField value={honeypot} onChange={setHoneypot} />

                          {/* Submission failure — API rejection or network error */}
                          {errors.form && (
                            <div
                              role="alert"
                              className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 text-xs sm:text-sm"
                            >
                              {errors.form}
                            </div>
                          )}

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
                              placeholder="John Duran"
                              className={`bg-black/5 border px-4 py-3 text-sm placeholder:text-ean-text-light/20 focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors duration-300 ${errors.name ? 'border-red-500' : 'border-ean-border-dark'
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
                                className={`bg-black/5 border px-4 py-3 text-sm placeholder:text-ean-text-light/20 focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors duration-300 ${errors.email ? 'border-red-500' : 'border-ean-border-dark'
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
                                className={`bg-black/5 border px-4 py-3 text-sm placeholder:text-ean-text-light/20 focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors duration-300 ${errors.phone ? 'border-red-500' : 'border-ean-border-dark'
                                  }`}
                              />
                              {errors.phone && (
                                <span className="text-xs text-red-400 mt-1">{errors.phone}</span>
                              )}
                            </div>
                          </div>

                          {/* Row 3: Company & Services Required */}
                          <div className="flex flex-col gap-4">
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
                                className="bg-black/5 border border-ean-border-dark px-4 py-3 text-sm placeholder:text-ean-text-light/20 focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors duration-300"
                              />
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                              <label className="text-xs uppercase tracking-wider text-ean-muted-light font-medium flex items-center justify-between">
                                <span>Services Required (Select all that apply)</span>
                                <span className="text-[10px] text-ean-blue-light font-normal">Tick boxes</span>
                              </label>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                {AVAILABLE_SERVICES.map((srv) => {
                                  const isChecked = selectedServices.includes(srv.id);
                                  return (
                                    <label
                                      key={srv.id}
                                      htmlFor={`srv-${srv.id}`}
                                      // The checkbox itself is sr-only, so keyboard focus has
                                      // nothing visible to land on. `has-focus-visible`
                                      // moves the focus ring onto the label it belongs to.
                                      className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-200 has-focus-visible:ring-2 has-focus-visible:ring-ean-blue has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-ean-navy ${isChecked
                                        ? 'bg-ean-blue-muted/30 border-ean-blue text-ean-text-light shadow-[0_0_12px_rgba(43,0,152,0.2)]'
                                        : 'bg-black/5 border-ean-border-dark text-ean-muted-light hover:border-ean-blue/50 hover:text-ean-text-light'
                                        }`}
                                    >
                                      <input
                                        type="checkbox"
                                        id={`srv-${srv.id}`}
                                        name="selectedServices"
                                        value={srv.id}
                                        checked={isChecked}
                                        onChange={() => handleServiceToggle(srv.id)}
                                        className="sr-only"
                                      />
                                      <div
                                        className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked
                                          ? 'bg-ean-blue border-ean-blue text-ean-text-dark'
                                          : 'border-ean-border-dark bg-black/5'
                                          }`}
                                      >
                                        {isChecked && <CheckCircle className="w-3.5 h-3.5 stroke-3" />}
                                      </div>
                                      <span className="text-xs font-medium">{srv.label}</span>
                                    </label>
                                  );
                                })}
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
                              className={`bg-black/5 border px-4 py-3 text-sm placeholder:text-ean-text-light/20 focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors duration-300 resize-none ${errors.message ? 'border-red-500' : 'border-ean-border-dark'
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
                                  <span className="w-4 h-4 border border-ean-navy border-t-transparent rounded-full animate-spin" />
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
                        </form>
                      ) : (
                        <div
                          key="success-message"
                          className="ean-enter-scale bg-ean-gold/10 border border-ean-gold/20 p-8 text-center flex flex-col items-center gap-4 py-16"
                        >
                          <div className="w-16 h-16 rounded-full bg-ean-gold/20 flex items-center justify-center text-ean-gold mb-2 border border-ean-gold/30">
                            <CheckCircle className="w-8 h-8" />
                          </div>
                          <h4 className="font-display text-2xl font-light text-ean-text-light">
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
                        </div>
                      )}
                    </div>
                  </div>
                </SectionReveal>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: FAQ Accordion */}
        <section className="bg-ean-surface text-ean-text-light py-20 sm:py-24 border-t border-ean-border-light/60">
          <div className="max-w-ean mx-auto px-6 md:px-8">
            <SectionReveal className="text-center max-w-2xl mx-auto mb-16 space-y-4" stagger={0.1} distance={40} duration={1}>
              <span data-reveal className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase block">
                Information
              </span>
              <h2 data-reveal className="font-display text-3xl sm:text-4xl font-medium text-ean-text-light leading-tight">
                Frequently Asked Questions
              </h2>
              <p data-reveal className="font-ui text-base text-ean-muted-light leading-relaxed">
                Review immediate solutions to common questions regarding EAN’s flight approvals, MMIA ground support, and scheduling.
              </p>
            </SectionReveal>

            {/* Accordion list. One trigger on the list rather than one per
                question: twelve accordions each owned a ScrollTrigger on the
                same `top 85%` line, which is twelve triggers producing one
                simultaneous fade. No `grid` here — this is a single column, so
                DOM order is the order the eye reads. */}
            <SectionReveal
              className="max-w-3xl mx-auto space-y-4 font-ui"
              stagger={0.05}
              distance={20}
              duration={0.6}
            >
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = openFAQIndex === idx;
                return (
                  <div key={idx} data-reveal>
                    <div className="bg-ean-white border border-ean-border-light/60 overflow-hidden shadow-xs hover:border-ean-gold/30 transition-all duration-300">
                      <button
                        id={`faq-trigger-${idx}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${idx}`}
                        onClick={() => toggleFAQ(idx)}
                        className="w-full px-6 py-5 sm:px-8 flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                      >
                        <div className="flex gap-4 items-center">
                          <HelpCircle className="w-5 h-5 text-ean-gold shrink-0" />
                          <span className="font-semibold text-ean-text-light text-sm sm:text-base group-hover:text-ean-gold transition-colors duration-200">
                            {faq.question}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-ean-gold shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      {/*
                        Grid-rows trick animates to intrinsic height without JS measurement.
                        `inert` rather than `hidden` keeps the collapsed answer out of the
                        accessibility tree and out of tab order without setting
                        `display: none`, which would collapse the row instantly and destroy
                        the closing transition.
                      */}
                      <div
                        id={`faq-panel-${idx}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${idx}`}
                        inert={!isOpen}
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-6 pb-6 pt-0 sm:px-8 sm:pb-6 text-sm sm:text-base text-ean-muted-light border-t border-ean-border-light/25 leading-relaxed pl-14">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </SectionReveal>
          </div>
        </section>

        {/*
          SECTION 4: Finding us.

          This was a runway photograph with a card reading "Coordinates &
          Access" over it, which named no coordinates and gave no access -- it
          was decoration standing where the practical answer belonged. It now
          carries a live map at full height with the address on top of it.

          Deliberately full-bleed rather than boxed into the page container: a
          map is read by scanning outward from the pin, and the surrounding
          roads are the part that tells a driver which gate to use.
        */}
        <section className="relative w-full bg-ean-navy border-t border-ean-border-dark">
          <div className="max-w-ean mx-auto px-6 md:px-8 pt-20 pb-12 sm:pt-28">
            <SectionReveal className="max-w-2xl space-y-5">
              <span className="font-ui text-[10px] uppercase tracking-widest text-ean-gold font-bold">
                Coordinates &amp; Access
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-light text-ean-text-light leading-tight">
                Direct Airside Support
              </h2>
              <p className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                Our FBO terminal is situated airside at Murtala Muhammed Airport, Lagos. Ground transfers and executive escorts are coordinated by EAN security personnel. Open directions on your phone and call us when you are ten minutes out -- we will meet you at the gate.
              </p>
            </SectionReveal>
          </div>

          <LocationMap pin={LAGOS_HQ.map} title={LAGOS_HQ.title} />
        </section>
      </main>
    </>
  );
}
