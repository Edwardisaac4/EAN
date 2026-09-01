'use client'

import React, { useState, useMemo, useSyncExternalStore } from 'react'
import {
  QuoteState,
  Aircraft,
  Location,
  Operation,
  StayType,
  HandingTier,
  DayType,
  LeadDetails,
} from '@/types/pricing'
import { buildQuote } from '@/lib/pricing/calculations'
import {
  grantReveal,
  subscribeToReveal,
  getRevealSnapshot,
  getRevealServerSnapshot,
} from '@/lib/pricing/reveal-store'
import dynamic from 'next/dynamic'
import BuildYourQuoteCard from './BuildYourQuoteCard'
import AddonsGrid from './AddonsGrid'
import QuoteSummary from './QuoteSummary'
import { Calculator } from 'lucide-react'

// Dynamically import heavy modals to cut down JS bundle size & main-thread execution time
const RequestOrderModal = dynamic(() => import('./RequestOrderModal'))

export default function PricingCalculator() {
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Reveal state lives in a session-scoped external store so it survives a page
  // refresh — otherwise the visitor is re-gated and submits a duplicate lead.
  const { revealed, lead } = useSyncExternalStore(
    subscribeToReveal,
    getRevealSnapshot,
    getRevealServerSnapshot
  )

  const handleSelectAircraft = (selected: Aircraft | null) => {
    setAircraft(selected)
    if (selected) {
      setManualMtow(null)
    }
  }

  const handleSetManualMtow = (mtow: number | null) => {
    setManualMtow(mtow)
    if (mtow !== null) {
      setAircraft(null)
    }
  }

  // Generate Request Order reference ONCE per session state using unique UUID
  const [refCode] = useState<string>(() => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `EAN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    }
    const uniqueSuffix = Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000).toString(36).toUpperCase()
    return `EAN-${uniqueSuffix}`
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
    mode: 'client',
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
    grantReveal(submittedLead)
  }

  return (
    <div className="min-h-screen bg-ean-surface text-ean-text-light pb-20">
      {/* ELEGANT & COMPACT HERO SECTION WITH NAVBAR CLEARANCE */}
      <section className="bg-linear-to-b from-ean-navy-mid via-ean-navy to-ean-navy text-ean-text-light pt-28 pb-8 md:pt-32 md:pb-10 px-6 relative overflow-hidden border-b border-ean-gold/30 shadow-md">
        {/* Subtle Ambient Gold Blur */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-ean-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-ean mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-ui tracking-widest uppercase text-ean-gold font-semibold bg-ean-gold/10 px-3.5 py-1 rounded-full mb-3 border border-ean-gold/30 backdrop-blur-xs shadow-[0_0_15px_rgba(43,0,152,0.1)]">
              <Calculator className="w-3.5 h-3.5" />
              Official FBO Tariff & Calculator
            </div>
            <h1 className="font-display font-light text-2xl sm:text-2xl text-ean-text-light tracking-wide leading-snug">
              FBO Pricing &amp; Quote Portal
            </h1>
            <p className="font-ui text-ean-muted-light text-xs sm:text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Instant ground handling estimates, passenger facilitation fees, and customizable add-ons for Lagos MMIA &amp; Abuja NAIA.
            </p>
          </div>
        </div>
      </section>

      {/* CALCULATOR CONTAINER VIEW */}
      <div className="max-w-ean mx-auto px-6 mt-6 md:mt-8">
        {/* TWO-COLUMN CALCULATOR LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* CALCULATOR MAIN PANEL */}
          <div className="flex-1 w-full space-y-6">
            {/* BUILD YOUR QUOTE CARD */}
            <BuildYourQuoteCard
              aircraft={aircraft}
              manualMtow={manualMtow}
              onSelectAircraft={handleSelectAircraft}
              onSetManualMtow={handleSetManualMtow}
              location={location}
              operation={operation}
              day={day}
              pax={pax}
              stay={stay}
              nights={nights}
              handling={handling}
              band={quote.band}
              onChangeLocation={setLocation}
              onChangeOperation={setOperation}
              onChangeDay={setDay}
              onChangePax={setPax}
              onChangeStay={setStay}
              onChangeNights={setNights}
              onChangeHandling={setHandling}
              onAutoCheckCiq={handleAutoCheckCiq}
            />

            {/* STEP 3: ADD-ON SERVICES */}
            <AddonsGrid
              addons={addons}
              band={quote.band}
              onToggleAddon={handleToggleAddon}
            />
          </div>

          {/* QUOTE SUMMARY STICKY SIDEBAR */}
          <QuoteSummary
            quote={quote}
            state={state}
            lead={lead}
            onSubmitLead={handleLeadSubmit}
            onOpenRequestOrder={() => setIsModalOpen(true)}
          />
        </div>
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
