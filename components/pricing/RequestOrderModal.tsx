'use client'

import React, { useState, useEffect, useRef } from 'react'
import { QuoteResult, QuoteState, LeadDetails } from '@/types/pricing'
import { FileText, Copy, Mail, Check, X } from 'lucide-react'

interface RequestOrderModalProps {
  isOpen: boolean
  onClose: () => void
  quote: QuoteResult
  state: QuoteState
  lead: LeadDetails | null
  refCode: string
}

export default function RequestOrderModal({
  isOpen,
  onClose,
  quote,
  state,
  lead,
  refCode,
}: RequestOrderModalProps) {
  const [copied, setCopied] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const aircraftName = state.aircraft?.name ?? (state.mtow_manual ? `Manual Aircraft (${state.mtow_manual.toLocaleString()} kg)` : 'Unspecified Aircraft')
  const locationLabel = state.location === 'LOS' ? 'Lagos (MMIA)' : 'Abuja (NAIA)'
  const opLabel = state.operation === 'intl' ? 'International' : 'Domestic'
  const stayLabel = state.stay === 'over' ? `Overnight (${state.nights} nights)` : 'Same-day turnaround'

  const orderText = `EAN REQUEST ORDER · ${refCode}
--------------------------------
Client: ${lead?.name || 'Staff / Direct Client'}
Email: ${lead?.email || 'N/A'}
Phone: ${lead?.phone || 'N/A'}
Company: ${lead?.company || 'N/A'}
--------------------------------
Aircraft: ${aircraftName}
Location: ${locationLabel}
Operation: ${opLabel}
Movement: Arrival + departure (${stayLabel})
Passengers: ${state.pax} (estimated — CRO confirms on arrival)
--------------------------------
Requested services:

${quote.items.map(i => `- ${i.label}${i.sub ? ` (${i.sub})` : ''}${i.pending ? ' — quoted on request' : ''}`).join('\n')}
--------------------------------
Estimated total: ${quote.totalDisplay}
--------------------------------
Status: NEW — route to Operations (ABO One / RPS)
Fuel at Platts-based pricing on request. Final passenger count is confirmed by
the CRO on arrival, which sets the invoice.`

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(orderText)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }
    } catch (err) {
      console.error('Failed to copy order text:', err)
    }
  }

  const handleEmailOps = () => {
    const subject = encodeURIComponent(`EAN Request Order — ${refCode} (${aircraftName})`)
    const body = encodeURIComponent(orderText)
    window.location.href = `mailto:ops@ean.aero?subject=${subject}&body=${body}`
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-order-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-ean-navy border border-ean-gold/40 w-full max-w-lg overflow-hidden text-ean-text-light flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ean-border-dark flex items-center justify-between bg-ean-navy-mid">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-ean-gold" />
            <h3 id="request-order-title" className="font-display font-medium text-lg text-ean-text-light tracking-wide">
              EAN Formal Request Order
            </h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="text-ean-muted-light hover:text-ean-text-light transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed space-y-4 bg-ean-navy text-ean-text-light">
          <div className="p-4 bg-black/5 border border-ean-gold/30 whitespace-pre-wrap selection:bg-ean-gold selection:text-black">
            {orderText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-ean-border-dark bg-ean-navy-mid flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 bg-ean-navy border border-ean-border-dark hover:border-ean-blue hover:text-ean-blue-light text-ean-text-light font-ui font-medium text-xs transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-ean-gold" />}
            {copied ? 'Copied ✓' : 'Copy Order'}
          </button>

          <button
            type="button"
            onClick={handleEmailOps}
            className="flex-1 py-2.5 px-4 bg-ean-gold hover:bg-ean-gold-light text-ean-text-dark font-ui font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Send via Email
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-transparent text-ean-muted-light hover:text-ean-text-light font-ui text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
