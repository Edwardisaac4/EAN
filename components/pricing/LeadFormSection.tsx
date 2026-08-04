'use client'

import React, { useState } from 'react'
import { QuoteResult, QuoteState, LeadDetails } from '@/types/pricing'
import { User, Mail, Phone, Building2, Send, CheckCircle2, Loader2, FileText } from 'lucide-react'

interface LeadFormSectionProps {
  quote: QuoteResult
  state: QuoteState
  onLeadSubmitted?: (lead: LeadDetails) => void
}

export default function LeadFormSection({
  quote,
  state,
  onLeadSubmitted,
}: LeadFormSectionProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please provide your full name and email address.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    const aircraftName = state.aircraft?.name ?? (state.mtow_manual ? `Aircraft (${state.mtow_manual}kg)` : 'Unspecified Aircraft')
    const locationLabel = state.location === 'LOS' ? 'Lagos MMIA' : 'Abuja NAIA'

    const leadPayload = {
      fullName: name,
      email,
      phone,
      company,
      service: 'fbo',
      message: `ESTIMATED QUOTE INQUIRY: ${quote.totalDisplay}
Aircraft: ${aircraftName}
Airport: ${locationLabel} | Operation: ${state.operation} | Pax: ${state.pax}
Additional Notes: ${notes || 'None'}`,
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
      })

      if (res.ok) {
        setIsSubmitted(true)
        if (onLeadSubmitted) {
          onLeadSubmitted({ name, email, phone, company })
        }
      } else {
        const data = await res.json()
        setErrorMessage(data.error || 'Failed to send inquiry to database. Please try again.')
      }
    } catch (err) {
      console.error('Lead submission error:', err)
      setErrorMessage('Network error submitting quote request to server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-ean-border-light space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-ean-border-light">
        <h3 className="font-display font-semibold text-xl text-ean-navy flex items-center gap-2">
          <Send className="w-5 h-5 text-ean-gold" />
          Submit Quote Inquiry to Operations
        </h3>
        <span className="text-xs font-ui uppercase tracking-wider text-ean-gold bg-ean-gold/10 px-2.5 py-1 rounded-full font-semibold">
          Direct API Routing
        </span>
      </div>

      {isSubmitted ? (
        <div className="p-6 bg-green-50 rounded-lg border border-green-200 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-display font-bold text-lg text-green-900">
            Quote Inquiry Received!
          </h4>
          <p className="text-xs font-ui text-green-700 max-w-md mx-auto">
            Your formal quote request has been routed directly to our Flight Operations database. An EAN CRO specialist will contact you shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="text-xs font-ui bg-red-50 text-red-600 p-3 rounded-lg border border-red-200">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="form-lead-name" className="block text-xs font-ui font-medium text-ean-navy mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  id="form-lead-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Capt. Joseph Mensah"
                  className="w-full pl-9 pr-3 py-2.5 bg-ean-surface border border-ean-border-light rounded-lg text-xs font-ui text-ean-navy focus:outline-none focus:border-ean-gold"
                />
                <User className="w-4 h-4 text-ean-muted-dark absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label htmlFor="form-lead-email" className="block text-xs font-ui font-medium text-ean-navy mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  id="form-lead-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ops@operator.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-ean-surface border border-ean-border-light rounded-lg text-xs font-ui text-ean-navy focus:outline-none focus:border-ean-gold"
                />
                <Mail className="w-4 h-4 text-ean-muted-dark absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label htmlFor="form-lead-phone" className="block text-xs font-ui font-medium text-ean-navy mb-1">
                Phone / WhatsApp Number
              </label>
              <div className="relative">
                <input
                  id="form-lead-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 810 000 0000"
                  className="w-full pl-9 pr-3 py-2.5 bg-ean-surface border border-ean-border-light rounded-lg text-xs font-ui text-ean-navy focus:outline-none focus:border-ean-gold"
                />
                <Phone className="w-4 h-4 text-ean-muted-dark absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label htmlFor="form-lead-company" className="block text-xs font-ui font-medium text-ean-navy mb-1">
                Operator / Company Name
              </label>
              <div className="relative">
                <input
                  id="form-lead-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. VistaJet / Private Owner"
                  className="w-full pl-9 pr-3 py-2.5 bg-ean-surface border border-ean-border-light rounded-lg text-xs font-ui text-ean-navy focus:outline-none focus:border-ean-gold"
                />
                <Building2 className="w-4 h-4 text-ean-muted-dark absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="form-lead-notes" className="block text-xs font-ui font-medium text-ean-navy mb-1">
              Flight Operations / Handling Requirements Notes
            </label>
            <textarea
              id="form-lead-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add specific details e.g. estimated arrival time, fueling volume, VIP catering requests..."
              className="w-full p-3 bg-ean-surface border border-ean-border-light rounded-lg text-xs font-ui text-ean-navy focus:outline-none focus:border-ean-gold"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-ean-gold hover:bg-ean-gold-light text-white font-ui font-bold text-xs tracking-wider uppercase rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Lead to Database...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Lead & Save Quote to Database
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
