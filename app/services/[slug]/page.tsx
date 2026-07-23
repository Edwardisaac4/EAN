import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { 
  Plane, 
  Wrench, 
  BadgeCheck, 
  UtensilsCrossed, 
  Star, 
  Building2, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronRight, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  MapPin
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';
import SectionReveal from '@/components/shared/SectionReveal';
import { SERVICES_DATA, ServiceRichData } from '@/lib/constants';

const iconMap = {
  Plane,
  Wrench,
  BadgeCheck,
  UtensilsCrossed,
  Star,
  Building2,
};

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return SERVICES_DATA.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES_DATA.find((s) => s.slug === slug);

  if (!service) {
    return {
      title: 'Service Not Found | EAN Aviation',
    };
  }

  return {
    title: `${service.name} | EAN Aviation Services`,
    description: service.extendedDescription || service.short,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = SERVICES_DATA.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  const IconComponent = iconMap[service.iconName] || Plane;
  const otherServices = SERVICES_DATA.filter((s) => s.slug !== service.slug);

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col bg-ean-surface text-ean-text-dark select-none">
        {/* HERO BANNER SECTION */}
        <section className="relative w-full min-h-[60vh] lg:min-h-[65vh] overflow-hidden bg-ean-navy flex items-center text-white pt-24 pb-16">
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={service.image}
              alt={`${service.name} banner`}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center filter brightness-90"
              quality={95}
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#140307] via-[#1E050B]/80 to-[#1E050B]/50" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#140307]/40 to-[#140307]/90" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full">
            <div className="max-w-3xl space-y-6">
              {/* Back to Services link */}
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-ean-gold hover:text-white transition-colors py-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Aviation Services</span>
              </Link>

              {/* Eyebrow badge */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-ean-gold/20 border border-ean-gold/40 text-ean-gold rounded-xs">
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                  EAN Aviation Specialization
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-light text-white leading-[1.1] tracking-tight">
                {service.name}
              </h1>

              {/* Short summary */}
              <p className="font-ui text-base sm:text-lg md:text-xl text-ean-muted-light leading-relaxed max-w-2xl">
                {service.short}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <Link href={`/contact?service=${service.slug}`}>
                  <GoldButton className="w-full sm:w-auto">
                    <span>Inquire About {service.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </GoldButton>
                </Link>
                <Link href="/services">
                  <OutlineButton className="w-full sm:w-auto text-white border-white/30 hover:border-ean-gold">
                    Explore Other Services
                  </OutlineButton>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* KEY HIGHLIGHTS BAR */}
        {service.stats && service.stats.length > 0 && (
          <section className="bg-gradient-to-r from-[#2D0710] via-[#1E050B] to-[#2D0710] text-white border-y border-ean-gold/30 py-6 relative z-20">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                {service.stats.map((stat, sIdx) => (
                  <div key={sIdx} className="pt-3 sm:pt-0 px-4 flex items-center justify-center gap-3">
                    <Sparkles className="w-4 h-4 text-ean-gold shrink-0" />
                    <span className="font-ui text-xs sm:text-sm font-semibold tracking-wider uppercase text-ean-gold-light">
                      {stat}
                    </span>
                  </div>
                ))}
                <div className="pt-3 sm:pt-0 px-4 flex items-center justify-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-ean-gold shrink-0" />
                  <span className="font-ui text-xs sm:text-sm font-semibold tracking-wider uppercase text-ean-gold-light">
                    MMIA Airside Facility Lagos
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* DETAILED OVERVIEW & FEATURES SECTION */}
        <section className="py-16 md:py-24 relative">
          <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-16">
            <SectionReveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Left Column: Narrative Description */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <span className="font-ui text-xs font-semibold tracking-[0.25em] text-ean-gold uppercase">
                      Service Breakdown
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-light text-ean-navy leading-tight">
                      Uncompromising Precision & Airside Excellence
                    </h2>
                  </div>

                  <p className="font-ui text-base text-ean-muted-dark leading-relaxed">
                    {service.extendedDescription || service.short}
                  </p>

                  <div className="p-6 bg-ean-surface dark:bg-ean-navy/5 border border-ean-border-light rounded-xs space-y-4">
                    <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-ean-navy flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-ean-gold" />
                      Operational Base & Facilities
                    </h3>
                    <p className="font-ui text-xs sm:text-sm text-ean-muted-dark leading-relaxed">
                      All operations are conducted under strict regulatory guidelines at EAN Aviation&apos;s private terminal and maintenance hangar at Murtala Muhammed International Airport (MMIA), Ikeja, Lagos.
                    </p>
                  </div>

                  {/* 24/7 Operations Desk Callout */}
                  <div className="p-6 bg-gradient-to-br from-[#2E0710] to-[#170307] text-white rounded-xs border border-ean-gold/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="font-display text-lg font-light text-white">
                        Require Immediate Flight Support?
                      </div>
                      <p className="font-ui text-xs text-ean-muted-light">
                        Our 24/7 flight operations desk is ready to assist your dispatch.
                      </p>
                    </div>

                    <a
                      href="tel:+2348050333410"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-ean-gold text-ean-navy font-semibold text-xs rounded-xs hover:bg-ean-gold-light transition-colors shrink-0"
                    >
                      <Phone className="w-4 h-4" />
                      <span>+234 (0) 805 033 3410</span>
                    </a>
                  </div>
                </div>

                {/* Right Column: Features & Capabilities Card */}
                <div className="lg:col-span-5 bg-white border border-ean-border-light p-6 sm:p-8 rounded-xs shadow-xl space-y-6">
                  <div className="border-b border-ean-border-light pb-4">
                    <h3 className="font-display text-2xl font-light text-ean-navy">
                      Core Capabilities
                    </h3>
                    <p className="font-ui text-xs text-ean-muted-dark mt-1">
                      Key features included with {service.name}
                    </p>
                  </div>

                  <ul className="space-y-4">
                    {service.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div className="p-1 bg-ean-gold/15 text-ean-gold rounded-full shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="font-ui text-sm text-ean-muted-dark leading-snug">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 border-t border-ean-border-light space-y-4">
                    <div className="flex items-center justify-between text-xs text-ean-muted-dark font-ui">
                      <span>Status:</span>
                      <span className="text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Active 24/7 Operations
                      </span>
                    </div>

                    <Link href={`/contact?service=${service.slug}`}>
                      <GoldButton className="w-full">
                        <span>Submit Direct Inquiry</span>
                        <ChevronRight className="w-4 h-4" />
                      </GoldButton>
                    </Link>
                  </div>
                </div>

              </div>
            </SectionReveal>

            {/* EXPLORE OTHER SERVICES SLIDER / GRID */}
            <SectionReveal className="border-t border-ean-border-light pt-16">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
                  <div>
                    <span className="font-ui text-xs font-semibold tracking-[0.25em] text-ean-gold uppercase">
                      Comprehensive Portfolio
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-light text-ean-navy">
                      Explore Other Aviation Services
                    </h3>
                  </div>

                  <Link href="/services" className="font-ui text-xs font-semibold text-ean-gold hover:text-ean-navy flex items-center gap-1 uppercase tracking-wider">
                    <span>View Full Directory</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherServices.slice(0, 3).map((other) => {
                    const OtherIcon = iconMap[other.iconName] || Plane;
                    return (
                      <Link key={other.slug} href={`/services/${other.slug}`} className="group">
                        <div className="bg-white border border-ean-border-light hover:border-ean-gold/60 p-6 rounded-xs shadow-md hover:shadow-xl transition-all duration-300 space-y-4 h-full flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="p-2.5 bg-ean-navy/5 text-ean-navy rounded-xs group-hover:bg-ean-gold group-hover:text-ean-navy transition-colors">
                                <OtherIcon className="w-4 h-4" />
                              </div>
                              <ChevronRight className="w-4 h-4 text-ean-gold group-hover:translate-x-1 transition-transform" />
                            </div>
                            <h4 className="font-display text-xl font-semibold text-ean-navy group-hover:text-ean-gold transition-colors">
                              {other.name}
                            </h4>
                            <p className="font-ui text-xs text-ean-muted-dark line-clamp-2">
                              {other.short}
                            </p>
                          </div>

                          <span className="font-ui text-[11px] font-bold text-ean-gold uppercase tracking-wider pt-2 border-t border-ean-border-light block">
                            Read Details →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      </main>
    </>
  );
}
