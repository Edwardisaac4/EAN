'use client'

import React from 'react'
import { QuoteResult, QuoteState, Mode, LeadDetails } from '@/types/pricing'
import QuoteLineItem from './QuoteLineItem'
import LeadGate from './LeadGate'
import QuoteActions from './QuoteActions'
import { Calculator, Info } from 'lucide-react'

interface QuoteSummaryProps {
  quote: QuoteResult
  state: QuoteState
  mode: Mode
  lead: LeadDetails | null
  onSubmitLead: (lead: LeadDetails) => void
  onOpenRequestOrder: () => void
}

export default function QuoteSummary({
  quote,
  state,
  mode,
  lead,
  onSubmitLead,
  onOpenRequestOrder,
}: QuoteSummaryProps) {
  const isClient = mode === 'client'
  const isBlurred = isClient && !state.revealed

  const aircraftName = state.aircraft?.name ?? (state.mtow_manual ? `Aircraft (${state.mtow_manual.toLocaleString()} kg)` : 'Select Aircraft')
  const locationLabel = state.location === 'LOS' ? 'Lagos (MMIA)' : 'Abuja (NAIA)'
  const opLabel = state.operation === 'intl' ? 'International' : 'Domestic'
  const stayLabel = state.stay === 'over' ? `Overnight (${state.nights}n)` : 'Same-day'

  return (
    <div className="w-full lg:w-[380px] shrink-0 sticky top-24 space-y-4">
      <div className="relative bg-ean-navy rounded-xl shadow-xl border border-white/10 overflow-hidden">
        {/* LEAD GATE BLUR OVERLAY (CLIENT MODE ONLY UNTIL REVEALED) */}
        {isBlurred && (
          <LeadGate
            onSubmitLead={onSubmitLead}
            quote={quote}
            state={state}
          />
        )}

        {/* HEADER */}
        <div className="p-6 bg-ean-navy-mid border-b border-white/10">
          <div className="flex items-center justify-between text-ean-gold mb-1">
            <span className="text-[11px] font-ui uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              Estimated Quote Summary
            </span>
            {mode === 'staff' && (
              <span className="text-[10px] bg-ean-gold/20 text-ean-gold px-2 py-0.5 rounded font-mono font-semibold">
                Staff Mode
              </span>
            )}
          </div>
          <h2 className="font-display font-bold text-2xl text-white truncate">
            {aircraftName}
          </h2>
          <div className="text-xs font-ui text-ean-muted-light mt-1 flex flex-wrap gap-1.5">
            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">{quote.bandLabel.split('—')[0].trim()}</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">{locationLabel}</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">{opLabel}</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">{stayLabel}</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">{state.pax} pax</span>
          </div>
        </div>

        {/* BODY LINE ITEMS */}
        <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">
          {quote.items.length === 0 ? (
            <div className="text-xs font-ui text-white/50 text-center py-6">
              Select an aircraft to view ground handling estimates.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {quote.items.map((item, idx) => (
                <QuoteLineItem key={`${item.label}-${idx}`} item={item} />
              ))}
            </div>
          )}

          {/* TOTAL ROW */}
          <div className="pt-4 border-t border-ean-gold/30 mt-4">
            <div className="text-[10px] font-ui uppercase tracking-widest text-ean-muted-light">
              Total Estimated Handling Fee
            </div>
            <div className="text-2xl font-mono font-bold text-ean-gold mt-1 tabular-nums">
              {quote.totalDisplay}
            </div>
          </div>

          {/* NOTES BLOCK */}
          <div className="p-3 bg-amber-500/10 rounded border-l-2 border-amber-400 text-[11px] font-ui text-amber-200/90 leading-relaxed space-y-1">
            <div className="flex items-center gap-1 text-amber-300 font-semibold text-[10px] uppercase">
              <Info className="w-3 h-3" /> Note & Disbursement Terms
            </div>
            <p>Fuel at Platts-based pricing on request (15% disbursement fee).</p>
            <p>PSC shown is proposed rate pending CAA committee ratification.</p>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <QuoteActions
        quote={quote}
        state={state}
        mode={mode}
        onOpenRequestOrder={onOpenRequestOrder}
      />
    </div>
  )
}
