'use client'

import React, { useState, useEffect, useRef } from 'react'
import { LeadDetails, QuoteResult, QuoteState } from '@/types/pricing'
import { Lock, Sparkles, User, Mail, Phone, Building2, Loader2 } from 'lucide-react'

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
      setError('Please fill in your name, email, and phone number.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const lead: LeadDetails = { name, email, phone, company }

    const aircraftName = state?.aircraft?.name ?? (state?.mtow_manual ? `Aircraft (${state.mtow_manual}kg)` : 'Unspecified Aircraft')
    const locationLabel = state?.location === 'LOS' ? 'Lagos MMIA' : 'Abuja NAIA'
    const totalDisplay = quote?.totalDisplay ? `Estimated Total: ${quote.totalDisplay}` : ''

    const inquiryMessage = `Pricing Portal Quote Request:
- Aircraft: ${aircraftName}
- Airport: ${locationLabel} | Operation: ${state?.operation || 'domestic'}
- Passengers: ${state?.pax ?? 4} pax | Movement: ${state?.stay === 'over' ? `${state.nights} nights overnight` : 'Same-day turnaround'}
- ${totalDisplay}`

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
          tracking: {
            formPage: '/pricing',
            formId: 'pricing_portal_gate',
            capturedAt: new Date().toISOString(),
          },
        }),
      })

      if (!res.ok) {
        console.error('Lead submission failed with status:', res.status)
        setError('Could not submit lead details. Please try again.')
        setIsSubmitting(false)
        return
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-gate-title"
      className="absolute inset-0 z-20 backdrop-blur-md bg-ean-navy/85 rounded-xl flex flex-col justify-center items-center p-6 text-center text-white border border-ean-gold/40 shadow-2xl animate-in fade-in duration-300"
    >
      <div className="w-12 h-12 rounded-full bg-ean-gold/20 flex items-center justify-center text-ean-gold mb-3 border border-ean-gold/40 shadow-inner">
        <Lock className="w-6 h-6 text-ean-gold" />
      </div>

      <h4 id="lead-gate-title" className="font-display font-bold text-xl text-white mb-1">
        See Your Full Estimate
      </h4>
      <p className="text-xs font-ui text-ean-muted-light max-w-xs mb-5 leading-relaxed">
        Enter your details to unlock the itemized pricing breakdown and formal request order generator.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3 text-left">
        {error && (
          <div className="text-xs bg-red-500/20 text-red-300 p-2 rounded text-center border border-red-500/30 font-ui">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="lead-name" className="block text-[11px] font-ui text-ean-muted-light mb-1 font-medium">
            Full Name *
          </label>
          <div className="relative">
            <input
              id="lead-name"
              ref={firstInputRef}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Captain James Okafor"
              className="w-full pl-9 pr-3 py-2 bg-ean-navy-mid border border-white/20 rounded text-xs font-ui text-white focus:outline-none focus:border-ean-gold"
            />
            <User className="w-3.5 h-3.5 text-ean-muted-light absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label htmlFor="lead-email" className="block text-[11px] font-ui text-ean-muted-light mb-1 font-medium">
            Email Address *
          </label>
          <div className="relative">
            <input
              id="lead-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ops@company.com"
              className="w-full pl-9 pr-3 py-2 bg-ean-navy-mid border border-white/20 rounded text-xs font-ui text-white focus:outline-none focus:border-ean-gold"
            />
            <Mail className="w-3.5 h-3.5 text-ean-muted-light absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="lead-phone" className="block text-[11px] font-ui text-ean-muted-light mb-1 font-medium">
              Phone Number *
            </label>
            <div className="relative">
              <input
                id="lead-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 810 000 0000"
                className="w-full pl-9 pr-3 py-2 bg-ean-navy-mid border border-white/20 rounded text-xs font-ui text-white focus:outline-none focus:border-ean-gold"
              />
              <Phone className="w-3.5 h-3.5 text-ean-muted-light absolute left-3 top-2.5" />
            </div>
          </div>
          <div>
            <label htmlFor="lead-company" className="block text-[11px] font-ui text-ean-muted-light mb-1 font-medium">
              Company / Operator
            </label>
            <div className="relative">
              <input
                id="lead-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="ExecuJet / Private"
                className="w-full pl-9 pr-3 py-2 bg-ean-navy-mid border border-white/20 rounded text-xs font-ui text-white focus:outline-none focus:border-ean-gold"
              />
              <Building2 className="w-3.5 h-3.5 text-ean-muted-light absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 px-4 bg-ean-gold hover:bg-ean-gold-light text-white font-ui font-semibold text-xs tracking-wider uppercase rounded transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Saving Lead & Unlocking...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Reveal Pricing Breakdown
            </>
          )}
        </button>
      </form>
    </div>
  )
}
