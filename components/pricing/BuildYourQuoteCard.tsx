'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Aircraft, Location, Operation, StayType, HandingTier, DayType, MtowBand } from '@/types/pricing'
import { BANDS, isBandedHandling } from '@/lib/pricing/bands'
import { Search, ChevronDown, Check, PenLine, Plus, Minus } from 'lucide-react'

interface BuildYourQuoteCardProps {
  aircraft: Aircraft | null
  manualMtow: number | null
  onSelectAircraft: (aircraft: Aircraft | null) => void
  onSetManualMtow: (mtow: number | null) => void
  location: Location
  operation: Operation
  day: DayType
  pax: number
  stay: StayType
  nights: number
  handling: HandingTier
  band: MtowBand
  onChangeLocation: (loc: Location) => void
  onChangeOperation: (op: Operation) => void
  onChangeDay: (day: DayType) => void
  onChangePax: (pax: number) => void
  onChangeStay: (stay: StayType) => void
  onChangeNights: (nights: number) => void
  onChangeHandling: (handling: HandingTier) => void
  onAutoCheckCiq?: () => void
}

export default function BuildYourQuoteCard({
  aircraft,
  manualMtow,
  onSelectAircraft,
  onSetManualMtow,
  location,
  operation,
  day,
  pax,
  stay,
  nights,
  handling,
  band,
  onChangeLocation,
  onChangeOperation,
  onChangeDay,
  onChangePax,
  onChangeStay,
  onChangeNights,
  onChangeHandling,
  onAutoCheckCiq,
}: BuildYourQuoteCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isManualMode, setIsManualMode] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch aircraft data from API or defaults
  const { data: aircraftResults = [] } = useQuery({
    queryKey: ['aircraft-search', debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/aircraft/search?q=${encodeURIComponent(debouncedQuery)}`)
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        return json.data as Aircraft[]
      }
      return []
    },
    staleTime: 1000 * 60 * 60,
  })

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectAircraftItem = (item: Aircraft) => {
    onSelectAircraft(item)
    setDropdownOpen(false)
    setSearchQuery('')
  }

  const handleOperationSelect = (op: Operation) => {
    onChangeOperation(op)
    if (op === 'intl' && onAutoCheckCiq) {
      onAutoCheckCiq()
    }
  }

  // Format MTOW string
  const currentMtowKg = aircraft?.mtow_kg ?? manualMtow ?? 24300
  const bandInfo = BANDS[band]
  const bandRangeText = bandInfo ? bandInfo.label.replace(/^Band [A-E] — /, '') : '15,001 – 30,000 kg'
  const mtowText = `MTOW ${currentMtowKg.toLocaleString()} kg · ${bandRangeText}`

  return (
    <div className="bg-white p-6 md:p-8 shadow-sm border border-ean-border-light space-y-6">
      {/* HEADER SECTION */}
      <div>
        <h2 className="font-display font-medium text-xl md:text-2xl text-ean-text-light tracking-wide">
          Build your quote
        </h2>
        <p className="font-ui text-xs md:text-sm text-ean-muted-light mt-0.5">
          Select the aircraft and visit details. Pricing is drawn live from EAN&apos;s approved rate schedule.
        </p>
      </div>

      {/* FIELD 1: AIRCRAFT DROPDOWN */}
      <div className="space-y-1.5 relative" ref={dropdownRef}>
        <div className="flex items-center justify-between">
          <label className="block font-ui font-semibold text-sm text-ean-text-light">
            Aircraft
          </label>
          <button
            type="button"
            onClick={() => {
              setIsManualMode(!isManualMode)
              if (!isManualMode) {
                onSelectAircraft(null)
              }
            }}
            className="text-xs font-ui text-ean-gold hover:underline flex items-center gap-1 font-medium"
          >
            <PenLine className="w-3 h-3" />
            {isManualMode ? 'Select from list' : 'Enter manual MTOW'}
          </button>
        </div>

        {isManualMode ? (
          <div>
            <input
              type="number"
              value={manualMtow ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null
                onSetManualMtow(val)
              }}
              placeholder="e.g. 24300 (kg)"
              className="w-full px-4 py-3 bg-white border border-ean-border-light font-ui text-sm text-ean-text-light focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors"
            />
          </div>
        ) : (
          <div>
            {/* DROPDOWN TRIGGER BUTTON */}
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-4 py-3 bg-white border border-ean-border-light font-ui text-sm text-ean-text-light flex items-center justify-between shadow-xs hover:border-ean-blue transition-colors"
            >
              <span className="font-semibold truncate text-ean-text-light">
                {aircraft?.name || 'Embraer Legacy 650'}
              </span>
              <ChevronDown className={`w-4 h-4 text-ean-muted-light transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN MENU OVERLAY */}
            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-ean-border-light p-3 z-30 space-y-2 animate-fadeIn">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ean-muted-light" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search aircraft model or ICAO code..."
                    className="w-full pl-9 pr-4 py-2 bg-ean-surface border border-ean-border-light text-xs font-ui focus:outline-none focus:border-ean-blue"
                    autoFocus
                  />
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                  {aircraftResults.length === 0 ? (
                    <div className="p-3 text-xs font-ui text-ean-muted-light text-center">
                      No matching aircraft found. Try typing or enter manual MTOW.
                    </div>
                  ) : (
                    aircraftResults.map((item) => {
                      const isSelected = aircraft?.id === item.id || aircraft?.name === item.name
                      return (
                        <button
                          key={item.id || item.name}
                          type="button"
                          onClick={() => handleSelectAircraftItem(item)}
                          className={`w-full text-left p-2.5 text-xs font-ui flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-ean-gold-muted text-ean-text-light font-semibold' : 'hover:bg-gray-50 text-ean-text-light'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-[11px] text-ean-muted-light">
                              {item.category || item.manufacturer} · {item.mtow_kg ? `${item.mtow_kg.toLocaleString()} kg` : 'N/A'}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-ean-text-light" />}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HELPER TEXT WITH DYNAMIC MTOW AND BAND RANGE */}
        <p className="text-xs font-ui text-ean-muted-light mt-1">
          {mtowText}
        </p>
      </div>

      {/* PARAMETERS GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* FIELD 2: LOCATION */}
        <div className="space-y-2">
          <label className="block font-ui font-semibold text-sm text-ean-text-light">
            Location
          </label>
          <div className="inline-flex p-0.5 bg-white border border-ean-border-light overflow-hidden w-full sm:w-auto">
            <button
              type="button"
              aria-pressed={location === 'LOS'}
              onClick={() => onChangeLocation('LOS')}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-xs md:text-sm font-ui font-semibold transition-all ${
                location === 'LOS'
                  ? 'bg-ean-gold text-ean-text-dark shadow-xs'
                  : 'bg-transparent text-ean-text-light hover:bg-gray-50'
              }`}
            >
              Lagos
            </button>
            <button
              type="button"
              aria-pressed={location === 'ABV'}
              onClick={() => onChangeLocation('ABV')}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-xs md:text-sm font-ui font-semibold transition-all ${
                location === 'ABV'
                  ? 'bg-ean-gold text-ean-text-dark shadow-xs'
                  : 'bg-transparent text-ean-text-light hover:bg-gray-50'
              }`}
            >
              Abuja
            </button>
          </div>
        </div>

        {/* FIELD 3: OPERATION */}
        <div className="space-y-2">
          <label className="block font-ui font-semibold text-sm text-ean-text-light">
            Operation
          </label>
          <div className="inline-flex p-0.5 bg-white border border-ean-border-light overflow-hidden w-full sm:w-auto">
            <button
              type="button"
              aria-pressed={operation === 'dom'}
              onClick={() => handleOperationSelect('dom')}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-xs md:text-sm font-ui font-semibold transition-all ${
                operation === 'dom'
                  ? 'bg-ean-gold text-ean-text-dark shadow-xs'
                  : 'bg-transparent text-ean-text-light hover:bg-gray-50'
              }`}
            >
              Domestic
            </button>
            <button
              type="button"
              aria-pressed={operation === 'intl'}
              onClick={() => handleOperationSelect('intl')}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-xs md:text-sm font-ui font-semibold transition-all ${
                operation === 'intl'
                  ? 'bg-ean-gold text-ean-text-dark shadow-xs'
                  : 'bg-transparent text-ean-text-light hover:bg-gray-50'
              }`}
            >
              International
            </button>
          </div>
        </div>

        {/* FIELD 4: MOVEMENT */}
        <div className="space-y-2">
          <label className="block font-ui font-semibold text-sm text-ean-text-light">
            Movement
          </label>
          <div className="inline-flex p-0.5 bg-white border border-ean-border-light overflow-hidden w-full sm:w-auto">
            <button
              type="button"
              aria-pressed={day === 'wd'}
              onClick={() => onChangeDay('wd')}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-xs md:text-sm font-ui font-semibold transition-all ${
                day === 'wd'
                  ? 'bg-ean-gold text-ean-text-dark shadow-xs'
                  : 'bg-transparent text-ean-text-light hover:bg-gray-50'
              }`}
            >
              Weekday
            </button>
            <button
              type="button"
              aria-pressed={day === 'we'}
              onClick={() => onChangeDay('we')}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-xs md:text-sm font-ui font-semibold transition-all ${
                day === 'we'
                  ? 'bg-ean-gold text-ean-text-dark shadow-xs'
                  : 'bg-transparent text-ean-text-light hover:bg-gray-50'
              }`}
            >
              Weekend
            </button>
          </div>
        </div>

        {/* FIELD 5: PASSENGERS */}
        <div className="space-y-1.5">
          <label className="block font-ui font-semibold text-sm text-ean-text-light">
            Passengers
          </label>
          <input
            type="number"
            min={0}
            max={60}
            value={pax}
            onChange={(e) => onChangePax(Math.min(60, Math.max(0, Number(e.target.value) || 0)))}
            className="w-full px-4 py-2.5 bg-white border border-ean-border-light font-ui text-sm text-ean-text-light focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors"
          />
          <p className="text-xs font-ui text-ean-muted-light">
            Estimate now. Final count is confirmed by the CRO on arrival.
          </p>
        </div>

        {/* FIELD 6: STAY */}
        <div className="space-y-2">
          <label className="block font-ui font-semibold text-sm text-ean-text-light">
            Stay
          </label>
          <div className="inline-flex p-0.5 bg-white border border-ean-border-light overflow-hidden w-full sm:w-auto">
            <button
              type="button"
              aria-pressed={stay === 'same'}
              onClick={() => onChangeStay('same')}
              className={`flex-1 sm:flex-none px-4 py-2.5 text-xs md:text-sm font-ui font-semibold transition-all ${
                stay === 'same'
                  ? 'bg-ean-gold text-ean-text-dark shadow-xs'
                  : 'bg-transparent text-ean-text-light hover:bg-gray-50'
              }`}
            >
              Same-day turnaround
            </button>
            <button
              type="button"
              aria-pressed={stay === 'over'}
              onClick={() => onChangeStay('over')}
              className={`flex-1 sm:flex-none px-4 py-2.5 text-xs md:text-sm font-ui font-semibold transition-all ${
                stay === 'over'
                  ? 'bg-ean-gold text-ean-text-dark shadow-xs'
                  : 'bg-transparent text-ean-text-light hover:bg-gray-50'
              }`}
            >
              Overnight
            </button>
          </div>

          {/* OVERNIGHT NIGHTS COUNTER */}
          {stay === 'over' && (
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-ui text-ean-muted-light font-medium">Nights:</span>
              <div className="flex items-center gap-2 bg-ean-surface p-1 border border-ean-border-light">
                <button
                  type="button"
                  onClick={() => onChangeNights(Math.max(1, nights - 1))}
                  className="w-7 h-7 bg-white text-ean-text-light flex items-center justify-center font-bold text-xs shadow-xs hover:bg-gray-100"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono font-bold text-sm text-ean-text-light px-2">{nights}</span>
                <button
                  type="button"
                  onClick={() => onChangeNights(nights + 1)}
                  className="w-7 h-7 bg-white text-ean-text-light flex items-center justify-center font-bold text-xs shadow-xs hover:bg-gray-100"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FIELD 7: HANDLING LEVEL — only Lagos prices as a range, and only in
            bands C, D and E. Elsewhere the toggle offers a choice between two
            identical figures, which reads as a discount the visitor cannot
            actually take. */}
        <div className={`space-y-2 ${location === 'LOS' && isBandedHandling(band) ? '' : 'hidden'}`}>
          <label className="block font-ui font-semibold text-sm text-ean-text-light">
            Handling level (band is a range)
          </label>
          <div className="inline-flex p-0.5 bg-white border border-ean-border-light overflow-hidden w-full sm:w-auto">
            <button
              type="button"
              aria-pressed={handling === 'standard'}
              onClick={() => onChangeHandling('standard')}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-xs md:text-sm font-ui font-semibold transition-all ${
                handling === 'standard'
                  ? 'bg-ean-gold text-ean-text-dark shadow-xs'
                  : 'bg-transparent text-ean-text-light hover:bg-gray-50'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              aria-pressed={handling === 'min'}
              onClick={() => onChangeHandling('min')}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-xs md:text-sm font-ui font-semibold transition-all ${
                handling === 'min'
                  ? 'bg-ean-gold text-ean-text-dark shadow-xs'
                  : 'bg-transparent text-ean-text-light hover:bg-gray-50'
              }`}
            >
              Floor
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
