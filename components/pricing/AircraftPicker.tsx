'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AlertCircle, ChevronDown, Loader2, Search } from 'lucide-react'
import type { Aircraft } from '@/types/pricing'
import { formatKg, type PickedAircraft } from '@/lib/pricing/quote'

interface AircraftPickerProps {
  jet: PickedAircraft | null
  onPick: (jet: PickedAircraft) => void
  /** "Aircraft not listed?" — switch this aircraft to a typed MTOW. */
  onManual: () => void
  /** Bump to open the list from outside, e.g. right after adding an aircraft. */
  openRequest: number
  describedBy: string
}

const LIST_ID = 'aircraft-options'
const optionId = (index: number) => `${LIST_ID}-${index}`

/** Wait this long after the last keystroke before asking the API. */
const DEBOUNCE_MS = 350

/** The first word of a manufacturer — "Gulfstream" of "Gulfstream Aerospace". */
const brandOf = (manufacturer: string) => manufacturer.trim().split(/\s+/)[0] ?? ''

/**
 * /api/aircraft/search returns the curated fleet for an empty query, and adds
 * live API Ninjas results for a longer one. Rows without a usable MTOW cannot
 * be banded, so they are left out. Curated names carry the brand ("Gulfstream
 * G650"); API Ninjas names are the bare model, so the brand is put in front.
 */
function toPicked(rows: Aircraft[]): PickedAircraft[] {
  const picked: PickedAircraft[] = []
  rows.forEach((row) => {
    if (!row.mtow_kg || row.mtow_kg <= 0) return
    const brand = brandOf(row.manufacturer)
    const hasBrand = brand && row.name.toLowerCase().startsWith(brand.toLowerCase())
    const name = hasBrand || !brand ? row.name : `${brand} ${row.name}`
    picked.push({
      id: row.id,
      name,
      model: hasBrand ? row.name.slice(brand.length).trim() || row.name : row.name,
      manufacturer: row.manufacturer,
      icao: row.icao_code ?? null,
      mtowKg: Math.round(row.mtow_kg),
    })
  })
  // Grouped by manufacturer as the list reads.
  return picked.sort((a, b) => a.manufacturer.localeCompare(b.manufacturer) || a.name.localeCompare(b.name))
}

type Load = { state: 'loading' } | { state: 'ready'; items: PickedAircraft[] } | { state: 'error'; message: string }

