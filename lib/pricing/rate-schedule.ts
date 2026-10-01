import type { MtowBand } from '@/types/pricing'

// =============================================================================
// FBO Services & Rates — the published schedule, EAN-FBO-RS v2026.2
// =============================================================================
// The single source for every published figure on /pricing (the rate sheet and
// its PDF) and /pricing/quote (the calculator, through bands.ts). v2026.2
// supersedes FBO Price List 0626, the sheet the calculator was transcribed from
// until September 2026. A revision is a new version here — bump `version` and
// `issued`, and set `supersedes` to the version it replaces.

/** One published price, or a floor–ceiling range quoted as "$450–550". */
export type ScheduleFigure = number | readonly [min: number, max: number]

/** A figure per MTOW band, for the services the schedule prices by weight. */
export type BandFigures = Readonly<Record<MtowBand, ScheduleFigure>>

export interface ScheduleItem {
  /** Stable key. bands.ts reads calculator rates by this, so never reuse one. */
  id: string
  name: string
  unit?: string
  price: ScheduleFigure | BandFigures
}

export interface ScheduleSection {
  id: string
  title: string
  note?: string
  items: readonly ScheduleItem[]
}

export const BAND_ORDER: readonly MtowBand[] = ['A', 'B', 'C', 'D', 'E']

export const SCHEDULE_DOCUMENT = {
  title: 'FBO Services & Rates',
  ref: 'EAN-FBO-RS',
  version: '2026.2',
  issued: '2026-09-28',
  supersedes: 'FBO Price List 0626',
  currency: 'USD',
  locations: 'Lagos (LOS) · Abuja (ABV) · Outstations',
} as const

// Disbursement is a percentage, not a line on the table, so it lives here as a
// number and the term below is written from it.
export const DISBURSEMENT_RATE = 0.15

export const SCHEDULE_SECTIONS: readonly ScheduleSection[] = [
  {
    id: 'handling',
    title: 'Ground Handling',
    note: 'Per movement unless stated.',
    items: [
      {
        id: 'handling_los',
        name: 'Lagos (LOS) handling fee',
        price: { A: 250, B: 350, C: [450, 550], D: 800, E: [1300, 1700] },
      },
      { id: 'handling_abv', name: 'Abuja (ABV) handling', price: 300 },
      { id: 'outstation', name: 'Outstation handling fee', price: 300 },
      { id: 'dispatch', name: 'Dispatch facilitation fee', price: 500 },
    ],
  },
  {
    id: 'permits',
    title: 'Permits',
    note: 'Nigerian permits processed by EAN Dispatch.',
    items: [
      { id: 'landing_weekday', name: 'Landing permit — weekday', price: 250 },
      { id: 'landing_weekend', name: 'Landing permit — weekend', price: 500 },
      { id: 'tech_landing', name: 'Technical landing permit', price: 150 },
      { id: 'overflight', name: 'Overflight permit', price: 150 },
      { id: 'deportee_landing', name: 'Deportee flight landing permit', price: 500 },
    ],
  },
  {
    id: 'vip',
    title: 'Passenger, Crew & VIP',
    items: [
      { id: 'vip_terminal_los', name: 'Lagos VIP terminal fee', price: 850 },
      { id: 'vip_lounge_abv', name: 'Abuja VIP lounge', unit: 'per arrival / departure', price: 400 },
      { id: 'crew_transfer', name: 'Crew transfer', price: 100 },
      { id: 'wheelchair_intl', name: 'Wheelchair service — international', price: 20 },
      { id: 'ambulance', name: 'Ambulance tarmac pass', price: 250 },
    ],
  },
  {
    id: 'parking',
    title: 'Parking & Hangarage',
    items: [
      {
        id: 'apron_parking',
        name: 'Apron parking',
        unit: 'per day',
        price: { A: 100, B: 100, C: 200, D: 300, E: 400 },
      },
      { id: 'overnight_parking', name: 'Overnight parking', price: 100 },
      {
        id: 'hangarage',
        name: 'Hangarage',
        unit: 'per day',
        price: { A: 300, B: 300, C: 300, D: 400, E: 400 },
      },
    ],
  },
  {
    id: 'aircraft',
    title: 'Aircraft Services',
    items: [
      {
        id: 'ext_wash_intl',
        name: 'External wash — international',
        price: { A: 400, B: 750, C: 900, D: 1200, E: 1500 },
      },
      { id: 'interior_clean', name: 'Interior clean', price: 150 },
      { id: 'towing_intl', name: 'Towing — international', price: 250 },
      { id: 'toilet_intl', name: 'Toilet service — international', price: 150 },
      { id: 'water_intl', name: 'Potable water — international', price: 150 },
    ],
  },
  {
    id: 'cabin',
    title: 'Cabin Supplies',
    items: [
      { id: 'laundry', name: 'Laundry', price: 50 },
      { id: 'dishes', name: 'Dishes', price: 20 },
      { id: 'trash', name: 'Trash collection', price: 25 },
      { id: 'fridge_storage', name: 'Fridge storage', price: 20 },
      { id: 'ice_cubes', name: 'Ice cubes', price: 10 },
      { id: 'newspaper', name: 'Newspaper', price: 10 },
    ],
  },
  {
    id: 'monthly',
    title: 'Based Aircraft — Monthly Handling',
    note: 'For aircraft based at EAN on a monthly programme.',
    items: [
      {
        id: 'monthly_hangarage',
        name: 'Monthly handling — hangarage',
        unit: 'per month',
        price: { A: 3000, B: 5000, C: 9000, D: 25000, E: 30000 },
      },
      {
        id: 'monthly_apron',
        name: 'Monthly handling — apron',
        unit: 'per month',
        price: { A: 2500, B: 4000, C: 7000, D: 20000, E: 25000 },
      },
    ],
  },
]

