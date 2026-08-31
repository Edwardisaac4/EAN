'use client'

import React, { useState } from 'react'
import { BANDS, HANDLING_LOS, HANDLING_ABV, TERMINAL_INTL_USD, CIQ_USD, PARKING_PER_NIGHT_USD, PSC, VIP_LOCAL_NGN, ADDONS } from '@/lib/pricing/bands'
import { MtowBand } from '@/types/pricing'
import {
  FileSpreadsheet,
  Search,
  Printer,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Calculator,
} from 'lucide-react'

interface PriceListDirectoryProps {
  onSwitchToQuote: () => void
}

const BAND_EXAMPLES: Record<MtowBand, string> = {
  A: 'Citation Mustang, Embraer Phenom 100/300, King Air 350',
  B: 'Hawker 800XP, Learjet 60, Citation XLS, Challenger 300/350',
  C: 'Challenger 604/605, Falcon 2000/900, Legacy 600/650, Gulfstream G450',
  D: 'Gulfstream G550/G650, Bombardier Global 6000/7500, Falcon 8X',
  E: 'Boeing BBJ Series, Airbus ACJ Series, Lineage 1000',
}

export default function PriceListDirectory({ onSwitchToQuote }: PriceListDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<'ALL' | 'LOS' | 'ABV'>('ALL')

  const filteredAddons = ADDONS.filter(addon =>
    addon.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER CONTROLS BAR */}
      <div className="bg-white p-6 shadow-sm border border-ean-border-light flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-ean-navy flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-ean-gold" />
            Official FBO Rate Sheet & Operational Tariff
          </h2>
          <p className="font-ui text-xs md:text-sm text-ean-muted-dark mt-1">
            Standard published rates for Lagos MMIA & Abuja NAIA ground handling and airside support services.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* AIRPORT LOCATION FILTER */}
          <div className="flex bg-ean-surface p-1 border border-ean-border-light">
            <button
              type="button"
              onClick={() => setSelectedLocation('ALL')}
              className={`px-3 py-1.5 text-xs font-ui font-medium transition-colors ${
                selectedLocation === 'ALL'
                  ? 'bg-ean-navy text-ean-text-light shadow-sm'
                  : 'text-ean-muted-dark hover:text-ean-navy'
              }`}
            >
              All Stations
            </button>
            <button
              type="button"
              onClick={() => setSelectedLocation('LOS')}
              className={`px-3 py-1.5 text-xs font-ui font-medium transition-colors ${
                selectedLocation === 'LOS'
                  ? 'bg-ean-navy text-ean-text-light shadow-sm'
                  : 'text-ean-muted-dark hover:text-ean-navy'
              }`}
            >
              Lagos (LOS)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLocation('ABV')}
              className={`px-3 py-1.5 text-xs font-ui font-medium transition-colors ${
                selectedLocation === 'ABV'
                  ? 'bg-ean-navy text-ean-text-light shadow-sm'
                  : 'text-ean-muted-dark hover:text-ean-navy'
              }`}
            >
              Abuja (ABV)
            </button>
          </div>

          {/* PRINT BUTTON */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-ean-navy border border-ean-border-dark hover:border-ean-blue hover:text-ean-blue-light text-ean-text-light text-xs font-ui font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-ean-gold" />
            Print Rate Card
          </button>
        </div>
      </div>

      {/* SECTION 1: GROUND HANDLING RATES BY MTOW WEIGHT BAND */}
      <div className="bg-white shadow-sm border border-ean-border-light overflow-hidden">
        <div className="p-6 bg-ean-navy text-ean-text-light flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ean-border-dark">
          <div>
            <span className="text-[11px] font-ui uppercase tracking-widest text-ean-gold font-semibold">
              Category 01
            </span>
            <h3 className="font-display font-bold text-xl text-ean-text-light mt-0.5">
              Ground Handling Base Tariffs (By Aircraft MTOW Weight Class)
            </h3>
          </div>
          <span className="text-xs font-ui text-ean-muted-light bg-white/10 px-3 py-1 rounded-full w-fit">
            Per Flight Turnaround
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-ui text-xs md:text-sm">
            <thead>
              <tr className="bg-ean-surface border-b border-ean-border-light text-ean-navy uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-4 px-6">MTOW Weight Category</th>
                <th className="py-4 px-6">Aircraft Class Examples</th>
                {(selectedLocation === 'ALL' || selectedLocation === 'LOS') && (
                  <>
                    <th className="py-4 px-6 text-right">Lagos Floor Rate</th>
                    <th className="py-4 px-6 text-right">Lagos Standard Rate</th>
                  </>
                )}
                {(selectedLocation === 'ALL' || selectedLocation === 'ABV') && (
                  <th className="py-4 px-6 text-right">Abuja NAIA Rate</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-ean-navy">
              {(['A', 'B', 'C', 'D', 'E'] as const).map((b) => {
                const rate = HANDLING_LOS[b]
                const minRate = typeof rate === 'object' ? `$${rate.min.toLocaleString()}` : `$${rate.toLocaleString()}`
                const stdRate = typeof rate === 'object' ? `$${rate.standard.toLocaleString()}` : `$${rate.toLocaleString()}`

                return (
                  <tr key={b} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-ean-navy">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-ean-gold/10 text-ean-gold font-bold flex items-center justify-center text-xs">
                          {b}
                        </span>
                        <span>{BANDS[b].label}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-ean-muted-dark text-xs max-w-xs">
                      {BAND_EXAMPLES[b]}
                    </td>
                    {(selectedLocation === 'ALL' || selectedLocation === 'LOS') && (
                      <>
                        <td className="py-4 px-6 text-right font-mono font-medium text-ean-navy">
                          {minRate}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-ean-gold">
                          {stdRate}
                        </td>
                      </>
                    )}
                    {(selectedLocation === 'ALL' || selectedLocation === 'ABV') && (
                      <td className="py-4 px-6 text-right font-mono font-semibold text-ean-navy">
                        ${HANDLING_ABV}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-ean-surface border-t border-ean-border-light text-[11px] font-ui text-ean-muted-dark flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-ean-gold shrink-0" />
          <span>Rates are structured per aircraft turnaround (arrival &amp; departure). Heavy jet operations (&gt;80,000 kg) subject to customized handling requirements.</span>
        </div>
      </div>

      {/* SECTION 2: STATUTORY PASSENGER & FACILITATION FEES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm border border-ean-border-light overflow-hidden flex flex-col">
          <div className="p-5 bg-ean-navy-mid border-b border-ean-border-dark text-ean-text-light">
            <span className="text-[11px] font-ui uppercase tracking-widest text-ean-gold font-semibold">
              Category 02
            </span>
            <h3 className="font-display font-bold text-lg text-ean-text-light mt-0.5">
              Passenger & Regulatory Facilitation Fees
            </h3>
          </div>
          <div className="p-5 space-y-4 flex-1">
            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-navy">
                  International Terminal / VIP Terminal Fee
                </div>
                <div className="text-[11px] text-ean-muted-dark">
                  Per international arrival or departure turnaround
                </div>
              </div>
              <div className="font-mono font-bold text-sm text-ean-gold">
                ${TERMINAL_INTL_USD}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-navy">
                  CIQ Facilitation (Customs, Immigration, Quarantine)
                </div>
                <div className="text-[11px] text-ean-muted-dark">
                  Official inspection clearance facilitation per flight
                </div>
              </div>
              <div className="font-mono font-bold text-sm text-ean-gold">
                ${CIQ_USD}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-navy">
                  Passenger Service Charge (International)
                </div>
                <div className="text-[11px] text-ean-muted-dark">
                  Per passenger · CAA statutory charge
                </div>
              </div>
              <div className="font-mono font-bold text-sm text-ean-gold">
                ${PSC.intl_usd} / pax
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-navy">
                  Passenger Service Charge (Domestic)
                </div>
                <div className="text-[11px] text-ean-muted-dark">
                  Per passenger · Local statutory charge
                </div>
              </div>
              <div className="font-mono font-bold text-sm text-ean-navy">
                ₦{PSC.dom_ngn.toLocaleString()} / pax
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-ean-border-light overflow-hidden flex flex-col">
          <div className="p-5 bg-ean-navy-mid border-b border-ean-border-dark text-ean-text-light">
            <span className="text-[11px] font-ui uppercase tracking-widest text-ean-gold font-semibold">
              Category 03
            </span>
            <h3 className="font-display font-bold text-lg text-ean-text-light mt-0.5">
              Lounge Access & Ramp Overnight Parking
            </h3>
          </div>
          <div className="p-5 space-y-4 flex-1">
            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-navy">
                  Overnight Ramp Parking
                </div>
                <div className="text-[11px] text-ean-muted-dark">
                  Per night · Secure airside apron parking
                </div>
              </div>
              <div className="font-mono font-bold text-sm text-ean-gold">
                ${PARKING_PER_NIGHT_USD} / night
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-navy">
                  VIP Lounge Access (Domestic Flight Operators)
                </div>
                <div className="text-[11px] text-ean-muted-dark">
                  Full access to private VIP lounge suites & amenities
                </div>
              </div>
              <div className="font-mono font-bold text-sm text-ean-navy">
                ₦{VIP_LOCAL_NGN.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-navy">
                  Aviation Fuel (Jet A-1)
                </div>
                <div className="text-[11px] text-ean-muted-dark">
                  Onsite direct refueling · 15% disbursement fee applies
                </div>
              </div>
              <div className="font-mono font-semibold text-xs text-amber-700 bg-amber-50 px-2 py-1">
                Platts-Based Daily Rate
              </div>
            </div>

            <div className="p-3 bg-ean-gold/10 border border-ean-gold/30 text-xs font-ui text-ean-navy flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
              <span>Complimentary high-speed Wi-Fi, executive refreshments, and dedicated CRO ushering included with all handling.</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: AIRSIDE SUPPORT & ADD-ON SERVICES TARIFF */}
      <div className="bg-white shadow-sm border border-ean-border-light overflow-hidden">
        <div className="p-6 bg-ean-navy text-ean-text-light flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ean-border-dark">
          <div>
            <span className="text-[11px] font-ui uppercase tracking-widest text-ean-gold font-semibold">
              Category 04
            </span>
            <h3 className="font-display font-bold text-xl text-ean-text-light mt-0.5">
              Airside Ground Equipment & Service Rate Card
            </h3>
          </div>

          {/* SEARCH ADD-ONS */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ean-muted-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search airside service..."
              className="w-full pl-9 pr-4 py-2 bg-white/10 border border-ean-border-dark text-ean-text-light placeholder-white/50 text-xs font-ui focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-ean-surface">
          {filteredAddons.map((addon) => {
            const displayRate = `$${addon.value.toLocaleString()}`

            return (
              <div
                key={addon.id}
                className="bg-white p-4 border border-ean-border-light shadow-xs hover:border-ean-blue/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="font-ui font-semibold text-sm text-ean-navy mb-1">
                    {addon.label}
                  </div>
                  <div className="text-[11px] font-ui text-ean-muted-dark">
                    {addon.per === 'flat' ? 'Flat rate per flight service' : 'Rate varies by aircraft MTOW category'}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-ean-border-light flex items-center justify-between">
                  <span className="text-[11px] font-ui uppercase tracking-wider text-ean-muted-dark">
                    Tariff
                  </span>
                  <span className="font-mono font-bold text-sm text-ean-gold">
                    {displayRate}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FOOTER CTA STRIP — SWITCH TO CALCULATOR */}
      <div className="bg-linear-to-r from-ean-navy to-ean-navy-mid text-ean-text-light p-8 shadow-xl border border-ean-gold/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-display font-bold text-2xl text-ean-text-light">
            Need an Exact Tailored Quote for Your Flight?
          </h3>
          <p className="font-ui text-ean-muted-light text-sm mt-1 max-w-xl">
            Use our interactive Quote Calculator to select your specific aircraft model, pax count, stay duration, and custom add-ons in seconds.
          </p>
        </div>

        <button
          type="button"
          onClick={onSwitchToQuote}
          className="px-6 py-3.5 bg-ean-gold hover:bg-ean-gold-light text-ean-text-dark font-ui font-bold text-sm tracking-wide shadow-lg flex items-center gap-2 shrink-0 transition-colors"
        >
          <Calculator className="w-4 h-4" />
          Switch to Quote Calculator
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  )
}
