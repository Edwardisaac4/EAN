import type { MtowBand } from '@/types/pricing'
import { BANDS, getBand } from './bands'
import {
  SCHEDULE_CONTACT,
  SCHEDULE_SECTIONS,
  SCHEDULE_TERMS,
  figureForBand,
  formatFigure,
  isBandPriced,
  type ScheduleFigure,
  type ScheduleItem,
  type ScheduleSection,
} from './rate-schedule'

// =============================================================================
// Quote builder — the arithmetic behind /pricing
// =============================================================================
// Pure functions over the published schedule. The page, the PDF and the
// copy-as-email text all read the quote through here, so the three cannot price
// the same selection differently.

/** A visitor quoting a fleet adds each aircraft as its own tab. */
export const MAX_AIRCRAFT = 6

/** The manual MTOW field accepts anything a business aircraft could weigh. */
export const MTOW_MIN_KG = 1000
export const MTOW_MAX_KG = 600000

export const MAX_QUANTITY = 99

/** A type chosen in the picker, from /api/aircraft/search. */
export interface PickedAircraft {
  id: string
  /** "Gulfstream G650". */
  name: string
  /** "G650" — the fleet tab's short label. */
  model: string
  manufacturer: string
  icao: string | null
  mtowKg: number
}

export interface QuoteAircraft {
  /** Stable React key — survives reordering when a tab is removed. */
  id: number
  mode: 'list' | 'manual'
  /** The type chosen from the list. Kept when switching to manual, to prefill it. */
  jet: PickedAircraft | null
  /** The manual MTOW field as typed, kept as text so a half-typed value survives. */
  mtowInput: string
  /** Schedule item id → quantity, for every ticked service. */
  selected: Record<string, number>
}

export function newAircraft(id: number): QuoteAircraft {
  return { id, mode: 'list', jet: null, mtowInput: '', selected: {} }
}

/**
 * The schedule's sections in quote order. Based-aircraft monthly handling leads:
 * an operator basing a jet at EAN starts there, and on the page it is the one
 * full-width card above the per-movement services.
 */
export const QUOTE_SECTIONS: readonly ScheduleSection[] = [
  ...SCHEDULE_SECTIONS.filter((section) => section.id === 'monthly'),
  ...SCHEDULE_SECTIONS.filter((section) => section.id !== 'monthly'),
]

// ---------------------------------------------------------------------------
// One aircraft
// ---------------------------------------------------------------------------

export function jetOf(aircraft: QuoteAircraft): PickedAircraft | null {
  return aircraft.mode === 'list' ? aircraft.jet : null
}

/** The aircraft's MTOW in kg, or 0 while it has none (or an out-of-range one). */
export function mtowOf(aircraft: QuoteAircraft): number {
  if (aircraft.mode === 'list') return jetOf(aircraft)?.mtowKg ?? 0
  const kg = Math.round(Number(aircraft.mtowInput))
  return kg >= MTOW_MIN_KG && kg <= MTOW_MAX_KG ? kg : 0
}

export function bandOf(aircraft: QuoteAircraft): MtowBand | null {
  const kg = mtowOf(aircraft)
  return kg ? getBand(kg) : null
}

export function selectedCount(aircraft: QuoteAircraft): number {
  return Object.keys(aircraft.selected).length
}

/** "Band C (20,001 – 30,000 kg)". */
export function bandText(band: MtowBand): string {
  return `Band ${band} (${BANDS[band].range})`
}

export function formatKg(kg: number): string {
  return kg.toLocaleString('en-US')
}

/** `number` is the aircraft's 1-based position in the quote. */
export function aircraftName(aircraft: QuoteAircraft, number: number): string {
  const jet = jetOf(aircraft)
  if (jet) return jet.name
  return mtowOf(aircraft) ? `Aircraft ${number} (MTOW entered)` : `Aircraft ${number}`
}

/** The short label on a fleet tab. */
export function aircraftShortName(aircraft: QuoteAircraft): string {
  const jet = jetOf(aircraft)
  if (jet) return jet.model
  const kg = mtowOf(aircraft)
  return kg ? `${formatKg(kg)} kg` : 'Not chosen'
}

/** "GLEX · MTOW 45,132 kg · Band D (30,001 – 50,000 kg)". */
export function aircraftSpec(aircraft: QuoteAircraft): string {
  const kg = mtowOf(aircraft)
  const band = bandOf(aircraft)
  if (!kg || !band) return 'Aircraft type or MTOW not chosen'
  const jet = jetOf(aircraft)
  return `${jet?.icao ? `${jet.icao} · ` : ''}MTOW ${formatKg(kg)} kg · ${bandText(band)}`
}

