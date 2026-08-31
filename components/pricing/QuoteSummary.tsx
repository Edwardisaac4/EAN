'use client'

import React from 'react'
import { QuoteResult, QuoteState, LeadDetails } from '@/types/pricing'
import { BANDS } from '@/lib/pricing/bands'
import QuoteLineItem from './QuoteLineItem'
import LeadGate from './LeadGate'
import QuoteActions from './QuoteActions'
import { Calculator, Info } from 'lucide-react'

interface QuoteSummaryProps {
  quote: QuoteResult
  state: QuoteState
  lead: LeadDetails | null
  onSubmitLead: (lead: LeadDetails) => void
  onOpenRequestOrder: () => void
}

export default function QuoteSummary({
  quote,
  state,
  onSubmitLead,
  onOpenRequestOrder,
}: QuoteSummaryProps) {
  const isBlurred = !state.revealed

  // The calculator falls back to a Band A default weight when nothing is
  // chosen, so `quote.band` is always populated. Naming a specific aircraft and
  // weight range off the back of that default told the visitor they were
  // pricing an Embraer Legacy 650 they never selected.
  const hasAircraft = Boolean(state.aircraft || state.mtow_manual)

  const aircraftName = state.aircraft?.name
    ?? (state.mtow_manual ? `Aircraft (${state.mtow_manual.toLocaleString()} kg)` : 'No aircraft selected')

  // Weight range subtext, e.g. "15,001 – 30,000 kg · Lagos · Domestic".
  const bandRangeText = hasAircraft ? (BANDS[quote.band]?.range ?? '') : ''
  const locationLabel = state.location === 'LOS' ? 'Lagos' : 'Abuja'
  const opLabel = state.operation === 'intl' ? 'International' : 'Domestic'
  const stayLabel = state.stay === 'over' ? `overnight (${state.nights}n)` : 'same-day turnaround'

  return (
    <div className="w-full lg:w-100 shrink-0 sticky top-24 space-y-4">
      <div className="relative bg-white shadow-sm border border-ean-border-light overflow-hidden">
        {/* HEADER (DARK BURGUNDY BANNER) */}
        <div className="p-6 bg-ean-burgundy-rich text-ean-text-light space-y-1">
          <h2 className="font-display font-medium text-xl md:text-2xl text-ean-text-light tracking-wide truncate">
            {aircraftName}
          </h2>
          <div className="text-xs font-ui text-ean-text-light/80">
            {[bandRangeText, locationLabel, opLabel].filter(Boolean).join(' · ')}
          </div>
          <div className="text-xs font-ui text-ean-text-light/70">
            {stayLabel} · {state.pax} pax
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <div className="relative p-6 space-y-5">
          {/* LEAD GATE FORM OVERLAY (UNTIL REVEALED) */}
          {isBlurred ? (
            <div className="relative z-10">
              <LeadGate
                onSubmitLead={onSubmitLead}
                quote={quote}
                state={state}
              />

              {/* BLURRED BACKGROUND PLACEHOLDER ITEM LIST */}
              <div className="mt-6 blur-xs opacity-30 select-none pointer-events-none space-y-3">
                <div className="flex justify-between text-xs font-ui">
                  <span className="font-semibold text-ean-navy">Handling fee</span>
                  <span className="font-mono font-bold text-ean-navy">$550</span>
                </div>
                <div className="flex justify-between text-xs font-ui">
                  <span className="font-semibold text-ean-navy">CIQ fee</span>
                  <span className="font-mono font-bold text-ean-navy">$600</span>
                </div>
                <div className="flex justify-between text-xs font-ui">
                  <span className="font-semibold text-ean-navy">Overnight parking</span>
                  <span className="font-mono font-bold text-ean-navy">$100</span>
                </div>
              </div>
            </div>
          ) : (
            /* REVEALED PRICE DETAILS & ITEMIZED BREAKDOWN */
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-ean-border-light">
                <span className="text-xs font-ui uppercase tracking-widest font-semibold flex items-center gap-1.5 text-ean-burgundy-rich">
                  <Calculator className="w-4 h-4 text-ean-gold" />
                  Itemized Charge Summary
                </span>
              </div>

              {quote.items.length === 0 ? (
                <div className="text-xs font-ui text-ean-muted-dark text-center py-6">
                  Select an aircraft to view ground handling estimates.
                </div>
              ) : (
                <div className="divide-y divide-ean-border-light">
                  {quote.items.map((item, idx) => (
                    <QuoteLineItem key={`${item.label}-${idx}`} item={item} />
                  ))}
                </div>
              )}

              {/* TOTAL ESTIMATE ROW */}
              <div className="pt-4 border-t border-ean-border-light">
                <div className="text-[11px] font-ui uppercase tracking-widest text-ean-muted-dark font-semibold">
                  Total Estimated Handling Fee
                </div>
                <div className="text-2xl font-mono font-bold text-ean-burgundy-rich mt-1 tabular-nums">
                  {quote.totalDisplay}
                </div>
              </div>

              {/* DISBURSEMENT & REGULATORY NOTES */}
              <div className="p-3 bg-amber-500/10 border-l-3 border-amber-500 text-[11px] font-ui text-amber-900 leading-relaxed space-y-1">
                <div className="flex items-center gap-1 text-amber-900 font-semibold text-[10px] uppercase">
                  <Info className="w-3.5 h-3.5 text-amber-700" /> Note & Disbursement Terms
                </div>
                <p>All rates are USD, per turnaround, as published on the EAN FBO price list.</p>
                <p>A 15% disbursement fee applies to any payment EAN makes on your behalf.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REVEALED ACTION BUTTONS */}
      {!isBlurred && (
        <QuoteActions
          quote={quote}
          state={state}
          onOpenRequestOrder={onOpenRequestOrder}
        />
      )}
    </div>
  )
}
