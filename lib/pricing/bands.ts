import { MtowBand } from '@/types/pricing'
import {
  figureForBand,
  scheduleBandRates,
  scheduleFlatRate,
  scheduleItem,
} from './rate-schedule'

export { DISBURSEMENT_RATE } from './rate-schedule'

// The calculator's view of the published schedule. Every figure that the
// schedule publishes is read out of `rate-schedule.ts` (EAN-FBO-RS v2026.2) by
// id, so the rate sheet on /pricing and the quote on /pricing/quote cannot
// disagree. Do not type a published figure into this file — change it in the
// schedule. The few rates below that are typed here are the calculator-only
// services the schedule does not list, and each says so.
//
// The schedule prices by MTOW band in **kilograms**, in five columns:
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

// Handling Fee — Lagos (MMIA). The schedule quotes some bands as a range, so
// `min` is the floor of that range and `standard` its ceiling. A band published
// as a single figure gets min === standard, which is what hides the
// floor/standard toggle for it.
const HANDLING_LOS_ITEM = scheduleItem('handling_los')
function handlingLos(band: MtowBand): { min: number; standard: number } {
  const figure = figureForBand(HANDLING_LOS_ITEM, band)
  return typeof figure === 'number'
    ? { min: figure, standard: figure }
    : { min: figure[0], standard: figure[1] }
}
export const HANDLING_LOS: Record<MtowBand, { min: number; standard: number }> = {
  A: handlingLos('A'),
  B: handlingLos('B'),
  C: handlingLos('C'),
  D: handlingLos('D'),
  E: handlingLos('E'),
}

// Abuja Handling — flat across every band on the schedule
export const HANDLING_ABV = scheduleFlatRate('handling_abv')

// Outstation Handling Fee — flat across every band
export const OUTSTATION_HANDLING_USD = scheduleFlatRate('outstation')

// CIQ Fee — flat across every band. Calculator-only: v2026.2 does not list CIQ,
// but an international turnaround still incurs it.
export const CIQ_USD = 600

// Overnight Parking (per night) — flat across every band
export const PARKING_PER_NIGHT_USD = scheduleFlatRate('overnight_parking')

// Monthly Handling Fee — a standing arrangement, priced per calendar month
// rather than per turnaround. Not part of a per-flight quote.
const MONTHLY_HANGARAGE = scheduleBandRates('monthly_hangarage')
const MONTHLY_APRON = scheduleBandRates('monthly_apron')
export const MONTHLY_HANDLING: Record<MtowBand, { hangarage: number; apron: number }> = {
  A: { hangarage: MONTHLY_HANGARAGE.A, apron: MONTHLY_APRON.A },
  B: { hangarage: MONTHLY_HANGARAGE.B, apron: MONTHLY_APRON.B },
  C: { hangarage: MONTHLY_HANGARAGE.C, apron: MONTHLY_APRON.C },
  D: { hangarage: MONTHLY_HANGARAGE.D, apron: MONTHLY_APRON.D },
  E: { hangarage: MONTHLY_HANGARAGE.E, apron: MONTHLY_APRON.E },
}

// Whether the schedule publishes this band's Lagos handling as a range rather
// than a single figure. A single-figure band has nothing for the floor/standard
// toggle to move between, so the UI hides it. A boolean is safe to ask for in a
// component; the rates behind it are not.
export function isBandedHandling(band: MtowBand): boolean {
  return HANDLING_LOS[band].min !== HANDLING_LOS[band].standard
}

// `flat` — one figure for every band. `band` — a figure per band.
// `pax` — one figure per passenger, multiplied by the head count on the quote.
// `request` — listed with no published price; quoted on request.
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

// Add-on services. The ids match the schedule's wherever the schedule lists the
// service, and the value is read from it.
export const ADDONS: readonly Addon[] = [
  { id: 'ciq',              label: 'CIQ (Customs / Immigration / Quarantine)', per: 'flat',    value: CIQ_USD },
  { id: 'apron_parking',    label: 'Apron parking (per day)',                  per: 'band',    value: scheduleBandRates('apron_parking') },
  { id: 'hangarage',        label: 'Hangarage (per day)',                      per: 'band',    value: scheduleBandRates('hangarage') },
  { id: 'ext_wash_intl',    label: 'A/C external wash (international)',        per: 'band',    value: scheduleBandRates('ext_wash_intl') },
  { id: 'towing_intl',      label: 'Towing services (international)',          per: 'flat',    value: scheduleFlatRate('towing_intl') },
  { id: 'outstation',       label: 'Outstation handling fee',                  per: 'flat',    value: OUTSTATION_HANDLING_USD },
  { id: 'toilet_intl',      label: 'Toilet service (international)',           per: 'flat',    value: scheduleFlatRate('toilet_intl') },
  { id: 'water_intl',       label: 'Potable water (international)',            per: 'flat',    value: scheduleFlatRate('water_intl') },
  { id: 'interior_clean',   label: 'Interior clean',                           per: 'flat',    value: scheduleFlatRate('interior_clean') },
  { id: 'laundry',          label: 'Laundry',                                  per: 'flat',    value: scheduleFlatRate('laundry') },
  { id: 'ice_cubes',        label: 'Ice cubes',                                per: 'flat',    value: scheduleFlatRate('ice_cubes') },
  { id: 'trash',            label: 'Trash collection',                         per: 'flat',    value: scheduleFlatRate('trash') },
  { id: 'dishes',           label: 'Dishes',                                   per: 'flat',    value: scheduleFlatRate('dishes') },
  { id: 'overflight',       label: 'Overflight permit',                        per: 'flat',    value: scheduleFlatRate('overflight') },
  { id: 'dispatch',         label: 'Dispatch facilitation fee',                per: 'flat',    value: scheduleFlatRate('dispatch') },
  { id: 'newspaper',        label: 'Newspaper',                                per: 'flat',    value: scheduleFlatRate('newspaper') },
  { id: 'fridge_storage',   label: 'Fridge storage',                           per: 'flat',    value: scheduleFlatRate('fridge_storage') },
  { id: 'tech_landing',     label: 'Technical landing permit',                 per: 'flat',    value: scheduleFlatRate('tech_landing') },
  // Calculator-only — not on v2026.2, kept on the quote when it was adopted.
  { id: 'block_clearance',  label: 'Block clearance',                          per: 'request', value: 0, note: 'Quoted on request' },
  { id: 'ambulance',        label: 'Ambulance tarmac pass',                    per: 'flat',    value: scheduleFlatRate('ambulance') },
  // Calculator-only — not on v2026.2.
  { id: 'gpu_diesel',       label: 'GPU (diesel)',                             per: 'flat',    value: 100 },
  { id: 'wheelchair_intl',  label: 'Wheelchair service (international)',       per: 'flat',    value: scheduleFlatRate('wheelchair_intl') },
  // Calculator-only — not on v2026.2.
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
