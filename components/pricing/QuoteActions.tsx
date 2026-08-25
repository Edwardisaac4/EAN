'use client'

import React, { useState } from 'react'
import { QuoteResult, QuoteState } from '@/types/pricing'
import { MessageSquare, Mail, FileCheck, Check } from 'lucide-react'

interface QuoteActionsProps {
  quote: QuoteResult
  state: QuoteState
  onOpenRequestOrder: () => void
}

export default function QuoteActions({
  quote,
  state,
  onOpenRequestOrder,
}: QuoteActionsProps) {
  const [waCopied, setWaCopied] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  // A clipboard rejection (or a browser without the API) previously left the
  // button unchanged, so the quote text was never on the clipboard and nothing
  // said so.
  const [copyError, setCopyError] = useState('')

  const writeToClipboard = async (text: string, onSuccess: () => void) => {
    setCopyError('')

    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setCopyError('Copying is not supported in this browser — select the quote text manually.')
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      onSuccess()
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      setCopyError('Could not copy the quote. Please try again or copy it manually.')
    }
  }

  const aircraftName = state.aircraft?.name ?? (state.mtow_manual ? `Aircraft (${state.mtow_manual.toLocaleString()} kg)` : 'Unspecified Aircraft')
  const locationLabel = state.location === 'LOS' ? 'Lagos (MMIA)' : 'Abuja (NAIA)'
  const opLabel = state.operation === 'intl' ? 'International' : 'Domestic'
  const stayLabel = state.stay === 'over' ? `Overnight (${state.nights} nights)` : 'Same-day'

  const handleCopyWhatsApp = async () => {
    const waText = `✈️ EAN Aviation — FBO Handling Quote
Aircraft: ${aircraftName}
${locationLabel} · ${opLabel} · ${stayLabel}

${quote.items.map(i => `${i.label}: ${i.currency === 'USD' ? 'USD ' : '₦'}${i.value.toLocaleString()}`).join('\n')}

TOTAL: ${quote.totalDisplay}

Fuel at Platts pricing on request. PSC subject to CAA ratification.`

    await writeToClipboard(waText, () => {
      setWaCopied(true)
      setTimeout(() => setWaCopied(false), 1500)
    })
  }

  const handleCopyEmail = async () => {
    const emailSubject = `EAN Aviation — Handling quote, ${aircraftName}`
    const emailBody = `Dear Operations Team,

Please find below the estimated ground handling cost summary for ${aircraftName}:

Flight Details:
- Aircraft: ${aircraftName}
- Airport: ${locationLabel}
- Operation: ${opLabel}
- Stay: ${stayLabel}
- Pax Count: ${state.pax}

Itemized Charges:
${quote.items.map(i => `- ${i.label}${i.sub ? ` (${i.sub})` : ''}: ${i.currency === 'USD' ? 'USD ' : '₦'}${i.value.toLocaleString()}`).join('\n')}

ESTIMATED TOTAL: ${quote.totalDisplay}

Payment Terms: Credit card, bank transfer, or cash prior to departure.
Fuel: Available on request at Platts-based pricing (15% disbursement fee).

Best regards,
EAN Aviation Flight Support
ops@ean.aero | +234 1 291 1000`

    const fullContent = `Subject: ${emailSubject}\n\n${emailBody}`
    await writeToClipboard(fullContent, () => {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 1500)
    })
  }

  return (
    <div className="space-y-2.5 mt-4">
      {copyError && (
        <p role="alert" className="text-xs font-ui text-red-300">
          {copyError}
        </p>
      )}

      {/* BUTTON 1 — Copy for WhatsApp */}
      <button
        type="button"
        onClick={handleCopyWhatsApp}
        className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-ui font-semibold text-xs tracking-wide rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
      >
        {waCopied ? <Check className="w-4 h-4 text-white" /> : <MessageSquare className="w-4 h-4 fill-white text-[#25D366]" />}
        {waCopied ? 'Copied to WhatsApp ✓' : 'Copy Quote for WhatsApp'}
      </button>

      {/* BUTTON 2 — Copy as Email */}
      <button
        type="button"
        onClick={handleCopyEmail}
        className="w-full py-3 px-4 bg-ean-navy border border-white/20 hover:border-ean-gold text-white font-ui font-semibold text-xs tracking-wide rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
      >
        {emailCopied ? <Check className="w-4 h-4 text-green-400" /> : <Mail className="w-4 h-4 text-ean-gold" />}
        {emailCopied ? 'Email Copied ✓' : 'Copy Quote as Formal Email'}
      </button>

      {/* BUTTON 3 — Generate Request Order (revealed leads) */}
      {state.revealed && (
        <button
          type="button"
          onClick={onOpenRequestOrder}
          className="w-full py-3 px-4 bg-ean-gold hover:bg-ean-gold-light text-[#581825] font-ui font-bold text-xs tracking-wider uppercase rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <FileCheck className="w-4 h-4 text-[#581825]" />
          Generate Request Order
        </button>
      )}
    </div>
  )
}
