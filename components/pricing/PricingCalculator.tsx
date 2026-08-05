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
  LeadDetails,
} from '@/types/pricing'
import { buildQuote } from '@/lib/pricing/calculations'
import BuildYourQuoteCard from './BuildYourQuoteCard'
import AddonsGrid from './AddonsGrid'
import QuoteSummary from './QuoteSummary'
import RequestOrderModal from './RequestOrderModal'
import PriceListDirectory from './PriceListDirectory'
import { Calculator } from 'lucide-react'

export default function PricingCalculator() {
  const [activeTab, setActiveTab] = useState<'quote' | 'pricelist'>('quote')
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
        </div>
      </section>

      {/* HORIZONTAL TAB NAVIGATION (GET A QUOTE / PRICE LIST) */}
      <div className="bg-white border-b border-ean-border-light shadow-xs sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('quote')}
            className={`py-4 px-1 font-ui text-sm tracking-wide transition-all relative font-semibold ${
              activeTab === 'quote'
                ? 'text-ean-gold border-b-2 border-ean-gold'
                : 'text-ean-muted-dark hover:text-ean-navy border-b-2 border-transparent'
            }`}
          >
            Get a Quote
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricelist')}
            className={`py-4 px-1 font-ui text-sm tracking-wide transition-all relative font-semibold ${
              activeTab === 'pricelist'
                ? 'text-ean-gold border-b-2 border-ean-gold'
                : 'text-ean-muted-dark hover:text-ean-navy border-b-2 border-transparent'
            }`}
          >
            Price List
          </button>
        </div>
      </div>

      {/* TAB CONTENT VIEW */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {activeTab === 'quote' ? (
          /* TWO-COLUMN CALCULATOR LAYOUT */
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
        ) : (
          /* PRICE LIST DIRECTORY VIEW */
          <PriceListDirectory onSwitchToQuote={() => setActiveTab('quote')} />
        )}
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
