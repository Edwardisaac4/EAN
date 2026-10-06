import { MtowBand } from '@/types/pricing'

// Every rate in this file is transcribed from `docs/FBO PRICE LIST_adjusted.pdf`
// — the published EAN FBO price list. It is the single source of truth for the
// /pricing rate sheet and the quote calculator. Do not edit a figure here
// without a corresponding revision of that sheet.
//
// The sheet prices by MTOW band in **kilograms**, in five columns:
// 0-9000 · 9001-20000 · 20001-30000 · 30001-50000 · 50001 and above.
// `range` carries the weight span on its own. The UI used to recover it by
// regex-stripping the "Band X — " prefix off `label`, which silently produced a
// wrong caption the moment a label was reworded.
export const BANDS: Record<
  MtowBand,
  { label: string; range: string; min: number; max: number | null }
> = {
  A: { label: 'Band A — Up to 9,000 kg',      range: 'Up to 9,000 kg',      min: 0,     max: 9000  },
  B: { label: 'Band B — 9,001 – 20,000 kg',   range: '9,001 – 20,000 kg',   min: 9001,  max: 20000 },
  C: { label: 'Band C — 20,001 – 30,000 kg',  range: '20,001 – 30,000 kg',  min: 20001, max: 30000 },
  D: { label: 'Band D — 30,001 – 50,000 kg',  range: '30,001 – 50,000 kg',  min: 30001, max: 50000 },
  E: { label: 'Band E — 50,001 kg and above', range: '50,001 kg and above', min: 50001, max: null  },
}

export function getBand(mtow_kg: number): MtowBand {
  if (typeof mtow_kg !== 'number' || !Number.isFinite(mtow_kg) || mtow_kg < 0) {
    throw new Error(`Invalid MTOW weight value: ${mtow_kg}`)
  }
  if (mtow_kg <= 9000)  return 'A'
  if (mtow_kg <= 20000) return 'B'
  if (mtow_kg <= 30000) return 'C'
  if (mtow_kg <= 50000) return 'D'
  return 'E'
}

// Handling Fee — Lagos (MMIA). The sheet quotes bands C, D and E as a range,
// so `min` is the floor of that range and `standard` its ceiling. Bands A and B
// are published as a single figure, hence min === standard.
export const HANDLING_LOS: Record<MtowBand, { min: number; standard: number }> = {
  A: { min: 250,  standard: 250  },
  B: { min: 350,  standard: 350  },
  C: { min: 450,  standard: 550  },
  D: { min: 800,  standard: 1200 },
  E: { min: 1300, standard: 1700 },
}

// Abuja Handling — flat across every band on the sheet
export const HANDLING_ABV = 300

// Outstation Handling Fee — flat across every band
export const OUTSTATION_HANDLING_USD = 300

// CIQ Fee — flat across every band
export const CIQ_USD = 600

// Overnight Parking (per night) — flat across every band
export const PARKING_PER_NIGHT_USD = 100

// Disbursement Fee — levied on payments made on the client's behalf (fuel,
// permits, third-party invoices). A percentage, not a flat rate.
export const DISBURSEMENT_RATE = 0.15

// Monthly Handling Fee — a standing arrangement, priced per calendar month
// rather than per turnaround. Not part of a per-flight quote.
export const MONTHLY_HANDLING: Record<MtowBand, { hangarage: number; apron: number }> = {
  A: { hangarage: 3000,  apron: 2500  },
  B: { hangarage: 5000,  apron: 4000  },
  C: { hangarage: 9000,  apron: 7000  },
  D: { hangarage: 25000, apron: 20000 },
  E: { hangarage: 30000, apron: 25000 },
}

// Whether the sheet publishes this band's Lagos handling as a range rather than
// a single figure. Bands A and B carry one number, so the floor/standard toggle
// has nothing to move between and the UI hides it. A boolean is safe to ask for
// in a component; the rates behind it are not.
export function isBandedHandling(band: MtowBand): boolean {
  return HANDLING_LOS[band].min !== HANDLING_LOS[band].standard
}

