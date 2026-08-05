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
  const rawMtow = state.aircraft?.mtow_kg ?? state.mtow_manual
  const isWeightMissing = rawMtow === null || rawMtow === undefined || rawMtow <= 0
  const mtow = isWeightMissing ? 5700 : rawMtow
  const band = getBand(mtow)

  const nights = Math.max(0, state.nights ?? 0)
  const pax = Math.max(0, state.pax ?? 0)

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
      sub:   isWeightMissing
        ? 'per turnaround · pending MTOW confirmation'
        : `per turnaround · ${state.handling === 'min' ? 'floor rate' : 'standard'}`,
      value,
      currency: 'USD',
      provisional: isWeightMissing,
    })
  } else {
    items.push({
      label: 'Ground handling (Abuja)',
      sub: isWeightMissing ? 'per turnaround · pending MTOW confirmation' : 'per turnaround',
      value: HANDLING_ABV,
      currency: 'USD',
      provisional: isWeightMissing,
    })
  }

  // International terminal fee
  if (state.operation === 'intl') {
    items.push({ label: 'International terminal / VIP fee', value: TERMINAL_INTL_USD, currency: 'USD' })
  }

  // Statutory CIQ fee (if international and not explicitly selected in add-ons)
  if (state.operation === 'intl' && !state.addons?.ciq) {
    items.push({ label: 'CIQ (customs / immigration / quarantine)', value: CIQ_USD, currency: 'USD' })
  }

  // Overnight parking
  if (state.stay === 'over' && nights > 0) {
    items.push({
      label: 'Overnight parking',
      sub:   `${nights} night${nights > 1 ? 's' : ''}`,
      value: PARKING_PER_NIGHT_USD * nights,
      currency: 'USD',
    })
  }

  // Add-on services
  if (state.addons) {
    ADDONS.forEach((addon) => {
      if (!state.addons[addon.id]) return
      items.push({ label: addon.label, value: addon.value, currency: 'USD' })
    })
  }

  // Passenger service charge — international
  if (pax > 0 && state.operation === 'intl') {
    items.push({
      label:       'Passenger service charge (intl)',
      sub:         `${pax} pax × $${PSC.intl_usd} · proposed`,
      value:       PSC.intl_usd * pax,
      currency:    'USD',
      provisional: true,
    })
  }

  // NGN items — domestic only
  if (state.operation === 'dom') {
    ngnItems.push({ label: 'VIP lounge (local operators)', value: VIP_LOCAL_NGN, currency: 'NGN' })
    if (pax > 0) {
      ngnItems.push({
        label: 'Passenger service charge (local)',
        sub:   `${pax} pax × ₦${PSC.dom_ngn.toLocaleString()} · proposed`,
        value: PSC.dom_ngn * pax,
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
