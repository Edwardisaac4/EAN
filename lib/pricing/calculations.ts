import { QuoteState, QuoteResult, QuoteLineItem } from '@/types/pricing'
import {
  getBand,
  BANDS,
  HANDLING_LOS,
  HANDLING_ABV,
  TERMINAL_INTL_USD,
  CIQ_USD,
  PARKING_PER_NIGHT_USD,
  PSC,
  VIP_LOCAL_NGN,
  ADDONS,
} from './bands'

export function buildQuote(state: QuoteState): QuoteResult {
  const mtow    = state.aircraft?.mtow_kg ?? state.mtow_manual ?? 0
  const band    = getBand(mtow)

  const items:    QuoteLineItem[] = []
  const ngnItems: QuoteLineItem[] = []

  // Ground handling
  const handlingRate = HANDLING_LOS[band]
  if (state.location === 'LOS') {
    const value = typeof handlingRate === 'object'
      ? (state.handling === 'min' ? handlingRate.min : handlingRate.standard)
      : handlingRate
    items.push({
      label: 'Ground handling',
      sub:   `per turnaround · ${state.handling === 'min' ? 'floor rate' : 'standard'}`,
      value,
      currency: 'USD',
    })
  } else {
    items.push({ label: 'Ground handling (Abuja)', sub: 'per turnaround', value: HANDLING_ABV, currency: 'USD' })
  }

  // International terminal fee
  if (state.operation === 'intl') {
    items.push({ label: 'International terminal / VIP fee', value: TERMINAL_INTL_USD, currency: 'USD' })
  }

  // CIQ
  if (state.addons.ciq || state.operation === 'intl') {
    items.push({ label: 'CIQ (customs / immigration / quarantine)', value: CIQ_USD, currency: 'USD' })
  }

  // Overnight parking
  if (state.stay === 'over') {
    items.push({
      label: 'Overnight parking',
      sub:   `${state.nights} night${state.nights > 1 ? 's' : ''}`,
      value: PARKING_PER_NIGHT_USD * state.nights,
      currency: 'USD',
    })
  }

  // Add-on services
  ADDONS.forEach((addon) => {
    if (!state.addons[addon.id]) return
    const value = addon.per === 'flat'
      ? addon.value
      : addon.values[band]
    items.push({ label: addon.label, value, currency: 'USD' })
  })

  // Passenger service charge — international
  if (state.pax > 0 && state.operation === 'intl') {
    items.push({
      label:       'Passenger service charge (intl)',
      sub:         `${state.pax} pax × $${PSC.intl_usd} · proposed`,
      value:       PSC.intl_usd * state.pax,
      currency:    'USD',
      provisional: true,
    })
  }

  // NGN items — domestic only
  if (state.operation === 'dom') {
    ngnItems.push({ label: 'VIP lounge (local operators)', value: VIP_LOCAL_NGN, currency: 'NGN' })
    if (state.pax > 0) {
      ngnItems.push({
        label: 'Passenger service charge (local)',
        sub:   `${state.pax} pax × ₦${PSC.dom_ngn.toLocaleString()} · proposed`,
        value: PSC.dom_ngn * state.pax,
        currency: 'NGN',
        provisional: true,
      })
    }
  }

  const allItems = [...items, ...ngnItems]

  const usdTotal = items.reduce((sum, i) => sum + (i.value ?? 0), 0)
  const ngnTotal = ngnItems.reduce((sum, i) => sum + i.value, 0)

  const totalDisplay = ngnTotal > 0
    ? `USD ${usdTotal.toLocaleString()} + ₦${ngnTotal.toLocaleString()}`
    : `USD ${usdTotal.toLocaleString()}`

  return { band, bandLabel: BANDS[band].label, items: allItems, usdTotal, ngnTotal, totalDisplay }
}
