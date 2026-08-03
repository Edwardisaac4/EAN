'use client'

import React, { useState, useMemo } from 'react'
import {
  QuoteState,
  Aircraft,
  Location,
  Operation,
  StayType,
  HandingTier,
  DayType,
  Mode,
  LeadDetails,
} from '@/types/pricing'
import { buildQuote } from '@/lib/pricing/calculations'
import { BANDS, HANDLING_LOS, HANDLING_ABV } from '@/lib/pricing/bands'
import ModeToggle from './ModeToggle'
import AircraftSelector from './AircraftSelector'
import ServiceOptions from './ServiceOptions'
import AddonsGrid from './AddonsGrid'
import QuoteSummary from './QuoteSummary'
import RequestOrderModal from './RequestOrderModal'
import { Calculator, FileSpreadsheet } from 'lucide-react'

export default function PricingCalculator() {
  const [mode, setMode] = useState<Mode>('client')
  const [aircraft, setAircraft] = useState<Aircraft | null>(null)
  const [manualMtow, setManualMtow] = useState<number | null>(null)
  const [location, setLocation] = useState<Location>('LOS')
  const [operation, setOperation] = useState<Operation>('dom')
  const [stay, setStay] = useState<StayType>('same')
  const [nights, setNights] = useState<number>(1)
  const [pax, setPax] = useState<number>(4)
  const [day, setDay] = useState<DayType>('wd')
  const [handling, setHandling] = useState<HandingTier>('standard')
  const [addons, setAddons] = useState<Record<string, boolean>>({})
  const [revealed, setRevealed] = useState<boolean>(false)
  const [lead, setLead] = useState<LeadDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Generate Request Order reference ONCE per session state
  const [refCode] = useState<string>(() => {
    const timestampPart = Math.floor(100000 + Math.random() * 900000)
    return `EAN-${timestampPart}`
  })

  // Construct QuoteState object
  const state: QuoteState = useMemo(() => ({
    aircraft,
    mtow_manual: manualMtow,
    location,
    operation,
    stay,
    nights,
    pax,
    day,
    handling,
    addons,
    mode,
    revealed,
  }), [
    aircraft,
    manualMtow,
    location,
    operation,
    stay,
    nights,
    pax,
    day,
    handling,
    addons,
    mode,
    revealed,
  ])

  // Rebuild quote calculation on state changes
  const quote = useMemo(() => buildQuote(state), [state])

  const handleToggleAddon = (id: string) => {
    setAddons(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAutoCheckCiq = () => {
    setAddons(prev => ({ ...prev, ciq: true }))
  }

  const handleLeadSubmit = (submittedLead: LeadDetails) => {
    setLead(submittedLead)
    setRevealed(true)
  }

  return (
    <div className="min-h-screen bg-ean-surface text-ean-text-dark pb-20">
      {/* HERO STRIP */}
      <section className="bg-ean-navy text-white pt-24 pb-16 px-6 relative border-b border-ean-gold/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-ui tracking-widest uppercase text-ean-gold font-semibold bg-ean-gold/10 px-3 py-1 rounded-full mb-3 border border-ean-gold/30">
              <Calculator className="w-3.5 h-3.5" />
              Official FBO Tariff & Calculator
            </div>
            <h1 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight">
              FBO Pricing & Quote Portal
            </h1>
            <p className="font-ui text-ean-muted-light text-base md:text-lg mt-2 max-w-2xl">
              Instant ground handling estimates, passenger facilitation fees, and customizable add-ons for Lagos MMIA & Abuja NAIA.
            </p>
          </div>

          <div className="shrink-0">
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
        </div>
      </section>

      {/* TWO-COLUMN CALCULATOR LAYOUT */}
      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* CALCULATOR MAIN PANEL */}
        <div className="flex-1 w-full space-y-6">
          {/* STEP 1: AIRCRAFT SELECTOR (LIVE API SEARCH) */}
          <AircraftSelector
            value={aircraft}
            manualMtow={manualMtow}
            onSelect={setAircraft}
            onManualMtow={setManualMtow}
          />

          {/* STEP 2: FLIGHT DETAILS & PARAMETERS */}
          <ServiceOptions
            location={location}
            operation={operation}
            stay={stay}
            nights={nights}
            pax={pax}
            day={day}
            handling={handling}
            mode={mode}
            band={quote.band}
            onChangeLocation={setLocation}
            onChangeOperation={setOperation}
            onChangeStay={setStay}
            onChangeNights={setNights}
            onChangePax={setPax}
            onChangeDay={setDay}
            onChangeHandling={setHandling}
            onAutoCheckCiq={handleAutoCheckCiq}
          />

          {/* STEP 3: ADD-ON SERVICES */}
          <AddonsGrid
            addons={addons}
            band={quote.band}
            onToggleAddon={handleToggleAddon}
          />

          {/* STAFF MODE MTOW TARIFF REFERENCE TABLE */}
          {mode === 'staff' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-ean-border-light space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-ean-border-light">
                <h3 className="font-display font-semibold text-xl text-ean-navy flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-ean-gold" />
                  Staff Reference — CAA MTOW Tariff Bands
                </h3>
                <span className="text-xs font-ui uppercase tracking-wider text-ean-navy bg-ean-navy/10 px-2.5 py-1 rounded-full font-semibold">
                  Official Rate Sheet
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-ui text-xs">
                  <thead>
                    <tr className="bg-ean-surface border-b border-ean-border-light text-ean-navy uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Band</th>
                      <th className="py-3 px-4">MTOW Weight Range</th>
                      <th className="py-3 px-4">Lagos Floor Rate</th>
                      <th className="py-3 px-4">Lagos Standard Rate</th>
                      <th className="py-3 px-4">Abuja Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((b) => {
                      const rate = HANDLING_LOS[b]
                      const isCurrent = quote.band === b
                      const minRate = typeof rate === 'object' ? `$${rate.min}` : `$${rate}`
                      const stdRate = typeof rate === 'object' ? `$${rate.standard}` : `$${rate}`

                      return (
                        <tr
                          key={b}
                          className={`transition-colors ${
                            isCurrent ? 'bg-ean-gold/10 font-semibold text-ean-navy' : 'hover:bg-gray-50 text-ean-text-dark'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold ${isCurrent ? 'bg-ean-gold text-white' : 'bg-ean-surface text-ean-navy'}`}>
                              Band {b}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{BANDS[b].label}</td>
                          <td className="py-3 px-4 font-mono">{minRate}</td>
                          <td className="py-3 px-4 font-mono">{stdRate}</td>
                          <td className="py-3 px-4 font-mono">${HANDLING_ABV}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* QUOTE SUMMARY STICKY SIDEBAR */}
        <QuoteSummary
          quote={quote}
          state={state}
          mode={mode}
          lead={lead}
          onSubmitLead={handleLeadSubmit}
          onOpenRequestOrder={() => setIsModalOpen(true)}
        />
      </div>

      {/* FORMAL REQUEST ORDER MODAL */}
      <RequestOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quote={quote}
        state={state}
        lead={lead}
        refCode={refCode}
      />
    </div>
  )
}
