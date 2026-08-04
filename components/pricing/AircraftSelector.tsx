'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery }                    from '@tanstack/react-query'
import { Search, Loader2, AlertCircle, PenLine, Plane, ChevronDown } from 'lucide-react'
import type { Aircraft }               from '@/types/pricing'

interface AircraftSelectorProps {
  value?:           Aircraft | null
  selectedAircraft?: Aircraft | null
  onSelect?:        (aircraft: Aircraft | null) => void
  onSelectAircraft?:(aircraft: Aircraft | null) => void
  onManualMtow?:    (mtow: number | null) => void
  onSetManualMtow?: (mtow: number | null) => void
  manualMtow:      number | null
}

export default function AircraftSelector({
  value: propValue,
  selectedAircraft,
  onSelect: propOnSelect,
  onSelectAircraft,
  onManualMtow: propOnManualMtow,
  onSetManualMtow,
  manualMtow,
}: AircraftSelectorProps) {
  const value = propValue !== undefined ? propValue : (selectedAircraft ?? null)
  const onSelect = propOnSelect ?? onSelectAircraft ?? (() => {})
  const onManualMtow = propOnManualMtow ?? onSetManualMtow ?? (() => {})

  const [query,       setQuery]       = useState('')
  const [debouncedQ,  setDebouncedQ]  = useState('')
  const [isOpen,      setIsOpen]      = useState(false)
  const [manualMode,  setManualMode]  = useState(false)
  const inputRef  = useRef<HTMLInputElement>(null)
  const dropRef   = useRef<HTMLDivElement>(null)

  // Debounce — wait 350ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 350)
    return () => clearTimeout(t)
  }, [query])

  // TanStack Query — fetches initial fleet or live search results
  const { data, isFetching, isError } = useQuery({
    queryKey:  ['aircraft', debouncedQ],
    queryFn:   async () => {
      const res  = await fetch(`/api/aircraft/search?q=${encodeURIComponent(debouncedQ)}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to search aircraft')
      return json.data as Aircraft[]
    },
    staleTime: 1000 * 60 * 60 * 24,  // 24 hours
    retry:     1,
  })

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (aircraft: Aircraft) => {
    onSelect(aircraft)
    setQuery(aircraft.name)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(null)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // ── MANUAL MODE ──
  if (manualMode) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-ean-border-light space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-xl text-ean-navy flex items-center gap-2">
            <Plane className="w-5 h-5 text-ean-gold" />
            1. Select Aircraft (Manual MTOW)
          </h3>
          <span className="text-xs font-ui uppercase tracking-wider text-ean-gold bg-ean-gold/10 px-2.5 py-1 rounded-full font-semibold">
            Step 1 of 4
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-ui text-ean-muted-dark mb-1 font-medium">Aircraft MTOW (kg)</label>
            <input
              type="number"
              placeholder="e.g. 17145"
              value={manualMtow ?? ''}
              onChange={(e) => {
                if (!e.target.value) {
                  onManualMtow(null)
                } else {
                  const val = Number(e.target.value)
                  const clamped = Math.min(Math.max(val, 500), 600000)
                  onManualMtow(clamped)
                }
              }}
              min={500}
              max={600000}
              className="w-full px-4 py-3 bg-ean-surface border border-ean-border-light rounded-lg text-ean-navy text-sm font-ui focus:outline-none focus:border-ean-gold focus:ring-1 focus:ring-ean-gold transition-colors"
            />
            {manualMtow ? (
              <p className="mt-2 text-sm text-ean-gold font-medium">
                → Specified MTOW: {manualMtow.toLocaleString()} kg
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => { setManualMode(false); onManualMtow(null) }}
            className="text-sm text-ean-gold underline underline-offset-2 hover:text-ean-gold-light font-medium"
          >
            ← Select from aircraft dropdown instead
          </button>
        </div>
      </div>
    )
  }

  // ── SEARCH & DROPDOWN MODE ──
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-ean-border-light space-y-4" ref={dropRef}>
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-xl text-ean-navy flex items-center gap-2">
          <Plane className="w-5 h-5 text-ean-gold" />
          1. Select Aircraft
        </h3>
        <span className="text-xs font-ui uppercase tracking-wider text-ean-gold bg-ean-gold/10 px-2.5 py-1 rounded-full font-semibold">
          Step 1 of 4
        </span>
      </div>

      <div className="space-y-3 relative">
        {/* Dropdown / Search Input */}
        <div className="relative cursor-pointer">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Click to choose or search aircraft (e.g. Gulfstream, Phenom 300)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
              if (!e.target.value) onSelect(null)
            }}
            onClick={() => setIsOpen(true)}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-10 pr-12 py-3 bg-ean-surface border border-ean-border-light rounded-lg text-ean-navy text-sm font-ui focus:outline-none focus:border-ean-gold focus:ring-1 focus:ring-ean-gold transition-colors cursor-pointer"
          />

          {/* Right controls: Loading / Clear / Toggle Arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isFetching && <Loader2 className="w-4 h-4 text-ean-gold animate-spin" />}
            {query && !isFetching && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none p-0.5"
                title="Clear selection"
              >
                ×
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-ean-gold p-1 focus:outline-none"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-ean-gold' : ''}`} />
            </button>
          </div>
        </div>

        {/* Floating Dropdown menu */}
        {isOpen && (
          <div className="absolute z-30 left-0 right-0 w-full bg-white border border-ean-border-light rounded-lg shadow-xl mt-1 max-h-72 overflow-y-auto divide-y divide-gray-100">

            {/* Sub-header */}
            <div className="px-4 py-2 bg-ean-surface text-[11px] font-ui font-semibold text-ean-muted-dark uppercase tracking-wider sticky top-0 border-b border-ean-border-light flex items-center justify-between">
              <span>{debouncedQ.length >= 2 ? `Search Results for "${query}"` : 'Select from Business Aviation Fleet'}</span>
              {data && <span className="text-ean-gold">{data.length} Models</span>}
            </div>

            {/* Error state */}
            {isError && (
              <div className="flex items-center gap-2 p-4 text-sm text-amber-700 bg-amber-50">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Aircraft service unavailable.{' '}
                  <button
                    type="button"
                    onClick={() => { setManualMode(true); setIsOpen(false) }}
                    className="underline font-medium"
                  >
                    Enter MTOW manually
                  </button>
                </span>
              </div>
            )}

            {/* Loading initial */}
            {isFetching && !data && (
              <div className="flex items-center gap-2 p-4 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-ean-gold" />
                Fetching aircraft fleet from API...
              </div>
            )}

            {/* Results List */}
            {data && data.length > 0 && data.map((aircraft) => {
              const isSelected = value?.id === aircraft.id
              return (
                <button
                  key={aircraft.id}
                  type="button"
                  onClick={() => handleSelect(aircraft)}
                  className={`w-full text-left px-4 py-3 hover:bg-ean-surface
                             border-b border-gray-100 last:border-0
                             transition-colors duration-100 flex items-center justify-between group ${
                               isSelected ? 'bg-ean-gold/10 font-semibold' : ''
                             }`}
                >
                  <div>
                    <p className={`font-medium text-sm ${isSelected ? 'text-ean-gold' : 'text-gray-900 group-hover:text-ean-gold'} transition-colors`}>
                      {aircraft.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {aircraft.manufacturer} {aircraft.range_nm ? `· ${aircraft.range_nm.toLocaleString()} nm range` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right ml-3">
                    <span className="inline-block bg-ean-gold/10 text-ean-gold
                                     text-xs font-semibold px-2.5 py-1 rounded-full">
                      {aircraft.mtow_kg ? `${aircraft.mtow_kg.toLocaleString()} kg` : 'N/A'}
                    </span>
                  </div>
                </button>
              )
            })}

            {/* No results */}
            {data && data.length === 0 && !isFetching && (
              <div className="p-4 text-sm text-gray-500 space-y-2">
                <p>No matching aircraft found for &quot;{query}&quot;</p>
                <button
                  type="button"
                  onClick={() => { setManualMode(true); setIsOpen(false) }}
                  className="flex items-center gap-1.5 text-ean-gold
                             underline underline-offset-2 font-medium"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Enter MTOW manually instead
                </button>
              </div>
            )}

          </div>
        )}

        {/* Selected aircraft summary card */}
        {value && value.mtow_kg && (
          <div className="border-l-4 border-ean-gold bg-ean-navy text-white rounded-r-lg px-4 py-3 space-y-1 shadow-inner mt-3">
            <p className="font-semibold text-ean-gold text-base">{value.name}</p>
            <p className="text-xs text-ean-muted-light">{value.manufacturer}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/90">
              <span>MTOW: <strong>{value.mtow_kg.toLocaleString()} kg</strong></span>
              {value.range_nm && <span>Range: <strong>{value.range_nm.toLocaleString()} nm</strong></span>}
              {value.wingspan_m && <span>Wingspan: <strong>{value.wingspan_m} m</strong></span>}
            </div>
          </div>
        )}

        {/* Manual entry toggle */}
        {!value && (
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className="flex items-center gap-1.5 text-xs text-gray-500
                       hover:text-ean-gold transition-colors font-medium mt-1"
          >
            <PenLine className="w-3.5 h-3.5" />
            Enter MTOW manually instead
          </button>
        )}

      </div>
    </div>
  )
}
