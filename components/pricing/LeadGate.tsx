'use client'

import React, { useState, useRef, useEffect } from 'react'
import { LeadDetails, QuoteResult, QuoteState } from '@/types/pricing'
import { getAllLeadsFromStore, addLeadToStore, generateNextLeadId } from '@/lib/leads-store'
import { Lead } from '@/lib/admin-leads-data'
import { getTrackingContext } from '@/lib/lead-tracking'
import { Loader2 } from 'lucide-react'

interface LeadGateProps {
  onSubmitLead: (lead: LeadDetails) => void
  quote?: QuoteResult
  state?: QuoteState
}

export default function LeadGate({ onSubmitLead, quote, state }: LeadGateProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Please enter your name, email, and phone number.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const lead: LeadDetails = { name, email, phone, company }

    const aircraftName = state?.aircraft?.name ?? (state?.mtow_manual ? `Aircraft (${state.mtow_manual}kg)` : 'Embraer Legacy 650')
    const locationLabel = state?.location === 'LOS' ? 'Lagos MMIA' : 'Abuja NAIA'
    const totalDisplay = quote?.totalDisplay ? `Estimated Total: ${quote.totalDisplay}` : ''

    const inquiryMessage = `Pricing Portal Quote Request:
- Aircraft: ${aircraftName}
- Airport: ${locationLabel} | Operation: ${state?.operation || 'domestic'}
- Passengers: ${state?.pax ?? 4} pax | Stay: ${state?.stay === 'over' ? `${state.nights} nights` : 'Same-day'}
- ${totalDisplay}`

    const trackingData = getTrackingContext('pricing_portal_reveal_gate')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          email,
          phone,
          company,
          service: 'fbo',
          message: inquiryMessage,
          tracking: trackingData,
        }),
      })

      if (!res.ok) {
        console.error('Lead submission failed with status:', res.status)
        setError('Could not submit lead details. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Add to local admin lead store for real-time dashboard visibility
      try {
        const existing = getAllLeadsFromStore()
        const nextId = generateNextLeadId(existing)
        const newLeadObj: Lead = {
          id: nextId,
          fullName: name,
          email,
          phone,
          company: company || 'N/A',
          service: 'fbo',
          message: inquiryMessage,
          status: 'new',
          priority: 'high',
          estimatedValue: quote?.usdTotal ?? 15000,
          source: 'Pricing Portal Reveal Gate',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: [],
          activities: [
            {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              author: 'System (Pricing Portal)',
              action: 'Lead revealed quote estimate and requested order options',
            },
          ],
          tracking: trackingData,
        }
        addLeadToStore(newLeadObj)
      } catch (storeErr) {
        console.warn('Could not sync to local lead store:', storeErr)
      }

      setIsSubmitting(false)
      onSubmitLead(lead)
    } catch (err) {
      console.error('Lead submission network exception:', err)
      setError('Network error submitting lead. Please try again.')
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
        <h3 className="font-display font-bold text-xl md:text-2xl text-[#581825]">
          Enter your details to reveal pricing
        </h3>
        <p className="font-ui text-xs md:text-sm text-ean-muted-dark mt-1">
          So our team can follow up and prepare your handling.
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        {error && (
          <div className="text-xs bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-200 font-ui text-center">
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
          disabled={isSubmitting}
          className="w-full mt-2 py-3.5 px-6 bg-[#581825] hover:bg-[#4A121A] text-white font-ui font-bold text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
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
      </form>
    </div>
  )
}