export default function AircraftPicker({ jet, onPick, onManual, openRequest, describedBy }: AircraftPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [activeIndex, setActiveIndex] = useState(0)

  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const matches = load.state === 'ready' ? load.items : []
  const active = matches[Math.min(activeIndex, matches.length - 1)]

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  // Fetched only while the list is open, so a visitor who never opens it costs
  // the rate-limited endpoint nothing.
  useEffect(() => {
    if (!isOpen) return
    const controller = new AbortController()
    fetch(`/api/aircraft/search?q=${encodeURIComponent(debounced)}`, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.success) throw new Error(json?.error ?? 'Could not load aircraft.')
        setLoad({ state: 'ready', items: toPicked(json.data as Aircraft[]) })
        setActiveIndex(0)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setLoad({ state: 'error', message: err instanceof Error ? err.message : 'Could not load aircraft.' })
      })
    return () => controller.abort()
  }, [isOpen, debounced])

  const open = () => {
    setQuery('')
    setActiveIndex(0)
    setIsOpen(true)
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  const close = (returnFocus: boolean) => {
    setIsOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  const pick = (choice: PickedAircraft) => {
    onPick(choice)
    close(true)
  }

  // Opened from outside: a newly added aircraft goes straight to its list. The
  // ref holds the request already handled, so mounting does not open it.
  const handledRequest = useRef(openRequest)
  useEffect(() => {
    if (openRequest === handledRequest.current) return
    handledRequest.current = openRequest
    open()
  }, [openRequest])

  useEffect(() => {
    if (!isOpen) return
    const handlePointer = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    return () => document.removeEventListener('mousedown', handlePointer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !active) return
    listRef.current?.querySelector(`[data-id="${CSS.escape(active.id)}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, active])

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!matches.length) return
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((i) => (i + step + matches.length) % matches.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (active) pick(active)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
    }
  }

  const isSearching = load.state === 'loading' || query.trim() !== debounced

  const rows: React.ReactNode[] = []
  let lastMaker = ''
  matches.forEach((option, index) => {
    if (option.manufacturer !== lastMaker) {
      lastMaker = option.manufacturer
      rows.push(
        <li
          key={`group-${option.manufacturer}`}
          role="presentation"
          className="px-2.5 pt-2.5 pb-1 font-mono text-[10.5px] tracking-[.1em] uppercase text-ean-slate"
        >
          {option.manufacturer}
        </li>
      )
    }
    const isActive = active?.id === option.id
    rows.push(
      <li
        key={option.id}
        id={optionId(index)}
        data-id={option.id}
        role="option"
        aria-selected={isActive}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => pick(option)}
        onMouseMove={() => setActiveIndex(index)}
        className={`grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-md px-2.5 py-2 font-ui text-sm cursor-pointer ${
          isActive ? 'bg-ean-blue-tint' : ''
        }`}
      >
        <span className="truncate">{option.name}</span>
        <span className="font-mono text-xs text-ean-gold">{option.icao ?? ''}</span>
        <span className="min-w-[76px] text-right font-mono text-xs text-ean-slate">{formatKg(option.mtowKg)} kg</span>
      </li>
    )
  })

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close(true) : open())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? LIST_ID : undefined}
        aria-describedby={describedBy}
        className="w-full flex items-center justify-between gap-3 rounded-lg border border-ean-border-light bg-ean-white px-[18px] py-3.5 text-left text-ean-text-light cursor-pointer transition-colors hover:border-ean-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ean-gold-light"
      >
        <span className="flex flex-wrap items-baseline gap-2.5 min-w-0">
          {jet ? (
            <>
              <span className="font-ui font-semibold text-[16.5px]">{jet.name}</span>
              {jet.icao && (
                <span className="rounded bg-ean-blue-tint px-1.5 py-px font-mono text-xs text-ean-gold">{jet.icao}</span>
              )}
            </>
          ) : (
            <span className="font-ui text-[15.5px] text-ean-slate">Select your aircraft</span>
          )}
        </span>
        <ChevronDown className="w-[18px] h-[18px] flex-none text-ean-muted-light" strokeWidth={2.2} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-[10px] border border-ean-border-light bg-ean-white shadow-ean-gold-strong ean-enter-fade">
          <div className="flex items-center gap-2 border-b border-ean-border-light px-3">
            {isSearching ? (
              <Loader2 className="w-[17px] h-[17px] flex-none animate-spin text-ean-slate" aria-hidden="true" />
            ) : (
              <Search className="w-[17px] h-[17px] flex-none text-ean-slate" aria-hidden="true" />
            )}
            <input
              ref={searchRef}
              type="search"
              role="combobox"
              aria-expanded="true"
              aria-controls={LIST_ID}
              aria-autocomplete="list"
              aria-busy={isSearching}
              aria-activedescendant={active ? optionId(matches.indexOf(active)) : undefined}
              aria-label="Search aircraft"
              placeholder="Search by name or ICAO code, e.g. Global 6000 or GLEX"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 min-w-0 bg-transparent py-3 font-ui text-[14.5px] text-ean-text-light placeholder:text-ean-slate outline-none"
            />
          </div>
          <ul ref={listRef} id={LIST_ID} role="listbox" aria-label="Business aircraft" className="m-0 max-h-80 list-none overflow-auto p-1">
            {load.state === 'error' ? (
              <li className="flex items-center gap-2 p-3.5 font-ui text-[13.5px] text-ean-error">
                <AlertCircle className="w-4 h-4 flex-none" aria-hidden="true" />
                {load.message} Enter the MTOW manually below instead.
              </li>
            ) : load.state === 'loading' ? (
              <li className="p-3.5 font-ui text-[13.5px] text-ean-slate">Loading aircraft…</li>
            ) : rows.length ? (
              rows
            ) : (
              <li className="p-3.5 font-ui text-[13.5px] text-ean-slate">
                No aircraft matches “{debounced}”. Try the ICAO code, or enter the MTOW manually below.
              </li>
            )}
          </ul>
          <button
            type="button"
            onClick={() => {
              close(false)
              onManual()
            }}
            className="w-full border-t border-ean-border-light bg-ean-navy px-3.5 py-[11px] text-left font-ui text-[13.5px] text-ean-gold cursor-pointer hover:underline"
          >
            Aircraft not listed? Enter MTOW manually
          </button>
        </div>
      )}
    </div>
  )
}
