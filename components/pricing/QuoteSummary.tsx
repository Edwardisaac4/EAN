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
  lead,
  onSubmitLead,
  onOpenRequestOrder,
}: QuoteSummaryProps) {
  const isBlurred = !state.revealed

  const aircraftName = state.aircraft?.name ?? (state.mtow_manual ? `Aircraft (${state.mtow_manual.toLocaleString()} kg)` : 'Embraer Legacy 650')
  
  // Format MTOW weight range subtext matching screenshot (e.g. 20,001 – 30,000 kg · Lagos · Domestic)
  const bandInfo = BANDS[quote.band]
  const bandRangeText = bandInfo ? bandInfo.label.replace(/^Band [A-E] — /, '') : '20,001 – 30,000 kg'
  const locationLabel = state.location === 'LOS' ? 'Lagos' : 'Abuja'
  const opLabel = state.operation === 'intl' ? 'International' : 'Domestic'
  const stayLabel = state.stay === 'over' ? `overnight (${state.nights}n)` : 'same-day turnaround'

  return (
    <div className="w-full lg:w-100 shrink-0 sticky top-24 space-y-4">
      <div className="relative bg-white rounded-2xl shadow-sm border border-[#EBE5DF] overflow-hidden">
        {/* HEADER (DARK BURGUNDY / MAROON BANNER #581825) */}
        <div className="p-6 bg-[#581825] text-white space-y-1">
          <h2 className="font-display font-bold text-2xl text-white tracking-tight truncate">
            {aircraftName}
          </h2>
          <div className="text-xs font-ui text-white/80">
            {bandRangeText} · {locationLabel} · {opLabel}
          </div>
          <div className="text-xs font-ui text-white/70">
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
                  <span className="font-semibold text-ean-navy">Ground handling</span>
                  <span className="font-mono font-bold text-ean-navy">$1,800</span>
                </div>
                <div className="flex justify-between text-xs font-ui">
                  <span className="font-semibold text-ean-navy">VIP Lounge (local operators)</span>
                  <span className="font-mono font-bold text-ean-navy">₦85,000</span>
                </div>
                <div className="flex justify-between text-xs font-ui">
                  <span className="font-semibold text-ean-navy">Passenger service charge</span>
                  <span className="font-mono font-bold text-ean-navy">₦34,000</span>
                </div>
              </div>
            </div>
          ) : (
            /* REVEALED PRICE DETAILS & ITEMIZED BREAKDOWN */
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between text-ean-gold pb-2 border-b border-ean-border-light">
                <span className="text-xs font-ui uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  Itemized Charge Summary
                </span>
              </div>

              {quote.items.length === 0 ? (
                <div className="text-xs font-ui text-ean-muted-dark text-center py-6">
                  Select an aircraft to view ground handling estimates.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {quote.items.map((item, idx) => (
                    <QuoteLineItem key={`${item.label}-${idx}`} item={item} />
                  ))}
                </div>
              )}

              {/* TOTAL ESTIMATE ROW */}
              <div className="pt-4 border-t border-[#EBE5DF]">
                <div className="text-[11px] font-ui uppercase tracking-widest text-ean-muted-dark font-semibold">
                  Total Estimated Handling Fee
                </div>
                <div className="text-2xl font-mono font-bold text-[#581825] mt-1 tabular-nums">
                  {quote.totalDisplay}
                </div>
              </div>

              {/* DISBURSEMENT & REGULATORY NOTES */}
              <div className="p-3 bg-amber-500/10 rounded-xl border-l-3 border-amber-500 text-[11px] font-ui text-amber-900 leading-relaxed space-y-1">
                <div className="flex items-center gap-1 text-amber-900 font-semibold text-[10px] uppercase">
                  <Info className="w-3.5 h-3.5 text-amber-700" /> Note & Disbursement Terms
                </div>
                <p>Fuel at Platts-based pricing on request (15% disbursement fee).</p>
                <p>PSC shown is proposed rate pending CAA committee ratification.</p>
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
