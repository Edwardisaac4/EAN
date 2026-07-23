'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Wrench, 
  Plane, 
  UtensilsCrossed, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import SectionReveal from '@/components/shared/SectionReveal';

const INFRASTRUCTURE_ITEMS = [
  {
    id: 'fbo-lounge',
    title: 'Integrated FBO & VIP Lounge',
    category: 'Private Terminal',
    icon: Building2,
    image: '/images/vip-lounge.png',
    badge: '1st in West Africa',
    description: 'A dedicated 24/7 executive terminal at Lagos airport featuring private ramp access, luxury passenger lounges, discreet diplomatic protocol, and VIP customs clearance completed in under 7 minutes.',
    specs: [
      { label: 'Customs Clearance Time', value: '< 7 Mins' },
      { label: 'Terminal Operations', value: '24/7 Dedicated' },
      { label: 'Lounge Capacity', value: '5 Executive Suites' },
      { label: 'Security Standard', value: 'Private Apron Access' }
    ]
  },
  {
    id: 'amo-hangar',
    title: 'NCAA Approved Maintenance (AMO)',
    category: 'MRO Hangar Facility',
    icon: Wrench,
    image: '/images/hero/slide-3.png',
    badge: 'NCAA AMO Certified',
    description: 'West Africa’s premier business aircraft maintenance hub. Over 20,000 sq. ft of hangar space equipped for line maintenance, avionics diagnostics, and scheduled airworthiness inspections.',
    specs: [
      { label: 'Hangar Space', value: '20,000+ Sq. Ft' },
      { label: 'Certification', value: 'NCAA AMO Approved' },
      { label: 'Supported Fleets', value: 'Gulfstream, Bombardier, Hawker' },
      { label: 'Engineering Pass Rate', value: '100% Audit Score' }
    ]
  },
  {
    id: 'aircraft-sales',
    title: 'Aircraft Sales & Charter Advisory',
    category: 'Aircraft Brokerage & Acquisitions',
    icon: Plane,
    image: '/images/about-jet.png',
    badge: 'Executive Jet Sales & Charter',
    description: 'Bespoke corporate aircraft sales brokerage, pre-purchase technical evaluations, fleet management, and charter flight arrangements across West Africa.',
    specs: [
      { label: 'Territory Coverage', value: 'West Africa & International' },
      { label: 'Brokerage Services', value: 'Jet Sales & Acquisitions' },
      { label: 'Flight Advisory', value: 'Custom Fleet Management' },
      { label: 'Pre-Purchase Support', value: 'NCAA Technical Evaluation' }
    ]
  },
  {
    id: 'wings-catering',
    title: 'Wings™ In-Flight Culinary Facility',
    category: 'Executive Gourmet Unit',
    icon: UtensilsCrossed,
    image: '/images/hero/slide-4.png',
    badge: 'On-Site Flight Kitchen',
    description: 'Our proprietary on-site culinary facility located adjacent to the FBO ramp. Master chefs prepare high-altitude gourmet menus, ensuring farm-to-cabin freshness delivered directly to private jet flights.',
    specs: [
      { label: 'Kitchen Location', value: 'On-Site FBO Ramp' },
      { label: 'Food Safety', value: 'HACCP Certified' },
      { label: 'Lead Time', value: '2-Hour Turnaround' },
      { label: 'Culinary Style', value: 'Bespoke Altitude Dining' }
    ]
  }
];