export const SCHEDULE_TERMS: readonly { label: string; text: string }[] = [
  { label: 'Fuel', text: 'Quoted per location agreement, based on international Platts pricing.' },
  {
    label: 'Disbursement fee',
    text: `${Math.round(DISBURSEMENT_RATE * 100)}% of any payment made by EAN on the operator’s behalf.`,
  },
  { label: 'Ad-hoc services', text: 'Available on demand and quoted on request.' },
]

/**
 * The dispatch desk, which is who the schedule sends enquiries to. Deliberately
 * not LAGOS_HQ from lib/constants.ts — that is the general line and inbox.
 */
export const SCHEDULE_CONTACT = {
  email: 'dispatch@ean.aero',
  phone: '+234 (0) 1-295-0960',
  phone2: '+234 (0) 909 202 2001',
  web: 'www.ean.aero',
  address:
    'EAN Jet Center, FAAN Transit Camp Road, Murtala Muhammed International Airport, Ikeja, Lagos',
} as const

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Built by hand rather than with toLocaleDateString, so the server render and
// the browser cannot format the date differently and trip hydration.
function longDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return `${day} ${MONTHS[month - 1]} ${year}`
}

/** "28 September 2026". */
export const ISSUED_LABEL = longDate(SCHEDULE_DOCUMENT.issued)

/** "$250", or "$450–550" for a range. */
export function formatFigure(figure: ScheduleFigure): string {
  const usd = (n: number) => n.toLocaleString('en-US')
  return typeof figure === 'number'
    ? `$${usd(figure)}`
    : `$${usd(figure[0])}–${usd(figure[1])}`
}

export const SCHEDULE_SERVICE_COUNT = SCHEDULE_SECTIONS.reduce(
  (count, section) => count + section.items.length,
  0
)

export function isBandPriced(price: ScheduleItem['price']): price is BandFigures {
  return typeof price === 'object' && !Array.isArray(price)
}

/** The figure a given band pays — the flat price when the item is not banded. */
export function figureForBand(item: ScheduleItem, band: MtowBand): ScheduleFigure {
  return isBandPriced(item.price) ? item.price[band] : item.price
}

// Lookups for bands.ts. They throw rather than fall back, so a renamed id or a
// figure changed from single to range fails the build instead of quietly
// pricing a turnaround at zero.

export function scheduleItem(id: string): ScheduleItem {
  for (const section of SCHEDULE_SECTIONS) {
    const found = section.items.find((item) => item.id === id)
    if (found) return found
  }
  throw new Error(`Rate schedule has no item "${id}"`)
}

/** A single figure that applies to every band. */
export function scheduleFlatRate(id: string): number {
  const { price } = scheduleItem(id)
  if (typeof price !== 'number') {
    throw new Error(`Rate schedule item "${id}" is not a single flat figure`)
  }
  return price
}

/** A single figure per band — no ranges. */
export function scheduleBandRates(id: string): Record<MtowBand, number> {
  const item = scheduleItem(id)
  const pick = (band: MtowBand): number => {
    const figure = figureForBand(item, band)
    if (typeof figure !== 'number') {
      throw new Error(`Rate schedule item "${id}" quotes band ${band} as a range`)
    }
    return figure
  }
  return { A: pick('A'), B: pick('B'), C: pick('C'), D: pick('D'), E: pick('E') }
}
