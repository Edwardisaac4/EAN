'use client'

import React, { useState } from 'react'
import {
  BANDS,
  HANDLING_LOS,
  HANDLING_ABV,
  OUTSTATION_HANDLING_USD,
  CIQ_USD,
  PARKING_PER_NIGHT_USD,
  DISBURSEMENT_RATE,
  MONTHLY_HANDLING,
  ADDONS,
  addonRate,
} from '@/lib/pricing/bands'
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

const BANDS_ORDER = ['A', 'B', 'C', 'D', 'E'] as const

const BAND_EXAMPLES: Record<MtowBand, string> = {
  A: 'Citation Mustang, Phenom 100/300, King Air 350, Learjet 45',
  B: 'Hawker 800XP/900XP, Citation XLS+/Sovereign, Challenger 300/350, Falcon 2000',
  C: 'Challenger 604/605, Falcon 900EX, Legacy 600/650, Gulfstream G280',
  D: 'Gulfstream G450/G550/G650, Global 5000/6000, Falcon 8X',
  E: 'Global 7500, Lineage 1000, Boeing BBJ Series, Airbus ACJ Series',
}

// Read out of ADDONS by id so Category 03 renders the same published figures
// the add-on rate card does, rather than a second hand-keyed copy of them.
const APRON_PARKING = ADDONS.find((a) => a.id === 'apron_parking')
const HANGARAGE = ADDONS.find((a) => a.id === 'hangarage')

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
          <h2 className="font-display font-bold text-2xl text-ean-text-light flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-ean-gold" />
            Official FBO Rate Sheet & Operational Tariff
          </h2>
          <p className="font-ui text-xs md:text-sm text-ean-muted-light mt-1">
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
                  : 'text-ean-muted-light hover:text-ean-text-light'
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
                  : 'text-ean-muted-light hover:text-ean-text-light'
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
                  : 'text-ean-muted-light hover:text-ean-text-light'
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
          <span className="text-xs font-ui text-ean-muted-light bg-black/10 px-3 py-1 rounded-full w-fit">
            Per Flight Turnaround
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-ui text-xs md:text-sm">
            <thead>
              <tr className="bg-ean-surface border-b border-ean-border-light text-ean-text-light uppercase tracking-wider font-semibold text-[11px]">
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
            <tbody className="divide-y divide-gray-100 text-ean-text-light">
              {BANDS_ORDER.map((b) => {
                const rate = HANDLING_LOS[b]
                const minRate = `$${rate.min.toLocaleString()}`
                const stdRate = `$${rate.standard.toLocaleString()}`

                return (
                  <tr key={b} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-ean-text-light">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-ean-gold/10 text-ean-gold font-bold flex items-center justify-center text-xs">
                          {b}
                        </span>
                        <span>{BANDS[b].label}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-ean-muted-light text-xs max-w-xs">
                      {BAND_EXAMPLES[b]}
                    </td>
                    {(selectedLocation === 'ALL' || selectedLocation === 'LOS') && (
                      <>
                        <td className="py-4 px-6 text-right font-mono font-medium text-ean-text-light">
                          {minRate}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-ean-gold">
                          {stdRate}
                        </td>
                      </>
                    )}
                    {(selectedLocation === 'ALL' || selectedLocation === 'ABV') && (
                      <td className="py-4 px-6 text-right font-mono font-semibold text-ean-text-light">
                        ${HANDLING_ABV.toLocaleString()}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-ean-surface border-t border-ean-border-light text-[11px] font-ui text-ean-muted-light flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-ean-gold shrink-0" />
          <span>Rates are per aircraft turnaround (arrival &amp; departure) and are quoted in USD. Bands A and B carry a single published figure; bands C, D and E are published as a range, shown here as its floor and ceiling. Outstation handling is ${OUTSTATION_HANDLING_USD} per turnaround at any station outside Lagos and Abuja.</span>
        </div>
      </div>

      {/* SECTION 2: STATION CHARGES, PARKING & HANGARAGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm border border-ean-border-light overflow-hidden flex flex-col">
          <div className="p-5 bg-ean-navy-mid border-b border-ean-border-dark text-ean-text-light">
            <span className="text-[11px] font-ui uppercase tracking-widest text-ean-gold font-semibold">
              Category 02
            </span>
            <h3 className="font-display font-bold text-lg text-ean-text-light mt-0.5">
              Station Handling, Parking &amp; Disbursement
            </h3>
          </div>
          <div className="p-5 space-y-4 flex-1">
            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-text-light">
                  Abuja Handling
                </div>
                <div className="text-[11px] text-ean-muted-light">
                  Per turnaround at Abuja NAIA &middot; flat across every MTOW band
                </div>
              </div>
              <div className="font-mono font-bold text-sm text-ean-gold">
                ${HANDLING_ABV.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-text-light">
                  Outstation Handling Fee
                </div>
                <div className="text-[11px] text-ean-muted-light">
                  Per turnaround at any station outside Lagos and Abuja
                </div>
              </div>
              <div className="font-mono font-bold text-sm text-ean-gold">
                ${OUTSTATION_HANDLING_USD.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-text-light">
                  CIQ Fee (Customs, Immigration, Quarantine)
                </div>
                <div className="text-[11px] text-ean-muted-light">
                  Official inspection clearance facilitation per flight
                </div>
              </div>
              <div className="font-mono font-bold text-sm text-ean-gold">
                ${CIQ_USD.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-text-light">
                  Overnight Parking
                </div>
                <div className="text-[11px] text-ean-muted-light">
                  Per night &middot; flat across every MTOW band
                </div>
              </div>
              <div className="font-mono font-bold text-sm text-ean-gold">
                ${PARKING_PER_NIGHT_USD.toLocaleString()} / night
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-ean-surface border border-ean-border-light">
              <div>
                <div className="font-ui font-semibold text-xs text-ean-text-light">
                  Disbursement Fee
                </div>
                <div className="text-[11px] text-ean-muted-light">
                  Levied on any payment EAN makes on the operator&apos;s behalf
                </div>
              </div>
              <div className="font-mono font-bold text-sm text-ean-gold">
                {DISBURSEMENT_RATE * 100}%
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
              Apron Parking &amp; Hangarage
            </h3>
          </div>
          <div className="p-5 space-y-4 flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-ui text-xs">
                <thead>
                  <tr className="border-b border-ean-border-light text-ean-text-light uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-2 pr-2">Band</th>
                    <th className="py-2 px-2 text-right">Apron Parking</th>
                    <th className="py-2 pl-2 text-right">Hangarage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {BANDS_ORDER.map((b) => (
                    <tr key={b}>
                      <td className="py-2.5 pr-2 font-semibold text-ean-text-light whitespace-nowrap">
                        {b} &middot; {BANDS[b].range}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold text-ean-text-light">
                        ${APRON_PARKING ? (addonRate(APRON_PARKING, b) ?? 0).toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 pl-2 text-right font-mono font-bold text-ean-gold">
                        ${HANGARAGE ? (addonRate(HANGARAGE, b) ?? 0).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-ean-gold/10 border border-ean-gold/30 text-xs font-ui text-ean-text-light flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
              <span>Both are charged per day. Every rate on this sheet is quoted in USD &mdash; there are no naira-denominated charges.</span>
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
              className="w-full pl-9 pr-4 py-2 bg-black/10 border border-ean-border-dark text-ean-text-light placeholder-white/50 text-xs font-ui focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-ean-surface">
          {filteredAddons.map((addon) => {
            // A band-priced service has no single headline figure, so the card
            // shows the published span and breaks it out per band below.
            const bandRates = addon.per === 'band'
              ? BANDS_ORDER.map((b) => addonRate(addon, b) ?? 0)
              : null
            const displayRate = addon.per === 'request'
              ? 'On request'
              : bandRates
                ? `$${Math.min(...bandRates).toLocaleString()} – $${Math.max(...bandRates).toLocaleString()}`
                : `$${(addonRate(addon, 'A') ?? 0).toLocaleString()}`

            return (
              <div
                key={addon.id}
                className="bg-white p-4 border border-ean-border-light shadow-xs hover:border-ean-blue/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="font-ui font-semibold text-sm text-ean-text-light mb-1">
                    {addon.label}
                  </div>
                  <div className="text-[11px] font-ui text-ean-muted-light">
                    {addon.per === 'flat'
                      ? 'Flat rate per flight service'
                      : addon.per === 'band'
                        ? 'Rate varies by aircraft MTOW band'
                        : (addon.note ?? 'Quoted on request')}
                  </div>

                  {bandRates && (
                    <div className="mt-3 grid grid-cols-5 gap-1">
                      {BANDS_ORDER.map((b, i) => (
                        <div key={b} className="text-center bg-ean-surface border border-ean-border-light py-1">
                          <div className="text-[9px] font-ui uppercase tracking-wider text-ean-muted-light">
                            {b}
                          </div>
                          <div className="font-mono text-[10px] font-semibold text-ean-text-light">
                            ${bandRates[i].toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-ean-border-light flex items-center justify-between">
                  <span className="text-[11px] font-ui uppercase tracking-wider text-ean-muted-light">
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

      {/* SECTION 5: MONTHLY HANDLING & DISBURSEMENT */}
      <div className="bg-white shadow-sm border border-ean-border-light overflow-hidden">
        <div className="p-6 bg-ean-navy text-ean-text-light flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ean-border-dark">
          <div>
            <span className="text-[11px] font-ui uppercase tracking-widest text-ean-gold font-semibold">
              Category 05
            </span>
            <h3 className="font-display font-bold text-xl text-ean-text-light mt-0.5">
              Monthly Handling Arrangements &amp; Disbursement
            </h3>
          </div>
          <span className="text-xs font-ui text-ean-muted-light bg-black/10 px-3 py-1 rounded-full w-fit">
            Per Calendar Month
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-ui text-xs md:text-sm">
            <thead>
              <tr className="bg-ean-surface border-b border-ean-border-light text-ean-text-light uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-4 px-6">MTOW Weight Category</th>
                <th className="py-4 px-6 text-right">Monthly Handling (Hangarage)</th>
                <th className="py-4 px-6 text-right">Monthly Handling (Apron)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-ean-text-light">
              {BANDS_ORDER.map((b) => (
                <tr key={b} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-6 font-semibold text-ean-text-light">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-ean-gold/10 text-ean-gold font-bold flex items-center justify-center text-xs">
                        {b}
                      </span>
                      <span>{BANDS[b].label}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-ean-gold">
                    ${MONTHLY_HANDLING[b].hangarage.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-semibold text-ean-text-light">
                    ${MONTHLY_HANDLING[b].apron.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-ean-surface border-t border-ean-border-light text-[11px] font-ui text-ean-muted-light flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-ean-gold shrink-0" />
          <span>
            Monthly handling is a standing arrangement billed per calendar month, separate from per-turnaround handling. A disbursement fee of {DISBURSEMENT_RATE * 100}% applies to any payment EAN makes on the operator&apos;s behalf — fuel uplift, permits and third-party invoices included.
          </span>
        </div>
      </div>

      {/* FOOTER CTA STRIP — SWITCH TO CALCULATOR */}
      <div className="bg-linear-to-r from-ean-navy to-ean-navy-mid text-ean-text-light p-8 border border-ean-gold/30 flex flex-col md:flex-row items-center justify-between gap-6">
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