export default function InfrastructureShowcase() {
  const [activeTab, setActiveTab] = useState<string>('fbo-lounge');

  const activeItem = INFRASTRUCTURE_ITEMS.find((item) => item.id === activeTab) || INFRASTRUCTURE_ITEMS[0];

  return (
    <section className="bg-ean-navy-mid text-white py-20 sm:py-24 relative overflow-hidden border-t border-ean-border-dark">
      {/* Ambient Radial Backlight Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-128 h-128 rounded-full bg-ean-gold/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <SectionReveal className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-ean-gold/10 text-ean-gold border border-ean-gold/30">
            <MapPin className="w-3.5 h-3.5" />
            DNMM / LOS • Murtala Muhammed Airport Hub
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-light text-white leading-tight">
            West Africa’s Premier Aviation Infrastructure
          </h2>
          <p className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
            We operate out of a fully integrated physical complex at Lagos airport — bringing tarmac access, MRO engineering, corporate dealership, and gourmet dining together under one roof.
          </p>
        </SectionReveal>

        {/* Real-Time Airport Specs Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-ean-navy/80 border border-ean-border-dark rounded-xs backdrop-blur-md">
          <div className="flex items-center gap-3 p-2">
            <div className="p-2 bg-ean-gold/10 text-ean-gold rounded-xs border border-ean-gold/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-ean-gold uppercase tracking-wider">Airport Coordinates</div>
              <div className="font-ui text-xs font-semibold text-white">Lagos (ICAO: DNMM)</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-l border-ean-border-dark/60">
            <div className="p-2 bg-ean-gold/10 text-ean-gold rounded-xs border border-ean-gold/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-ean-gold uppercase tracking-wider">Flight Dispatch</div>
              <div className="font-ui text-xs font-semibold text-white">24/7 Ramp Support</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-l border-ean-border-dark/60">
            <div className="p-2 bg-ean-gold/10 text-ean-gold rounded-xs border border-ean-gold/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-ean-gold uppercase tracking-wider">Authority Status</div>
              <div className="font-ui text-xs font-semibold text-white">NCAA AMO & IATA</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-l border-ean-border-dark/60">
            <div className="p-2 bg-ean-gold/10 text-ean-gold rounded-xs border border-ean-gold/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-ean-gold uppercase tracking-wider">Facility Space</div>
              <div className="font-ui text-xs font-semibold text-white">20,000+ Sq Ft Hangar</div>
            </div>
          </div>
        </div>

        {/* Infrastructure Tabs & Interactive Showcase Card */}
        <div className="space-y-8">
          {/* Tab Selector Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {INFRASTRUCTURE_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`p-4 rounded-xs border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-ean-navy border-ean-gold shadow-lg shadow-ean-gold/10'
                      : 'bg-ean-navy/40 border-white/5 hover:border-ean-gold/30 hover:bg-ean-navy/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-2 rounded-xs ${isActive ? 'bg-ean-gold text-ean-navy' : 'bg-ean-navy-mid text-ean-gold'}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-ean-gold animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className={`font-ui text-xs font-semibold tracking-wide ${isActive ? 'text-ean-gold' : 'text-white'}`}>
                      {item.title}
                    </div>
                    <div className="font-ui text-[10px] text-ean-muted-light mt-0.5">
                      {item.category}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Tab Spotlight Stage */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-ean-navy/70 border border-ean-gold/30 p-8 sm:p-10 rounded-xs shadow-2xl backdrop-blur-md"
            >
              {/* Image Display Column */}
              <div className="lg:col-span-6 relative">
                <div className="relative aspect-16/10 rounded-xs overflow-hidden border border-ean-border-dark bg-ean-navy shadow-xl group">
                  <Image
                    src={activeItem.image}
                    alt={activeItem.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    quality={95}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-ean-navy via-transparent to-transparent opacity-60" />
                  
                  {/* Top Badge Overlay */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-ean-navy/90 backdrop-blur-md rounded-xs border border-ean-gold/40 text-[10px] uppercase font-mono text-ean-gold tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-ean-gold" />
                    {activeItem.badge}
                  </div>
                </div>
              </div>

              {/* Details & Specs Column */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <span className="font-ui text-xs font-semibold uppercase tracking-[0.25em] text-ean-gold">
                    {activeItem.category}
                  </span>
                  <h3 className="font-display text-3xl sm:text-4xl font-light text-white leading-tight">
                    {activeItem.title}
                  </h3>
                </div>

                <p className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                  {activeItem.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ean-border-dark/80">
                  {activeItem.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="bg-ean-navy-mid/60 p-3 rounded-xs border border-white/5 space-y-1">
                      <div className="font-ui text-[10px] uppercase tracking-wider text-ean-gold font-semibold">
                        {spec.label}
                      </div>
                      <div className="font-display text-sm sm:text-base font-semibold text-white">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
