'use client'

import React from 'react'
import { QuoteResult, QuoteState, LeadDetails } from '@/types/pricing'
import { BANDS } from '@/lib/pricing/bands'
import QuoteLineItem from './QuoteLineItem'
import QuoteActions from './QuoteActions'
import LeadGate from './LeadGate'

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
  const isLocked = !state.revealed

  // The calculator falls back to a Band A default weight when nothing is
  // chosen, so `quote.band` is always populated. Naming a specific aircraft and
  // weight range off the back of that default told the visitor they were
  // pricing an Embraer Legacy 650 they never selected.
  const hasAircraft = Boolean(state.aircraft || state.mtow_manual)

  const aircraftName = state.aircraft?.name
    ?? (state.mtow_manual ? `Aircraft (${state.mtow_manual.toLocaleString()} kg)` : 'No aircraft selected')

  const bandRangeText = hasAircraft ? (BANDS[quote.band]?.range ?? '') : ''
  const locationLabel = state.location === 'LOS' ? 'Lagos' : 'Abuja'
  const opLabel = state.operation === 'intl' ? 'International' : 'Domestic'
  const stayLabel = state.stay === 'over'
    ? `${state.nights}-night stay`
    : 'same-day turnaround'

  return (
    <div className="w-full lg:w-100 shrink-0 lg:sticky lg:top-32 space-y-4">
      <div className="bg-white shadow-sm border border-ean-border-light overflow-hidden">
        {/* QUOTE HEADER — the brand blue band, AGENTS.md §5. Literal white type
            is wrong here; `ean-text-dark` is the token whose job is "type on the
            blue fill". The configuration is never gated: what the visitor built
            stays legible, only the money is withheld. */}
        <div className="p-5 md:p-6 bg-ean-gold text-ean-text-dark space-y-0.5">
          <h2 className="font-display font-medium text-xl md:text-2xl text-ean-text-dark tracking-wide truncate">
            {aircraftName}
          </h2>
          <div className="text-xs font-ui text-ean-muted-dark">
            {[bandRangeText, locationLabel, opLabel].filter(Boolean).join(' · ')}
          </div>
          <div className="text-[11.5px] font-ui text-ean-muted-dark pt-1">
            {stayLabel} · {state.pax} pax{state.day === 'we' ? ' · weekend' : ''}
          </div>
        </div>

        {/* A one-cell grid, not a positioning context. The gate and the quote
            are stacked in the same cell, so the container sizes to whichever is
            taller. `absolute inset-0` sized the gate to the quote behind it
            instead, and the quote is short on first load — one line of
            placeholder, the masked total, the note — so the form was clipped by
            the card's `overflow-hidden` before the visitor could fill it in. */}
        <div className="grid p-5 md:p-6">
          {/* THE QUOTE. Blurred and inert while locked — `pointer-events-none`
              is what stops a gated visitor tabbing into what is behind the
              overlay. The total is not merely blurred, it is not rendered at
              all until reveal: a 6px blur is a picture of a number, and the
              real one would still be sitting in the DOM for anyone who opens
              devtools. */}
          <div
            className={`col-start-1 row-start-1 ${
              isLocked
                ? 'blur-[6px] pointer-events-none select-none'
                : 'animate-fadeIn'
            }`}
            aria-hidden={isLocked}
          >
            {!hasAircraft ? (
              <div className="text-xs font-ui text-ean-muted-light text-center py-6">
                Select an aircraft to build your turnaround.
              </div>
            ) : (
              <div>
                {quote.items.map((item, idx) => (
                  <QuoteLineItem key={`${item.label}-${idx}`} item={item} />
                ))}
              </div>
            )}

            {/* ESTIMATED TOTAL */}
            <div className="flex items-baseline justify-between gap-4 pt-4 mt-1">
              <span className="font-display font-semibold text-sm uppercase tracking-widest text-ean-gold">
                Estimated total
              </span>
              <span className="font-display font-bold text-2xl md:text-[27px] text-ean-gold tabular-nums">
                {isLocked ? 'USD ————' : quote.totalDisplay}
              </span>
            </div>

            {/* NOTE */}
            <div className="bg-ean-surface border-l-3 border-ean-gold p-3 mt-4 space-y-1">
              <p className="font-ui text-[11.5px] text-ean-text-light leading-relaxed">
                Fuel is quoted at Platts-based location pricing on request, and a disbursement
                fee applies to any payment EAN makes on your behalf.
              </p>
              <p className="font-ui text-[11.5px] text-ean-text-light leading-relaxed">
                Final passenger count is confirmed by the CRO on arrival.
              </p>
            </div>
          </div>

          {/* THE GATE — an overlay sitting on the blurred quote, not a card
              stacked above it. Rendered last so it paints over the blur, and
              outside the blurred wrapper so the form itself stays sharp. */}
          {isLocked && (
            <div className="col-start-1 row-start-1 z-10 flex items-start justify-center p-3 md:p-4 bg-white/55">
              <LeadGate onSubmitLead={onSubmitLead} quote={quote} state={state} />
            </div>
          )}
        </div>
      </div>

      {/* Everything that acts on a priced quote comes back once the gate is
          cleared: copy for WhatsApp, copy as a formal email, and the request
          order. None of it exists while the visitor is gated. */}
      {!isLocked && (
        <QuoteActions
          quote={quote}
          state={state}
          onOpenRequestOrder={onOpenRequestOrder}
        />
      )}
    </div>
  )
}