/** What the quantity counts, for the stepper's accessible name. */
export function quantityWord(item: ScheduleItem): string {
  const unit = item.unit ?? ''
  if (unit.includes('month')) return 'months'
  if (unit.includes('day')) return 'days'
  if (unit.includes('arrival')) return 'movements'
  return ''
}

// ---------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------

export function isRange(figure: ScheduleFigure): figure is readonly [number, number] {
  return typeof figure !== 'number'
}

function times(figure: ScheduleFigure, quantity: number): ScheduleFigure {
  return isRange(figure) ? [figure[0] * quantity, figure[1] * quantity] : figure * quantity
}

/** Adds figures, keeping a range wherever any part of the sum is one. */
export function sumFigures(figures: readonly ScheduleFigure[]): ScheduleFigure {
  let low = 0
  let high = 0
  figures.forEach((figure) => {
    low += isRange(figure) ? figure[0] : figure
    high += isRange(figure) ? figure[1] : figure
  })
  return low === high ? low : [low, high]
}

/** "$250", or "$450–550". */
export const money = formatFigure

// ---------------------------------------------------------------------------
// The quote
// ---------------------------------------------------------------------------

export interface QuoteLine {
  section: ScheduleSection
  item: ScheduleItem
  rate: ScheduleFigure
  quantity: number
  amount: ScheduleFigure
  /** Priced by weight band — printed in the brand blue, as on the schedule. */
  isBanded: boolean
}

export interface PricedAircraft {
  aircraft: QuoteAircraft
  /** 1-based position in the quote. */
  number: number
  band: MtowBand
  lines: QuoteLine[]
  subtotal: ScheduleFigure
}

function linesFor(aircraft: QuoteAircraft, band: MtowBand): QuoteLine[] {
  const lines: QuoteLine[] = []
  QUOTE_SECTIONS.forEach((section) => {
    section.items.forEach((item) => {
      const quantity = aircraft.selected[item.id]
      if (!quantity) return
      const rate = figureForBand(item, band)
      lines.push({
        section,
        item,
        rate,
        quantity,
        amount: times(rate, quantity),
        isBanded: isBandPriced(item.price),
      })
    })
  })
  return lines
}

/** Every aircraft that can be priced: a weight and at least one service. */
export function priceFleet(fleet: readonly QuoteAircraft[]): PricedAircraft[] {
  const priced: PricedAircraft[] = []
  fleet.forEach((aircraft, index) => {
    const band = bandOf(aircraft)
    if (!band || !selectedCount(aircraft)) return
    const lines = linesFor(aircraft, band)
    priced.push({
      aircraft,
      number: index + 1,
      band,
      lines,
      subtotal: sumFigures(lines.map((line) => line.amount)),
    })
  })
  return priced
}

/** Aircraft with services ticked but no weight yet — they hold the quote back. */
export function pendingFleet(fleet: readonly QuoteAircraft[]): { aircraft: QuoteAircraft; number: number }[] {
  return fleet
    .map((aircraft, index) => ({ aircraft, number: index + 1 }))
    .filter(({ aircraft }) => selectedCount(aircraft) > 0 && !mtowOf(aircraft))
}

export function quoteTotal(priced: readonly PricedAircraft[]): ScheduleFigure {
  return sumFigures(priced.map((group) => group.subtotal))
}

export function quoteHasRange(priced: readonly PricedAircraft[]): boolean {
  return priced.some((group) => group.lines.some((line) => isRange(line.rate)))
}

/** Lines of one section, for a priced aircraft. */
export function sectionLines(group: PricedAircraft, section: ScheduleSection): QuoteLine[] {
  return group.lines.filter((line) => line.section === section)
}

/** The inclusion notes under a section's lines, each printed once. */
export function sectionNotes(lines: readonly QuoteLine[]): string[] {
  return [...new Set(lines.map((line) => line.item.quoteNote).filter((note): note is string => Boolean(note)))]
}

