import { QuoteState, QuoteResult, QuoteLineItem } from '@/types/pricing'
import {
  getBand,
  BANDS,
  HANDLING_LOS,
  HANDLING_ABV,
  CIQ_USD,
  PARKING_PER_NIGHT_USD,
  ADDONS,
  addonRate,
} from './bands'

export function buildQuote(state: QuoteState): QuoteResult {
  const rawMtow = state.aircraft?.mtow_kg ?? state.mtow_manual
  const isWeightMissing = rawMtow === null || rawMtow === undefined || rawMtow <= 0
  const mtow = isWeightMissing ? 5700 : rawMtow
  const band = getBand(mtow)

  const nights = Math.max(0, state.nights ?? 0)
  // The passenger field accepts 0, so a per-head charge must be able to total
  // zero rather than being floored at one passenger nobody declared.
  const pax = Math.max(0, Math.floor(state.pax ?? 0))

  const items: QuoteLineItem[] = []

  // Ground handling
  const handlingRate = HANDLING_LOS[band]
  if (state.location === 'LOS') {
    const value = state.handling === 'min' ? handlingRate.min : handlingRate.standard
    // Bands A and B are published as a single figure, so the floor/standard
    // toggle has nothing to move between — say so rather than labelling an
    // identical number two different ways.
    const isBanded = handlingRate.min !== handlingRate.standard
    items.push({
      label: 'Handling fee',
      sub:   isWeightMissing
        ? 'per turnaround · pending MTOW confirmation'
        : isBanded
          ? `per turnaround · ${state.handling === 'min' ? 'floor rate' : 'standard rate'}`
          : 'per turnaround · published rate',
      value,
      currency: 'USD',
      provisional: isWeightMissing,
    })
  } else {
    items.push({
      label: 'Abuja handling',
      sub: isWeightMissing ? 'per turnaround · pending MTOW confirmation' : 'per turnaround',
      value: HANDLING_ABV,
      currency: 'USD',
      provisional: isWeightMissing,
    })
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
      // An international-only service cannot ride on a domestic turnaround.
      // The grid hides it, but the flag can survive a switch back to domestic,
      // so the total refuses it here rather than trusting the UI.
      if (addon.intlOnly && state.operation !== 'intl') return
      const rate = addonRate(addon, band)
      // An on-request item has no published figure, so it rides on the quote as
      // TBD rather than silently totalling as zero.
      if (rate === null) {
        items.push({ label: addon.label, sub: addon.note, value: 0, currency: 'USD', pending: true })
        return
      }
      // A per-passenger service is published as a unit rate; the head count on
      // the quote turns it into a line. The multiplier is spelled out in `sub`
      // so the figure is checkable against the rate sheet.
      if (addon.per === 'pax') {
        items.push({
          label: addon.label,
          sub:   `${pax} passenger${pax === 1 ? '' : 's'} × $${rate.toLocaleString()}`,
          value: rate * pax,
          currency: 'USD',
        })
        return
      }
      items.push({
        label: addon.label,
        sub:   addon.per === 'band' ? BANDS[band].range : undefined,
        value: rate,
        currency: 'USD',
      })
    })
  }

  // Nothing is billed in naira. PSC rides as a flat add-on rather than a
  // per-head charge, so the pax count is still carried on the quote for the
  // CRO's planning and multiplies nothing.
  const usdTotal = items.reduce((sum, i) => sum + (i.pending ? 0 : i.value ?? 0), 0)

  return {
    band,
    bandLabel: BANDS[band].label,
    items,
    usdTotal,
    totalDisplay: `USD ${usdTotal.toLocaleString()}`,
  }
}
