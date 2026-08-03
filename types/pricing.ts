export type MtowBand = 'A' | 'B' | 'C' | 'D' | 'E'

export type Location    = 'LOS' | 'ABV'
export type Operation   = 'dom' | 'intl'
export type StayType    = 'same' | 'over'
export type HandingTier = 'min' | 'standard'
export type DayType     = 'wd' | 'we'
export type Mode        = 'client' | 'staff'

export interface Aircraft {
  id:           string
  name:         string       // e.g. "Gulfstream G650"
  manufacturer: string       // e.g. "Gulfstream"
  mtow_kg:      number | null// Maximum Takeoff Weight in kg
  mtow_lbs:     number | null
  category?:    string       // e.g. "Large Cabin Jet"
  wingspan_m?:  number | null
  range_nm?:    number | null
  ceiling_ft?:  number | null
  speed_kts?:   number | null
  engine_type?: string | null
  pax_max?:     number | null
  icao_code?:   string | null
  source:       'database' | 'api' | 'manual'
}

export interface QuoteState {
  aircraft:     Aircraft | null
  mtow_manual:  number | null   // if user enters MTOW manually
  location:     Location
  operation:    Operation
  stay:         StayType
  nights:       number
  pax:          number
  day:          DayType
  handling:     HandingTier
  addons:       Record<string, boolean>
  mode:         Mode
  revealed:     boolean        // client mode — has entered details
}

export interface QuoteLineItem {
  label:        string
  sub?:         string
  value:        number
  currency:     'USD' | 'NGN'
  provisional?: boolean        // shows amber — pending confirmation
  pending?:     boolean        // shows TBD
}

export interface QuoteResult {
  band:         MtowBand
  bandLabel:    string
  items:        QuoteLineItem[]
  usdTotal:     number
  ngnTotal:     number
  totalDisplay: string
}

export interface LeadDetails {
  name:    string
  email:   string
  phone:   string
  company: string
}

export interface RequestOrder {
  ref:        string
  lead:       LeadDetails
  quote:      QuoteResult
  aircraft:   Aircraft | null
  state:      QuoteState
  createdAt:  string
}