function joinWithAnd(parts: readonly string[]): string {
  if (parts.length < 2) return parts[0] ?? ''
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

export interface QuoteHeading {
  title: string
  subtitle: string
  /** Completes "our quotation for …". */
  intro: string
}

/** The quote's title block, from the aircraft that are in it. */
export function quoteHeading(entries: readonly { aircraft: QuoteAircraft; number: number }[]): QuoteHeading {
  if (entries.length === 1) {
    const { aircraft, number } = entries[0]
    const name = aircraftName(aircraft, number)
    return { title: name, subtitle: aircraftSpec(aircraft), intro: `your ${name} operation` }
  }
  if (entries.length > 1) {
    const names = entries.map(({ aircraft, number }) => aircraftName(aircraft, number))
    return {
      title: `${entries.length} aircraft`,
      subtitle: names.join(' + '),
      intro: `your ${joinWithAnd(names)} operations`,
    }
  }
  return { title: 'No aircraft selected', subtitle: '', intro: 'your operation' }
}

/** The rate column's caption: the band when one aircraft is quoted. */
export function rateCaption(priced: readonly PricedAircraft[]): string {
  return priced.length === 1 ? `Band ${priced[0].band}` : 'by aircraft'
}

// ---------------------------------------------------------------------------
// Reference and dates
// ---------------------------------------------------------------------------

/** "EAN-Q261020-4821" — the date plus four random digits. */
export function newQuoteNumber(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  return `EAN-Q${date}-${Math.floor(1000 + Math.random() * 9000)}`
}

/** "20 October 2026". Client-only: the quotation renders after the gate. */
export function quoteDate(now: Date): string {
  return now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Plain-text copy
// ---------------------------------------------------------------------------

export interface QuoteRecipient {
  name: string
  company: string
}

/** The text/plain half of "Copy as email" — the quotation without its table. */
export function quotePlainText(
  priced: readonly PricedAircraft[],
  recipient: QuoteRecipient,
  quoteNo: string,
  date: string
): string {
  const heading = quoteHeading(priced)
  const isFleet = priced.length > 1
  const out: string[] = [
    'EAN Jet Center · Ground Handling Quotation',
    `Quote no. ${quoteNo} · ${date}`,
    `${heading.title}${heading.subtitle ? ` · ${heading.subtitle}` : ''} · All prices in US dollars.`,
    '',
    `Dear ${recipient.name.split(' ')[0]},`,
    '',
    `Thank you for your interest in EAN Jet Center. Please find below our quotation for ${heading.intro}, based on the services you selected.`,
    '',
  ]

  priced.forEach((group) => {
    if (isFleet) {
      out.push(
        `AIRCRAFT ${group.number} · ${aircraftName(group.aircraft, group.number)} (${aircraftSpec(group.aircraft)})`
      )
    }
    QUOTE_SECTIONS.forEach((section) => {
      const lines = sectionLines(group, section)
      if (!lines.length) return
      out.push(section.title)
      lines.forEach((line) =>
        out.push(
          `  ${line.item.name}${line.item.unit ? ` (${line.item.unit})` : ''} × ${line.quantity} @ ${money(line.rate)} = ${money(line.amount)}`
        )
      )
      sectionNotes(lines).forEach((note) => out.push(`  Note: ${note}`))
    })
    if (isFleet) out.push(`  Subtotal: ${money(group.subtotal)}`)
    out.push('')
  })

  out.push(`Estimated total (USD): ${money(quoteTotal(priced))}`, '', 'Payment & Credit Terms')
  SCHEDULE_TERMS.forEach((term) => out.push(`  ${term.label}: ${term.text}`))
  out.push(
    '',
    `To confirm dates and book, reply to ${SCHEDULE_CONTACT.email} or call ${SCHEDULE_CONTACT.phone}.`,
    '',
    'Kind regards,',
    'EAN Jet Center Dispatch',
    `${SCHEDULE_CONTACT.email} · ${SCHEDULE_CONTACT.phone} · ${SCHEDULE_CONTACT.web}`
  )
  return out.join('\n')
}

/** The lead message filed with /api/leads — what sales sees in the admin desk. */
export function quoteLeadMessage(priced: readonly PricedAircraft[], quoteNo: string, phoneRegion: string): string {
  const out = [`Quote builder request ${quoteNo}:`]
  priced.forEach((group) => {
    out.push(`- Aircraft ${group.number}: ${aircraftName(group.aircraft, group.number)} (${aircraftSpec(group.aircraft)})`)
    group.lines.forEach((line) =>
      out.push(`    ${line.item.name} × ${line.quantity} = ${money(line.amount)}`)
    )
    if (priced.length > 1) out.push(`    Subtotal: ${money(group.subtotal)}`)
  })
  out.push(`- Estimated total: ${money(quoteTotal(priced))} USD`, `- Phone region: ${phoneRegion}`)
  return out.join('\n')
}

/** The pipeline value for the CRM: the midpoint of a ranged total. */
export function quoteValue(priced: readonly PricedAircraft[]): number {
  const total = quoteTotal(priced)
  return isRange(total) ? Math.round((total[0] + total[1]) / 2) : total
}
