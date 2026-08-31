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
  ShieldCheck,
  Sparkles,
  MapPin
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';
import SectionReveal from '@/components/shared/SectionReveal';
import JsonLd from '@/components/shared/JsonLd';
import { SERVICES_DATA } from '@/lib/constants';
import { buildMetadata, breadcrumbSchema, serviceSchema } from '@/lib/seo';

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
      robots: { index: false, follow: true },
    };
  }

  return buildMetadata({
    title: `${service.name} | EAN Aviation Services`,
    description: service.extendedDescription || service.short,
    path: `/services/${service.slug}`,
    image: service.image,
  });
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
      <JsonLd
        schema={[
          serviceSchema({
            name: service.name,
            description: service.extendedDescription || service.short,
            slug: service.slug,
            image: service.image,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
        ]}
      />

      <Navbar />

      <main className="flex-1 flex flex-col bg-ean-surface text-ean-text-dark">
        {/* HERO BANNER SECTION */}
        <section className="relative w-full min-h-[60vh] lg:min-h-[65vh] overflow-hidden bg-ean-obsidian flex items-center text-ean-text-light pt-24 pb-16">
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={service.image}
              alt={`${service.name} banner`}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
              quality={85}
            />
            {/* Balanced Obsidian Black gradient overlays — keeping imagery clear while ensuring text contrast */}
            <div className="absolute inset-0 bg-ean-black/25" />
            <div className="absolute inset-0 bg-linear-to-r from-ean-obsidian/85 via-ean-obsidian/45 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-ean-obsidian/80 via-transparent to-ean-black/20" />
          </div>

          <div className="relative z-10 max-w-ean mx-auto px-6 md:px-8 w-full">
            <div className="max-w-3xl space-y-6">
              {/* Back to Services link */}
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-ean-gold hover:text-ean-text-light transition-colors py-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Aviation Services</span>
              </Link>

              {/* Eyebrow badge */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-ean-gold/20 border border-ean-gold/40 text-ean-gold">
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                  EAN Aviation Specialization
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-ean-text-light leading-[1.1] tracking-tight">
                {service.name}
              </h1>

              {/* Short summary */}
              <p className="font-ui text-base sm:text-lg md:text-xl text-ean-text-light/80 leading-relaxed max-w-2xl">
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
                  <OutlineButton className="w-full sm:w-auto text-ean-text-light border-ean-border-dark hover:border-ean-gold">
                    Explore Other Services
                  </OutlineButton>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* KEY HIGHLIGHTS BAR */}
        {service.stats && service.stats.length > 0 && (
          <section className="bg-ean-obsidian-raised text-ean-text-light border-y border-ean-border-dark py-6 relative z-20">
            <div className="max-w-ean mx-auto px-6 md:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-ean-border-dark">
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
          <div className="max-w-ean mx-auto px-6 md:px-8 space-y-16">
            <SectionReveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                {/* Left Column: Narrative Description */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <span className="font-ui text-xs font-semibold tracking-[0.25em] text-ean-gold uppercase">
                      Service Breakdown
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-light text-slate-900 leading-tight">
                      Uncompromising Precision & Airside Excellence
                    </h2>
                  </div>

                  <p className="font-ui text-base text-slate-600 leading-relaxed">
                    {service.extendedDescription || service.short}
                  </p>

                  <div className="p-6 bg-white border border-ean-border-light space-y-4 shadow-sm">
                    <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-ean-gold" />
                      Operational Base & Facilities
                    </h3>
                    <p className="font-ui text-xs sm:text-sm text-slate-600 leading-relaxed">
                      All operations are conducted under strict regulatory guidelines at EAN Aviation&apos;s private terminal and maintenance hangar at Murtala Muhammed International Airport (MMIA), Ikeja, Lagos.
                    </p>
                  </div>

                  {/* 24/7 Operations Desk Callout */}
                  <div className="p-6 bg-linear-to-br from-ean-obsidian-elevated to-ean-obsidian text-ean-text-light border border-ean-border-dark flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="font-display text-lg font-light text-ean-text-light">
                        Require Immediate Flight Support?
                      </div>
                      <p className="font-ui text-xs text-ean-text-light/70">
                        Our 24/7 flight operations desk is ready to assist your dispatch.
                      </p>
                    </div>

                    <a
                      href="tel:+2348050333410"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-ean-gold text-ean-obsidian font-semibold text-xs hover:bg-ean-gold-light transition-colors shrink-0"
                    >
                      <Phone className="w-4 h-4" />
                      <span>+234 (0) 805 033 3410</span>
                    </a>
                  </div>
                </div>

                {/* Right Column: Features & Capabilities Card */}
                <div className="lg:col-span-5 bg-white border border-ean-border-light p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="border-b border-ean-border-light pb-4">
                    <h3 className="font-display text-2xl font-light text-slate-900">
                      Core Capabilities
                    </h3>
                    <p className="font-ui text-xs text-slate-500 mt-1">
                      Key features included with {service.name}
                    </p>
                  </div>

                  <ul className="space-y-4">
                    {service.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div className="p-1 bg-ean-gold/15 text-ean-gold rounded-full shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="font-ui text-sm text-slate-600 leading-snug">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 border-t border-ean-border-light space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-ui">
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
                    <h3 className="font-display text-2xl sm:text-2xl font-light text-slate-900">
                      Explore Other Aviation Services
                    </h3>
                  </div>

                  <Link href="/services" className="font-ui text-xs font-semibold text-ean-gold hover:text-slate-900 flex items-center gap-1 uppercase tracking-wider">
                    <span>View Full Directory</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherServices.slice(0, 3).map((other) => {
                    const OtherIcon = iconMap[other.iconName] || Plane;
                    return (
                      <Link key={other.slug} href={`/services/${other.slug}`} className="group">
                        <div className="bg-white border border-ean-border-light hover:border-ean-gold/60 p-6 shadow-md hover:shadow-xl transition-all duration-300 space-y-4 h-full flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="p-2.5 bg-ean-obsidian/5 text-ean-obsidian group-hover:bg-ean-gold group-hover:text-ean-obsidian transition-colors">
                                <OtherIcon className="w-4 h-4" />
                              </div>
                              <ChevronRight className="w-4 h-4 text-ean-gold group-hover:translate-x-1 transition-transform" />
                            </div>
                            <h4 className="font-display text-xl font-semibold text-slate-900 group-hover:text-ean-gold transition-colors">
                              {other.name}
                            </h4>
                            <p className="font-ui text-xs text-slate-600 line-clamp-2">
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
