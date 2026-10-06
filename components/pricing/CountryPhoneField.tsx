'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import type * as PhoneLibModule from 'libphonenumber-js/max'
import { ChevronDown } from 'lucide-react'

/**
 * libphonenumber-js with full metadata. The rate sheet imports it after
 * hydration and passes it down, so its 157 KB metadata file stays out of the
 * page bundle; until it arrives the field works from FALLBACK_DIAL_CODES.
 */
export type PhoneLib = typeof PhoneLibModule

export interface CountryOption {
  code: string
  name: string
  dial: string
}

interface CountryPhoneFieldProps {
  inputId: string
  describedBy: string
  lib: PhoneLib | null
  country: string
  onCountryChange: (code: string) => void
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  isInvalid: boolean
}

/** Enough to take a number before the full metadata has loaded. */
const FALLBACK_DIAL_CODES: Record<string, string> = {
  NG: '234', GH: '233', AE: '971', GB: '44', US: '1', ZA: '27', KE: '254', FR: '33',
  CM: '237', CI: '225', SN: '221', TG: '228', BJ: '229', EG: '20', MA: '212', DE: '49',
  CH: '41', SA: '966', QA: '974', IN: '91', CN: '86', TR: '90',
}

/** The operators EAN hears from most, listed above the alphabetical run. */
const PINNED = ['NG', 'GH', 'AE', 'GB', 'US', 'ZA', 'KE', 'FR']

/** Codes with a file in public/images/flags. Anything else gets a blank chip. */
const FLAG_CODES = new Set(
  'AC AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET EU FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU IC ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TA TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XA XC XK XO YE YT ZA ZM ZW'.split(' ')
)

const regionNames = (() => {
  try {
    const names = new Intl.DisplayNames(['en'], { type: 'region' })
    return (code: string) => {
      try {
        return names.of(code) ?? code
      } catch {
        return code
      }
    }
  } catch {
    return (code: string) => code
  }
})()

export function regionName(code: string): string {
  return regionNames(code)
}

export function dialCode(lib: PhoneLib | null, code: string): string | undefined {
  if (lib) {
    try {
      return lib.getCountryCallingCode(code as PhoneLibModule.CountryCode)
    } catch {
      // Not a code the metadata knows — fall through to the short list.
    }
  }
  return FALLBACK_DIAL_CODES[code]
}

export function countryOptions(lib: PhoneLib | null): CountryOption[] {
  const codes: string[] = lib ? lib.getCountries() : Object.keys(FALLBACK_DIAL_CODES)
  return codes
    .map((code) => ({ code, name: regionName(code), dial: dialCode(lib, code) ?? '' }))
    .filter((option) => option.dial !== '')
    .sort((a, b) => a.name.localeCompare(b.name))
}

function Flag({ code }: { code: string }) {
  const chip = 'w-[21px] h-[14px] flex-none rounded-[2px] shadow-[0_0_0_1px_var(--color-ean-border-light)]'
  if (!FLAG_CODES.has(code)) return <span className={`${chip} bg-ean-surface`} aria-hidden="true" />
  // Empty alt: the country name or code always sits beside the flag, so a
  // description would only make a screen reader say the country twice.
  return (
    <Image
      src={`/images/flags/${code}.svg`}
      alt=""
      width={21}
      height={14}
      className={`${chip} object-cover`}
    />
  )
}

