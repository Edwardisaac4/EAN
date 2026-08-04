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

// Add-on services — value can be flat or per-band
export const ADDONS = [
  { id: 'airstairs',   label: 'Airstairs',              per: 'band',    values: { A: 200, B: 250, C: 300, D: 350, E: 400 } },
  { id: 'gpu',         label: 'Ground Power Unit (GPU)', per: 'band',   values: { A: 150, B: 200, C: 300, D: 400, E: 500 } },
  { id: 'lav',         label: 'Lavatory service',        per: 'band',   values: { A: 250, B: 280, C: 300, D: 320, E: 350 } },
  { id: 'water',       label: 'Water service',           per: 'band',   values: { A: 150, B: 180, C: 200, D: 220, E: 250 } },
  { id: 'tow_in',      label: 'Aircraft tow (in)',       per: 'band',   values: { A: 200, B: 250, C: 350, D: 450, E: 600 } },
  { id: 'tow_out',     label: 'Aircraft tow (out)',      per: 'band',   values: { A: 200, B: 250, C: 350, D: 450, E: 600 } },
  { id: 'vip_tx',      label: 'VIP transport (landside)', per: 'flat',  value: 250 },
  { id: 'customs',     label: 'Customs facilitation',    per: 'flat',   value: 250 },
  { id: 'security',    label: 'Security escort',         per: 'flat',   value: 300 },
  { id: 'marshalling', label: 'Marshalling',             per: 'flat',   value: 80  },
  { id: 'crew_tx',     label: 'Crew transport',          per: 'flat',   value: 150 },
  { id: 'deice',       label: 'De-icing (if required)',  per: 'flat',   value: 400 },
] as const
