'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Plane,
  ShieldCheck,
  Zap,
  ArrowRight,
  FileSpreadsheet,
  BadgeCheck,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';

// Aircraft MTOW Bands Data Reference
interface AircraftBand {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  label: string;
  categoryName: string;
  sampleAircraft: string;
  mtowRange: string;
  baseHandlingUsd: number;
  baseHandlingNgn: number;
  popularPaxCount: number;
}

const AIRCRAFT_BANDS: AircraftBand[] = [
  {
    id: 'A',
    label: 'Band A',
    categoryName: 'Turbo & Light Jets',
    sampleAircraft: 'King Air 350 / Phenom 100',
    mtowRange: '< 5,700 kg',
    baseHandlingUsd: 850,
    baseHandlingNgn: 1275000,
    popularPaxCount: 4,
  },
  {
    id: 'B',
    label: 'Band B',
    categoryName: 'Light & Super Light',
    sampleAircraft: 'Hawker 800XP / Citation XLS',
    mtowRange: '5,701 – 15,000 kg',
    baseHandlingUsd: 1450,
    baseHandlingNgn: 2175000,
    popularPaxCount: 6,
  },
  {
    id: 'C',
    label: 'Band C',
    categoryName: 'Midsize & Super Mid',
    sampleAircraft: 'Challenger 350 / Legacy 600',
    mtowRange: '15,001 – 25,000 kg',
    baseHandlingUsd: 2200,
    baseHandlingNgn: 3300000,
    popularPaxCount: 8,
  },
  {
    id: 'D',
    label: 'Band D',
    categoryName: 'Heavy Jets',
    sampleAircraft: 'Falcon 7X / Challenger 605',
    mtowRange: '25,001 – 45,000 kg',
    baseHandlingUsd: 3100,
    baseHandlingNgn: 4650000,
    popularPaxCount: 12,
  },
  {
    id: 'E',
    label: 'Band E',
    categoryName: 'Ultra Long Range & Airliners',
    sampleAircraft: 'Gulfstream G650 / Global 7500',
    mtowRange: '> 45,000 kg',
    baseHandlingUsd: 4200,
    baseHandlingNgn: 6300000,
    popularPaxCount: 16,
  },
];

