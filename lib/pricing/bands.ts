import { MtowBand } from '@/types/pricing'

// MTOW bands — matches Nigerian CAA FBO pricing tiers
export const BANDS: Record<MtowBand, { label: string; min: number; max: number | null }> = {
  A: { label: 'Band A — Up to 5,700 kg',        min: 0,     max: 5700  },
  B: { label: 'Band B — 5,701 – 15,000 kg',     min: 5701,  max: 15000 },
  C: { label: 'Band C — 15,001 – 30,000 kg',    min: 15001, max: 30000 },
  D: { label: 'Band D — 30,001 – 80,000 kg',    min: 30001, max: 80000 },
  E: { label: 'Band E — Above 80,000 kg',        min: 80001, max: null  },
}

export function getBand(mtow_kg: number): MtowBand {
  if (typeof mtow_kg !== 'number' || !Number.isFinite(mtow_kg) || mtow_kg < 0) {
    throw new Error(`Invalid MTOW weight value: ${mtow_kg}`)
  }
  if (mtow_kg <= 5700)  return 'A'
  if (mtow_kg <= 15000) return 'B'
  if (mtow_kg <= 30000) return 'C'
  if (mtow_kg <= 80000) return 'D'
  return 'E'
}

// Ground handling rates — Lagos (MMIA)
// min = floor rate, standard = full rate
export const HANDLING_LOS: Record<MtowBand, { min: number; standard: number } | number> = {
  A: { min: 850,  standard: 1200 },
  B: { min: 1200, standard: 1600 },
  C: { min: 1600, standard: 2400 },
  D: { min: 2400, standard: 3200 },
  E: 4500,
}

// Abuja flat rate
export const HANDLING_ABV = 850

// International terminal fee
export const TERMINAL_INTL_USD = 850

// CIQ (customs, immigration, quarantine)
export const CIQ_USD = 350

// Overnight parking (per night)
export const PARKING_PER_NIGHT_USD = 100

// Passenger service charges
export const PSC = {
  intl_usd:  35,
  dom_ngn:   8500,
}

// VIP lounge (local operators)
export const VIP_LOCAL_NGN = 85000

// Add-on services — optional ground & facilitation services
export const ADDONS = [
  { id: 'ciq',            label: 'CIQ (Customs / Immigration / Quarantine)', per: 'flat', value: 600 },
  { id: 'apron_parking',  label: 'Apron parking (day)',                     per: 'flat', value: 200 },
  { id: 'hangarage',      label: 'Hangarage (day)',                         per: 'flat', value: 300 },
  { id: 'ext_wash_intl',  label: 'External wash (intl)',                     per: 'flat', value: 900 },
  { id: 'ext_wash_local', label: 'External wash (local)',                    per: 'flat', value: 450 },
  { id: 'interior_clean', label: 'Interior clean',                          per: 'flat', value: 150 },
  { id: 'toilet_intl',    label: 'Toilet service (intl)',                   per: 'flat', value: 150 },
  { id: 'water_intl',     label: 'Potable water (intl)',                    per: 'flat', value: 150 },
  { id: 'towing_intl',    label: 'Towing (intl)',                           per: 'flat', value: 250 },
  { id: 'gpu_diesel',     label: 'GPU (diesel)',                            per: 'flat', value: 100 },
  { id: 'pushback',       label: 'Pushback',                                per: 'flat', value: 100 },
  { id: 'baggage',        label: 'Baggage handling (per 10 bags)',           per: 'flat', value: 100 },
  { id: 'crew_tx',        label: 'Crew transfer / dispatch',                per: 'flat', value: 500 },
  { id: 'laundry',        label: 'Laundry',                                 per: 'flat', value: 50  },
  { id: 'ambulance',      label: 'Ambulance tarmac pass',                   per: 'flat', value: 250 },
] as const