export default function CountryPhoneField({
  inputId,
  describedBy,
  lib,
  country,
  onCountryChange,
  value,
  onValueChange,
  onBlur,
  isInvalid,
}: CountryPhoneFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const listId = `${inputId}-countries`
  const all = useMemo(() => countryOptions(lib), [lib])

  // With no query: the pinned operators, a rule, then everyone else. With a
  // query: one flat list of matches on name, dial code or ISO code.
  const { pinned, rest } = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '')
    if (q) {
      const matches = all.filter(
        (o) => o.name.toLowerCase().includes(q) || o.dial.startsWith(q) || o.code.toLowerCase() === q
      )
      return { pinned: [] as CountryOption[], rest: matches }
    }
    const pins = PINNED.map((code) => all.find((o) => o.code === code)).filter(
      (o): o is CountryOption => Boolean(o)
    )
    return { pinned: pins, rest: all.filter((o) => !PINNED.includes(o.code)) }
  }, [all, query])

  const selectable = useMemo(() => [...pinned, ...rest], [pinned, rest])
  const active = selectable[Math.min(activeIndex, selectable.length - 1)]

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
    listRef.current
      ?.querySelector(`[data-code="${active.code}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, active])

  const handleOpen = () => {
    setQuery('')
    // The same order the empty-query list renders in, so the current country
    // opens highlighted and scrolled into view.
    const order = [
      ...PINNED.filter((code) => all.some((o) => o.code === code)),
      ...all.filter((o) => !PINNED.includes(o.code)).map((o) => o.code),
    ]
    setActiveIndex(Math.max(0, order.indexOf(country)))
    setIsOpen(true)
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  const handleClose = (returnFocus: boolean) => {
    setIsOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  const handlePick = (code: string) => {
    onCountryChange(code)
    setIsOpen(false)
    phoneRef.current?.focus()
  }

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!selectable.length) return
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((i) => (i + step + selectable.length) % selectable.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (active) handlePick(active.code)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleClose(true)
    }
  }

  // An international number typed in full moves the flag with it.
  const handleValueChange = (next: string) => {
    onValueChange(next)
    const raw = next.trim()
    if (!lib || !raw.startsWith('+')) return
    try {
      const typer = new lib.AsYouType()
      typer.input(raw)
      const detected = typer.getCountry()
      if (detected && detected !== country) onCountryChange(detected)
    } catch {
      // Partial input the formatter cannot read yet.
    }
  }

  const dial = dialCode(lib, country) ?? ''
  const optionClass = (code: string) =>
    `flex items-center gap-2.5 px-2 py-[7px] rounded-md cursor-pointer text-sm ${
      active?.code === code ? 'bg-ean-blue-muted' : ''
    }`

  const renderOption = (o: CountryOption) => (
    <li
      key={o.code}
      id={`${listId}-${o.code}`}
      data-code={o.code}
      role="option"
      aria-selected={active?.code === o.code}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => handlePick(o.code)}
      className={optionClass(o.code)}
    >
      <Flag code={o.code} />
      <span className="flex-1 min-w-0 truncate">{o.name}</span>
      <span className="font-mono text-[12.5px] text-ean-slate">+{o.dial}</span>
    </li>
  )

  return (
    <div
      ref={wrapRef}
      className={`relative flex rounded-lg border bg-ean-navy focus-within:outline-2 focus-within:outline-ean-gold-light focus-within:border-transparent ${
        isInvalid ? 'border-ean-error' : 'border-ean-border-light'
      }`}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? handleClose(true) : handleOpen())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-label={`Country code: ${regionName(country)} +${dial}`}
        className="flex items-center gap-[7px] pl-3 pr-2.5 border-r border-ean-border-light rounded-l-lg font-mono text-sm text-ean-text-light whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ean-gold-light"
      >
        <Flag code={country} />
        <span>+{dial}</span>
        <ChevronDown className="w-3 h-3 text-ean-slate" aria-hidden="true" />
      </button>

      <input
        ref={phoneRef}
        id={inputId}
        name="phone"
        type="tel"
        autoComplete="tel-national"
        inputMode="tel"
        placeholder={country === 'NG' ? '803 123 4567' : 'Phone number'}
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={isInvalid}
        aria-describedby={describedBy}
        className="flex-1 min-w-0 bg-transparent px-3 py-2.5 font-mono text-[14.5px] text-ean-text-light placeholder:text-ean-text-light/20 outline-none"
      />

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-[min(360px,calc(100vw-48px))] bg-ean-white border border-ean-border-light rounded-[10px] shadow-ean-gold-strong overflow-hidden ean-enter-fade">
          <input
            ref={searchRef}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active ? `${listId}-${active.code}` : undefined}
            aria-label="Search countries"
            placeholder="Search country or code"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleSearchKey}
            className="w-full px-3 py-[11px] border-b border-ean-border-light font-ui text-sm text-ean-text-light placeholder:text-ean-slate outline-none"
          />
          <ul ref={listRef} id={listId} role="listbox" aria-label="Countries" className="max-h-[260px] overflow-auto p-1 m-0 list-none">
            {selectable.length === 0 && (
              <li className="px-3 py-3 text-[13px] text-ean-slate">No country matches that search.</li>
            )}
            {pinned.map(renderOption)}
            {pinned.length > 0 && rest.length > 0 && (
              <li role="presentation" className="h-px my-1 mx-1.5 bg-ean-border-light" />
            )}
            {rest.map(renderOption)}
          </ul>
        </div>
      )}
    </div>
  )
}