export default function PricingSection(): React.JSX.Element {
  const paxId = useId();
  const [selectedBand, setSelectedBand] = useState<AircraftBand>(AIRCRAFT_BANDS[2]); // Default Band C
  const [selectedLocation, setSelectedLocation] = useState<'LOS' | 'ABV'>('LOS');
  const [selectedOperation, setSelectedOperation] = useState<'international' | 'domestic'>('international');
  const [passengers, setPassengers] = useState<number>(6);
  const [includeVipLounge, setIncludeVipLounge] = useState<boolean>(true);
  const [includeGpu, setIncludeGpu] = useState<boolean>(true);

  // Quick Estimate Logic for Preview
  const baseHandling = selectedBand.baseHandlingUsd;
  const paxFeePerHead = selectedOperation === 'international' ? 75 : 35;
  const totalPaxFee = passengers * paxFeePerHead;
  const vipLoungeFee = includeVipLounge ? 250 : 0;
  const gpuFee = includeGpu ? 180 : 0;

  const estimatedTotalUsd = baseHandling + totalPaxFee + vipLoungeFee + gpuFee;
  const estimatedTotalNgn = estimatedTotalUsd * 1500; // Estimated exchange rate for quick display

  return (
    <section
      id="pricing-section"
      className="bg-ean-navy text-ean-text-light py-20 sm:py-28 relative overflow-hidden border-b border-ean-gold/20"
    >
      {/* Background Accent Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-ean-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-ean-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Pattern Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-ean mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ean-gold/10 border border-ean-gold/30 text-ean-gold font-ui text-xs font-semibold uppercase tracking-widest">
              <Calculator className="w-3.5 h-3.5 text-ean-gold" />
              <span>Transparent FBO Tariffs & Quoting</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-ean-text-light leading-[1.12]">
              Instant FBO Ground Handling & Tariff Calculator
            </h2>

            <p className="font-ui text-ean-muted-light text-base sm:text-lg max-w-2xl leading-relaxed">
              Experience upfront transparency for business aviation operations at Lagos MMIA & Abuja NAIA.
              Configure landing weights, passenger services, and luxury add-ons with immediate fee estimates.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <Link href="/pricing">
              <GoldButton className="px-6 py-3.5 font-ui text-sm font-semibold flex items-center gap-2">
                <span>Open Full Pricing Portal</span>
                <ArrowRight size={16} />
              </GoldButton>
            </Link>
          </div>
        </div>

        {/* INTERACTIVE PRICING ESTIMATOR BOARD */}
        <div className="bg-ean-navy-mid/90 border border-ean-gold/30 p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT CONFIGURATION PANEL (7 Columns) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Airport Location Selector */}
            <div className="space-y-3">
              <label className="block font-ui text-xs font-semibold uppercase tracking-wider text-ean-gold">
                1. Select Operational Airport
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLocation('LOS')}
                  className={`p-4 border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${selectedLocation === 'LOS'
                      ? 'bg-ean-gold/15 border-ean-gold text-ean-text-light shadow-md'
                      : 'bg-ean-navy/60 border-ean-border-dark text-ean-muted-light hover:border-ean-border-dark hover:text-ean-text-light'
                    }`}
                >
                  <div>
                    <div className="font-display font-semibold text-lg text-ean-text-light">Lagos (LOS / DNMM)</div>
                    <div className="font-ui text-xs text-ean-muted-light mt-0.5">EAN Private Hangar & VIP Terminal</div>
                  </div>
                  {selectedLocation === 'LOS' && <BadgeCheck className="w-5 h-5 text-ean-gold shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLocation('ABV')}
                  className={`p-4 border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${selectedLocation === 'ABV'
                      ? 'bg-ean-gold/15 border-ean-gold text-ean-text-light shadow-md'
                      : 'bg-ean-navy/60 border-ean-border-dark text-ean-muted-light hover:border-ean-border-dark hover:text-ean-text-light'
                    }`}
                >
                  <div>
                    <div className="font-display font-semibold text-lg text-ean-text-light">Abuja (ABV / DNAA)</div>
                    <div className="font-ui text-xs text-ean-muted-light mt-0.5">Nnamdi Azikiwe Int. Airport</div>
                  </div>
                  {selectedLocation === 'ABV' && <BadgeCheck className="w-5 h-5 text-ean-gold shrink-0" />}
                </button>
              </div>
            </div>

            {/* 2. Aircraft Weight Band Category */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-ui text-xs font-semibold uppercase tracking-wider text-ean-gold">
                  2. Aircraft Weight Category (MTOW)
                </label>
                <span className="font-ui text-xs text-ean-muted-light">
                  MTOW Range: <span className="text-ean-text-light font-medium">{selectedBand.mtowRange}</span>
                </span>
              </div>

              {/* Band Pills */}
              <div className="grid grid-cols-5 gap-2">
                {AIRCRAFT_BANDS.map((band) => {
                  const isSelected = selectedBand.id === band.id;
                  return (
                    <button
                      key={band.id}
                      type="button"
                      onClick={() => setSelectedBand(band)}
                      className={`py-3 px-2 text-center font-ui transition-all duration-200 cursor-pointer ${isSelected
                          ? 'bg-ean-gold text-ean-navy font-bold shadow-lg scale-102'
                          : 'bg-ean-navy/80 border border-ean-border-dark text-ean-muted-light hover:border-ean-gold/40 hover:text-ean-text-light'
                        }`}
                    >
                      <div className="text-xs font-semibold">{band.id}</div>
                      <div className="text-[10px] opacity-80 uppercase tracking-tighter hidden sm:block mt-0.5">
                        {band.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Aircraft Category Info Banner */}
              <div className="p-3.5 bg-ean-navy/80 border border-ean-border-dark flex items-center justify-between text-xs font-ui">
                <div className="flex items-center gap-2.5">
                  <Plane className="w-4 h-4 text-ean-gold" />
                  <span className="text-ean-muted-light">
                    Example Type: <strong className="text-ean-text-light">{selectedBand.sampleAircraft}</strong>
                  </span>
                </div>
                <span className="text-ean-gold font-mono font-semibold">${selectedBand.baseHandlingUsd.toLocaleString()} Base</span>
              </div>
            </div>

            {/* 3. Operation Type & Passenger Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-ui text-xs font-semibold uppercase tracking-wider text-ean-gold">
                  3. Flight Operation
                </label>
                <div className="grid grid-cols-2 gap-2 bg-ean-navy p-1 border border-ean-border-dark">
                  <button
                    type="button"
                    onClick={() => setSelectedOperation('international')}
                    className={`py-2 px-3 font-ui text-xs font-medium transition-all cursor-pointer ${selectedOperation === 'international'
                        ? 'bg-ean-gold text-ean-navy font-semibold'
                        : 'text-ean-muted-light hover:text-ean-text-light'
                      }`}
                  >
                    International
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOperation('domestic')}
                    className={`py-2 px-3 font-ui text-xs font-medium transition-all cursor-pointer ${selectedOperation === 'domestic'
                        ? 'bg-ean-gold text-ean-navy font-semibold'
                        : 'text-ean-muted-light hover:text-ean-text-light'
                      }`}
                  >
                    Domestic
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor={paxId} className="block font-ui text-xs font-semibold uppercase tracking-wider text-ean-gold">
                    4. Passengers
                  </label>
                  <span className="font-mono text-xs font-semibold text-ean-text-light">{passengers} Pax</span>
                </div>
                <div className="flex items-center gap-3 bg-ean-navy px-3 py-1.5 border border-ean-border-dark">
                  <input
                    id={paxId}
                    type="range"
                    min={1}
                    max={30}
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value, 10))}
                    className="w-full accent-ean-gold cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 4. Luxury Executive Add-ons */}
            <div className="space-y-3">
              <label className="block font-ui text-xs font-semibold uppercase tracking-wider text-ean-gold">
                5. Executive Add-on Amenities
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIncludeVipLounge(!includeVipLounge)}
                  className={`p-3 border text-left transition-all cursor-pointer flex items-center justify-between ${includeVipLounge
                      ? 'bg-ean-gold/10 border-ean-gold/60 text-ean-text-light'
                      : 'bg-ean-navy/60 border-ean-border-dark text-ean-muted-light'
                    }`}
                >
                  <span className="font-ui text-xs font-medium">VIP Terminal Lounge Access</span>
                  <span className="font-mono text-xs text-ean-gold font-semibold">+$250</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIncludeGpu(!includeGpu)}
                  className={`p-3 border text-left transition-all cursor-pointer flex items-center justify-between ${includeGpu
                      ? 'bg-ean-gold/10 border-ean-gold/60 text-ean-text-light'
                      : 'bg-ean-navy/60 border-ean-border-dark text-ean-muted-light'
                    }`}
                >
                  <span className="font-ui text-xs font-medium">GPU 28V Ground Power Unit</span>
                  <span className="font-mono text-xs text-ean-gold font-semibold">+$180</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SUMMARY & QUOTE DISPLAY PANEL (5 Columns) */}
          <div className="lg:col-span-5 bg-ean-navy/90 border border-ean-gold/40 p-6 sm:p-8 space-y-6 relative overflow-hidden flex flex-col justify-between h-full">

            {/* Top Badge */}
            <div className="flex items-center justify-between border-b border-ean-border-dark pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ean-gold" />
                <span className="font-ui text-xs font-semibold uppercase tracking-widest text-ean-gold">
                  Instant Rate Estimate
                </span>
              </div>
              <span className="text-[10px] font-ui uppercase tracking-wider bg-ean-gold/20 text-ean-gold px-2 py-0.5 font-semibold">
                Official Tariff
              </span>
            </div>

            {/* Fee Breakdown Stack */}
            <div className="space-y-3 font-ui text-xs">
              <div className="flex justify-between py-1.5 border-b border-ean-border-dark">
                <span className="text-ean-muted-light">Handling Floor ({selectedBand.label}):</span>
                <span className="font-mono text-ean-text-light font-medium">${baseHandling.toLocaleString()} USD</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-ean-border-dark">
                <span className="text-ean-muted-light">Passenger Facilitation ({passengers} Pax):</span>
                <span className="font-mono text-ean-text-light font-medium">${totalPaxFee.toLocaleString()} USD</span>
              </div>

              {includeVipLounge && (
                <div className="flex justify-between py-1.5 border-b border-ean-border-dark">
                  <span className="text-ean-muted-light">EAN VIP Lounge Service:</span>
                  <span className="font-mono text-ean-text-light font-medium">$250 USD</span>
                </div>
              )}

              {includeGpu && (
                <div className="flex justify-between py-1.5 border-b border-ean-border-dark">
                  <span className="text-ean-muted-light">GPU Ground Power Service:</span>
                  <span className="font-mono text-ean-text-light font-medium">$180 USD</span>
                </div>
              )}

              <div className="flex justify-between py-1.5 text-ean-gold font-semibold">
                <span>Airport Tariff Compliance:</span>
                <span>NCAA / FAAN Verified</span>
              </div>
            </div>

            {/* Prominent Estimated Price Box */}
            <div className="bg-ean-navy p-5 border border-ean-gold/40 text-center space-y-1">
              <div className="text-[11px] font-ui uppercase tracking-widest text-ean-muted-light">
                Estimated Total FBO Fee
              </div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-ean-gold tracking-tight">
                ${estimatedTotalUsd.toLocaleString()}{' '}
                <span className="text-sm font-ui text-ean-text-light font-normal">USD</span>
              </div>
              <div className="text-xs font-mono text-ean-muted-light">
                ≈ ₦{estimatedTotalNgn.toLocaleString()} NGN
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Link href="/pricing" className="block w-full">
                <GoldButton className="w-full justify-center py-3.5 font-ui text-sm font-semibold flex items-center gap-2">
                  <span>Generate Full Formal Quote & PDF</span>
                  <ChevronRight size={16} />
                </GoldButton>
              </Link>

              <Link href="/contact" className="block w-full">
                <OutlineButton className="w-full justify-center py-3 font-ui text-xs font-medium border-ean-border-dark text-ean-text-light hover:border-ean-blue hover:text-ean-blue-light">
                  Contact Dispatch & Flight Operations
                </OutlineButton>
              </Link>
            </div>

            {/* Security Guarantee Note */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-ean-muted-light font-ui pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-ean-gold shrink-0" />
              <span>Official Tariff System • Instant PDF Generation Available</span>
            </div>

          </div>

        </div>

        {/* 4 FEATURE PILLARS BELOW CALCULATOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="p-6 bg-ean-navy-mid/60 border border-ean-border-dark hover:border-ean-blue/50 transition-colors duration-300 space-y-3">
            <div className="w-10 h-10 bg-ean-gold/10 border border-ean-gold/30 flex items-center justify-center text-ean-gold">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg text-ean-text-light">NCAA Approved Tariffs</h3>
            <p className="font-ui text-xs text-ean-muted-light leading-relaxed">
              Fully compliant ground handling and landing rates aligned with NCAA regulatory guidelines.
            </p>
          </div>

          <div className="p-6 bg-ean-navy-mid/60 border border-ean-border-dark hover:border-ean-blue/50 transition-colors duration-300 space-y-3">
            <div className="w-10 h-10 bg-ean-gold/10 border border-ean-gold/30 flex items-center justify-center text-ean-gold">
              <Building2 size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg text-ean-text-light">Lagos & Abuja Aprons</h3>
            <p className="font-ui text-xs text-ean-muted-light leading-relaxed">
              Dedicated handling services at Lagos Murtala Muhammed & Abuja Nnamdi Azikiwe International.
            </p>
          </div>

          <div className="p-6 bg-ean-navy-mid/60 border border-ean-border-dark hover:border-ean-blue/50 transition-colors duration-300 space-y-3">
            <div className="w-10 h-10 bg-ean-gold/10 border border-ean-gold/30 flex items-center justify-center text-ean-gold">
              <Zap size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg text-ean-text-light">Custom Executive Add-ons</h3>
            <p className="font-ui text-xs text-ean-muted-light leading-relaxed">
              Select Wings™ in-flight luxury catering, VIP lounge passes, GPU power, and fuel uplift.
            </p>
          </div>

          <div className="p-6 bg-ean-navy-mid/60 border border-ean-border-dark hover:border-ean-blue/50 transition-colors duration-300 space-y-3">
            <div className="w-10 h-10 bg-ean-gold/10 border border-ean-gold/30 flex items-center justify-center text-ean-gold">
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg text-ean-text-light">Instant Reference Code</h3>
            <p className="font-ui text-xs text-ean-muted-light leading-relaxed">
              Export generated quotes directly for immediate dispatch reservation and payment processing.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
