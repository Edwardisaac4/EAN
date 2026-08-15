'use client'

import React, { useState, useRef, useEffect } from 'react'
import { LeadDetails, QuoteResult, QuoteState } from '@/types/pricing'
import { getTrackingContext } from '@/lib/lead-tracking'
import { Loader2 } from 'lucide-react'

interface LeadGateProps {
  onSubmitLead: (lead: LeadDetails) => void
  quote?: QuoteResult
  state?: QuoteState
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const LOCATION_LABELS: Record<string, string> = {
  LOS: 'Lagos MMIA',
  ABV: 'Abuja NAIA',
}

const OPERATION_LABELS: Record<string, string> = {
  dom: 'Domestic',
  intl: 'International',
}

export default function LeadGate({ onSubmitLead, quote, state }: LeadGateProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  // The calculator falls back to a Band A default weight when nothing is
  // selected, so a quote always has a total. Without this check we would capture
  // a lead against an aircraft the visitor never chose.
  const hasAircraft = Boolean(state?.aircraft || state?.mtow_manual)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasAircraft) {
      setError('Please select an aircraft or enter its MTOW before revealing pricing.')
      return
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Please enter your name, email, and phone number.')
      return
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const lead: LeadDetails = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: '',
    }

    const aircraftName =
      state?.aircraft?.name ??
      (state?.mtow_manual ? `Unlisted aircraft (${state.mtow_manual.toLocaleString()} kg)` : 'Not specified')
    const locationLabel = LOCATION_LABELS[state?.location ?? 'LOS'] ?? 'Lagos MMIA'
    const operationLabel = OPERATION_LABELS[state?.operation ?? 'dom'] ?? 'Domestic'
    const stayLabel = state?.stay === 'over' ? `${state.nights} night(s)` : 'Same-day turnaround'
    // Never invent a passenger count — sales would plan handling against a
    // number the visitor never entered.
    const paxLabel = typeof state?.pax === 'number' ? `${state.pax} pax` : 'Not specified'

    const inquiryMessage = `Pricing Portal Quote Request:
- Aircraft: ${aircraftName}
- Airport: ${locationLabel} | Operation: ${operationLabel}
- Passengers: ${paxLabel} | Stay: ${stayLabel}
- Estimated Total: ${quote?.totalDisplay ?? 'Not calculated'}`

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: lead.name,
          email: lead.email,
          phone: lead.phone,
          service: 'fbo',
          message: inquiryMessage,
          // Send the real calculated total so the CRM pipeline value reflects
          // this quote instead of a flat per-service estimate.
          estimatedValue: quote?.usdTotal,
          tracking: getTrackingContext('pricing_portal_reveal_gate'),
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.success) {
        setError(data?.error ?? 'Could not submit your details. Please try again.')
        setIsSubmitting(false)
        return
      }

      setIsSubmitting(false)
      onSubmitLead(lead)
    } catch {
      setError('Network error submitting your details. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#F8F3F1] border border-[#E5D7C5] rounded-2xl p-6 text-left shadow-xs space-y-4">
      {/* BADGE PILL */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E5D7C5] rounded-full text-xs font-ui font-semibold text-[#581825] shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-[#581825]" />
        See your price
      </div>

      {/* CARD HEADINGS */}
      <div>
        <h3 className="font-ui font-bold text-base md:text-lg text-[#581825]">
          Enter your details to reveal pricing
        </h3>
        <p className="font-ui text-xs md:text-sm text-ean-muted-dark mt-0.5">
          So our team can follow up and prepare your handling.
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        {error && (
          <div
            role="alert"
            className="text-xs bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-200 font-ui text-center"
          >
            {error}
          </div>
        )}

        {/* INPUT 1: FULL NAME */}
        <div>
          <input
            ref={firstInputRef}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-3 bg-white border border-[#E5D7C5] rounded-xl font-ui text-sm text-[#1A2035] placeholder:text-gray-400 focus:outline-none focus:border-[#581825] focus:ring-1 focus:ring-[#581825] transition-colors"
          />
        </div>

        {/* INPUT 2 & 3: EMAIL AND PHONE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 bg-white border border-[#E5D7C5] rounded-xl font-ui text-sm text-[#1A2035] placeholder:text-gray-400 focus:outline-none focus:border-[#581825] focus:ring-1 focus:ring-[#581825] transition-colors"
          />
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone / WhatsApp"
            className="w-full px-4 py-3 bg-white border border-[#E5D7C5] rounded-xl font-ui text-sm text-[#1A2035] placeholder:text-gray-400 focus:outline-none focus:border-[#581825] focus:ring-1 focus:ring-[#581825] transition-colors"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting || !hasAircraft}
          className="w-full mt-2 py-3.5 px-6 bg-[#581825] hover:bg-[#4A121A] text-white font-ui font-bold text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Unlocking Pricing...
            </>
          ) : (
            'Reveal price'
          )}
        </button>

        {!hasAircraft && (
          <p className="font-ui text-[11px] text-ean-muted-dark text-center">
            Select an aircraft or enter its MTOW above to enable pricing.
          </p>
        )}
      </form>
    </div>
  )
}
