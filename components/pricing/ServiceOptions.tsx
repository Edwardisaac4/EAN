'use client'

import React from 'react'
import { Location, Operation, StayType, HandingTier, DayType, Mode, MtowBand } from '@/types/pricing'
import { MapPin, Globe, Clock, Users, Calendar, Settings2, Plus, Minus } from 'lucide-react'

interface ServiceOptionsProps {
  location: Location
  operation: Operation
  stay: StayType
  nights: number
  pax: number
  day: DayType
  handling: HandingTier
  mode: Mode
  band: MtowBand
  onChangeLocation: (loc: Location) => void
  onChangeOperation: (op: Operation) => void
  onChangeStay: (stay: StayType) => void
  onChangeNights: (nights: number) => void
  onChangePax: (pax: number) => void
  onChangeDay: (day: DayType) => void
  onChangeHandling: (handling: HandingTier) => void
  onAutoCheckCiq?: () => void
}

export default function ServiceOptions({
  location,
  operation,
  stay,
  nights,
  pax,
  day,
  handling,
  mode,
  band,
  onChangeLocation,
  onChangeOperation,
  onChangeStay,
  onChangeNights,
  onChangePax,
  onChangeDay,
  onChangeHandling,
  onAutoCheckCiq,
}: ServiceOptionsProps) {
  const handleOperationSelect = (op: Operation) => {
    onChangeOperation(op)
    if (op === 'intl' && onAutoCheckCiq) {
      onAutoCheckCiq()
    }
  }

  const isStaff = mode === 'staff'
  const isLagos = location === 'LOS'
  const hasTierOptions = isLagos && (band === 'A' || band === 'B' || band === 'C' || band === 'D')

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-ean-border-light space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-ean-border-light">
        <h3 className="font-display font-semibold text-xl text-ean-navy flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-ean-gold" />
          2. Flight Details & Parameters
        </h3>
        <span className="text-xs font-ui uppercase tracking-wider text-ean-gold bg-ean-gold/10 px-2.5 py-1 rounded-full font-semibold">
          Step 2 of 4
        </span>
      </div>

      {/* SECTION 1 — Location */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-xs font-ui uppercase tracking-wider text-ean-muted-dark font-medium mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-ean-gold" />
          Airport Location
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={location === 'LOS'}
            onClick={() => onChangeLocation('LOS')}
            className={`py-3 px-4 rounded-lg font-ui text-sm font-medium border text-center transition-all ${
              location === 'LOS'
                ? 'bg-ean-navy text-white border-ean-navy shadow-md ring-2 ring-ean-gold/50'
                : 'bg-ean-surface text-ean-navy border-ean-border-light hover:bg-gray-100'
            }`}
          >
            Lagos (MMIA) — LOS
          </button>
          <button
            type="button"
            aria-pressed={location === 'ABV'}
            onClick={() => onChangeLocation('ABV')}
            className={`py-3 px-4 rounded-lg font-ui text-sm font-medium border text-center transition-all ${
              location === 'ABV'
                ? 'bg-ean-navy text-white border-ean-navy shadow-md ring-2 ring-ean-gold/50'
                : 'bg-ean-surface text-ean-navy border-ean-border-light hover:bg-gray-100'
            }`}
          >
            Abuja (NAIA) — ABV
          </button>
        </div>
      </fieldset>

      {/* SECTION 2 — Operation Type */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-xs font-ui uppercase tracking-wider text-ean-muted-dark font-medium mb-2 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-ean-gold" />
          Operation Type
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={operation === 'dom'}
            onClick={() => handleOperationSelect('dom')}
            className={`py-3 px-4 rounded-lg font-ui text-sm font-medium border text-center transition-all ${
              operation === 'dom'
                ? 'bg-ean-navy text-white border-ean-navy shadow-md ring-2 ring-ean-gold/50'
                : 'bg-ean-surface text-ean-navy border-ean-border-light hover:bg-gray-100'
            }`}
          >
            Domestic Flight
          </button>
          <button
            type="button"
            aria-pressed={operation === 'intl'}
            onClick={() => handleOperationSelect('intl')}
            className={`py-3 px-4 rounded-lg font-ui text-sm font-medium border text-center transition-all ${
              operation === 'intl'
                ? 'bg-ean-navy text-white border-ean-navy shadow-md ring-2 ring-ean-gold/50'
                : 'bg-ean-surface text-ean-navy border-ean-border-light hover:bg-gray-100'
            }`}
          >
            International Flight
          </button>
        </div>
      </fieldset>

      {/* SECTION 3 — Stay Type & Nights */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-xs font-ui uppercase tracking-wider text-ean-muted-dark font-medium mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-ean-gold" />
          Stay Duration & Movement
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={stay === 'same'}
            onClick={() => onChangeStay('same')}
            className={`py-3 px-4 rounded-lg font-ui text-sm font-medium border text-center transition-all ${
              stay === 'same'
                ? 'bg-ean-navy text-white border-ean-navy shadow-md ring-2 ring-ean-gold/50'
                : 'bg-ean-surface text-ean-navy border-ean-border-light hover:bg-gray-100'
            }`}
          >
            Same-day Turnaround
          </button>
          <button
            type="button"
            aria-pressed={stay === 'over'}
            onClick={() => onChangeStay('over')}
            className={`py-3 px-4 rounded-lg font-ui text-sm font-medium border text-center transition-all ${
              stay === 'over'
                ? 'bg-ean-navy text-white border-ean-navy shadow-md ring-2 ring-ean-gold/50'
                : 'bg-ean-surface text-ean-navy border-ean-border-light hover:bg-gray-100'
            }`}
          >
            Overnight Stay
          </button>
        </div>

        {stay === 'over' && (
          <div className="mt-3 p-3 bg-ean-surface rounded-lg border border-ean-border-light flex items-center justify-between">
            <span className="text-xs font-ui font-medium text-ean-navy">
              Number of Overnight Nights:
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onChangeNights(Math.max(1, nights - 1))}
                className="w-8 h-8 rounded-full bg-white border border-ean-border-light flex items-center justify-center text-ean-navy hover:border-ean-gold transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-ui font-bold text-sm text-ean-navy min-w-6 text-center tabular-nums">
                {nights}
              </span>
              <button
                type="button"
                onClick={() => onChangeNights(Math.min(14, nights + 1))}
                className="w-8 h-8 rounded-full bg-white border border-ean-border-light flex items-center justify-center text-ean-navy hover:border-ean-gold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </fieldset>

      {/* SECTION 4 — Passengers */}
      <div>
        <label htmlFor="pax-count-input" className="block text-xs font-ui uppercase tracking-wider text-ean-muted-dark font-medium mb-1 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-ean-gold" />
          Passenger Count
        </label>
        <div className="relative">
          <input
            id="pax-count-input"
            type="number"
            min={0}
            max={50}
            value={pax}
            onChange={(e) => onChangePax(Math.min(50, Math.max(0, Number(e.target.value) || 0)))}
            className="w-full px-4 py-2.5 bg-ean-surface border border-ean-border-light rounded-lg text-ean-navy text-sm font-ui focus:outline-none focus:border-ean-gold focus:ring-1 focus:ring-ean-gold transition-colors"
          />
        </div>
        <p className="text-[11px] font-ui text-ean-muted-dark mt-1">
          Estimated — CRO confirms final count on arrival
        </p>
      </div>

      {/* SECTION 5 — Day Type (Staff Mode only) */}
      {isStaff && (
        <fieldset className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/20 space-y-3 m-0">
          <legend className="text-xs font-ui uppercase tracking-wider text-ean-gold font-bold flex items-center gap-1.5 px-1">
            <Calendar className="w-3.5 h-3.5" />
            Staff Controls — Movement Day
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={day === 'wd'}
              onClick={() => onChangeDay('wd')}
              className={`py-2 px-3 rounded text-xs font-ui font-medium border ${
                day === 'wd'
                  ? 'bg-ean-navy text-white border-ean-navy'
                  : 'bg-white text-ean-navy border-ean-border-light'
              }`}
            >
              Weekday Movement
            </button>
            <button
              type="button"
              aria-pressed={day === 'we'}
              onClick={() => onChangeDay('we')}
              className={`py-2 px-3 rounded text-xs font-ui font-medium border ${
                day === 'we'
                  ? 'bg-ean-navy text-white border-ean-navy'
                  : 'bg-white text-ean-navy border-ean-border-light'
              }`}
            >
              Weekend Movement
            </button>
          </div>
          {day === 'we' && (
            <p className="text-[11px] font-ui text-amber-700 font-medium">
              Weekend note: Some surcharges may apply to out-of-hours handling operations.
            </p>
          )}
        </fieldset>
      )}

      {/* SECTION 6 — Handling Tier (Lagos & Staff mode only) */}
      {isStaff && hasTierOptions && (
        <fieldset className="p-4 bg-ean-navy/5 rounded-lg border border-ean-navy/10 space-y-3 m-0">
          <legend className="text-xs font-ui uppercase tracking-wider text-ean-navy font-bold px-1">
            3. Ground Handling Tier (Lagos MMIA)
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={handling === 'min'}
              onClick={() => onChangeHandling('min')}
              className={`py-2 px-3 rounded text-xs font-ui font-medium border ${
                handling === 'min'
                  ? 'bg-ean-navy text-white border-ean-navy'
                  : 'bg-white text-ean-navy border-ean-border-light'
              }`}
            >
              Floor Rate (Minimum)
            </button>
            <button
              type="button"
              aria-pressed={handling === 'standard'}
              onClick={() => onChangeHandling('standard')}
              className={`py-2 px-3 rounded text-xs font-ui font-medium border ${
                handling === 'standard'
                  ? 'bg-ean-navy text-white border-ean-navy'
                  : 'bg-white text-ean-navy border-ean-border-light'
              }`}
            >
              Standard Rate
            </button>
          </div>
        </fieldset>
      )}
    </div>
  )
}