// `flat` — one figure for every band. `band` — a figure per band.
// `pax` — one figure per passenger, multiplied by the head count on the quote.
// `request` — listed on the sheet with no published price; quoted on request.
export type AddonPricing = 'flat' | 'band' | 'request' | 'pax'

export interface Addon {
  id:    string
  label: string
  per:   AddonPricing
  value: number | Record<MtowBand, number>
  note?: string
  // Only offered on an international turnaround. The add-on grid hides these
  // on a domestic movement and the quote refuses to total them, so a flag left
  // ticked behind a toggle can never reach a client's figure.
  intlOnly?: boolean
}

// Add-on services, in published-sheet order.
export const ADDONS: readonly Addon[] = [
  { id: 'ciq',              label: 'CIQ (Customs / Immigration / Quarantine)', per: 'flat',    value: 600 },
  { id: 'apron_parking',    label: 'Apron parking (per day)',                  per: 'band',    value: { A: 100, B: 100, C: 200, D: 300, E: 400 } },
  { id: 'hangarage',        label: 'Hangarage (per day)',                      per: 'band',    value: { A: 300, B: 300, C: 300, D: 400, E: 400 } },
  { id: 'ext_wash_intl',    label: 'A/C external wash (international)',        per: 'band',    value: { A: 400, B: 750, C: 900, D: 1200, E: 1500 } },
  { id: 'towing_intl',      label: 'Towing services (international)',          per: 'flat',    value: 250 },
  { id: 'outstation',       label: 'Outstation handling fee',                  per: 'flat',    value: 300 },
  { id: 'toilet_intl',      label: 'Toilet service (international)',           per: 'flat',    value: 150 },
  { id: 'water_intl',       label: 'Potable water (international)',            per: 'flat',    value: 150 },
  { id: 'interior_clean',   label: 'Interior clean',                           per: 'flat',    value: 150 },
  { id: 'laundry',          label: 'Laundry',                                  per: 'flat',    value: 50 },
  { id: 'ice_cubes',        label: 'Ice cubes',                                per: 'flat',    value: 10 },
  { id: 'trash',            label: 'Trash collection',                         per: 'flat',    value: 25 },
  { id: 'dishes',           label: 'Dishes',                                   per: 'flat',    value: 20 },
  { id: 'overflight',       label: 'Overflight permit',                        per: 'flat',    value: 150 },
  { id: 'dispatch',         label: 'Dispatch facilitation fee',                per: 'flat',    value: 500 },
  { id: 'newspaper',        label: 'Newspaper',                                per: 'flat',    value: 10 },
  { id: 'fridge_storage',   label: 'Fridge storage',                           per: 'flat',    value: 20 },
  { id: 'tech_landing',     label: 'Technical landing permit',                 per: 'flat',    value: 150 },
  { id: 'block_clearance',  label: 'Block clearance',                          per: 'request', value: 0, note: 'Quoted on request' },
  { id: 'ambulance',        label: 'Ambulance tarmac pass',                    per: 'flat',    value: 250 },
  { id: 'gpu_diesel',       label: 'GPU (diesel)',                             per: 'flat',    value: 100 },
  { id: 'wheelchair_intl',  label: 'Wheelchair service (international)',       per: 'flat',    value: 20 },

  // Beyond the published sheet. The block above stays in sheet order; services
  // added since the last revision land here until the PDF catches up.
  { id: 'psc',              label: 'PSC (Passenger Service Charge)',           per: 'pax',     value: 65, intlOnly: true },
]

// Resolves an add-on to its published rate for a given band. This is the unit
// rate, not the line total — a `pax` item returns the per-passenger figure and
// it is the quote that multiplies it out. Returns null for the on-request
// items, which have no published figure to total.
export function addonRate(addon: Addon, band: MtowBand): number | null {
  if (addon.per === 'request') return null
  if (typeof addon.value === 'number') return addon.value
  return addon.value[band]
}
