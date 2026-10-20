'use client'

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { Check, Download, Loader2, Mail, PenLine, Plus, X } from 'lucide-react'
import type { LeadDetails } from '@/types/pricing'
import SectionReveal from '@/components/shared/SectionReveal'
import { getTrackingContext } from '@/lib/lead-tracking'
import {
  getRevealServerSnapshot,
  getRevealSnapshot,
  grantReveal,
  isLeadAlreadyCaptured,
  markLeadCaptured,
  revokeReveal,
  subscribeToReveal,
} from '@/lib/pricing/reveal-store'
import { ISSUED_LABEL, SCHEDULE_DOCUMENT } from '@/lib/pricing/rate-schedule'
import {
  MAX_AIRCRAFT,
  MAX_QUANTITY,
  MTOW_MAX_KG,
  MTOW_MIN_KG,
  QUOTE_SECTIONS,
  aircraftShortName,
  bandOf,
  bandText,
  formatKg,
  jetOf,
  mtowOf,
  newAircraft,
  newQuoteNumber,
  pendingFleet,
  priceFleet,
  quantityWord,
  quoteDate,
  quoteHeading,
  quoteLeadMessage,
  quotePlainText,
  quoteValue,
  selectedCount,
  type QuoteAircraft,
} from '@/lib/pricing/quote'
import AircraftPicker from './AircraftPicker'
import QuoteDocument, { QUOTE_LOGO_SRC } from './QuoteDocument'
import QuoteGate, { GATE_ID, GATE_NAME_ID, type GateSubmission } from './QuoteGate'
import type { PhoneLib } from './CountryPhoneField'

type Status = { tone: 'ok' | 'warn'; text: string } | null

const STEPS = ['Aircraft', 'Services', 'Your details', 'View & download']
const HEADLINE = ['Build', 'your', 'quote']
const AC_META_ID = 'aircraft-meta'

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export default function QuoteBuilder() {
  const { revealed, lead, quote: stamp } = useSyncExternalStore(
    subscribeToReveal,
    getRevealSnapshot,
    getRevealServerSnapshot
  )

  const nextId = useRef(2)
  const [fleet, setFleet] = useState<QuoteAircraft[]>(() => [newAircraft(1)])
  const [activeIndex, setActiveIndex] = useState(0)
  const [openRequest, setOpenRequest] = useState(0)

  const [phoneLib, setPhoneLib] = useState<PhoneLib | null>(null)
  const [gateKey, setGateKey] = useState(0)
  const [prefill, setPrefill] = useState<LeadDetails | null>(null)
  const [status, setStatus] = useState<Status>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const paperRef = useRef<HTMLDivElement>(null)
  const acCardRef = useRef<HTMLElement>(null)

  // Phone metadata after hydration rather than in the bundle — see
  // CountryPhoneField. A failed load leaves the form on its length check.
  useEffect(() => {
    let isLive = true
    import('libphonenumber-js/max')
      .then((mod) => {
        if (isLive) setPhoneLib(mod)
      })
      .catch(() => {
        // Offline or blocked chunk — the form keeps working on its fallback.
      })
    return () => {
      isLive = false
    }
  }, [])

  useEffect(() => {
    if (!status || status.tone === 'warn') return
    const timer = setTimeout(() => setStatus(null), 6000)
    return () => clearTimeout(timer)
  }, [status])

  const active = fleet[activeIndex]
  const isFleet = fleet.length > 1
  const priced = priceFleet(fleet)
  const pending = pendingFleet(fleet)
  const totalSelected = fleet.reduce((sum, aircraft) => sum + selectedCount(aircraft), 0)
  const isUnlocked = revealed && Boolean(lead) && Boolean(stamp)

  // ---- fleet -------------------------------------------------------------

  const updateActive = (change: (aircraft: QuoteAircraft) => QuoteAircraft) =>
    setFleet((prev) => prev.map((aircraft, i) => (i === activeIndex ? change(aircraft) : aircraft)))

  const addAircraft = () => {
    if (fleet.length >= MAX_AIRCRAFT) return
    const id = nextId.current++
    setFleet((prev) => [...prev, newAircraft(id)])
    setActiveIndex(fleet.length)
    acCardRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
    // After the scroll has started, so opening the list does not jump the page.
    setTimeout(() => setOpenRequest((n) => n + 1), 300)
  }

  const removeAircraft = (index: number) => {
    setFleet((prev) => prev.filter((_, i) => i !== index))
    setActiveIndex((current) => (current > index || current >= fleet.length - 1 ? Math.max(0, current - 1) : current))
  }

  const setMode = (mode: QuoteAircraft['mode']) => {
    updateActive((aircraft) => {
      const jet = aircraft.jet
      // Switching to manual starts from the chosen type's weight, so a visitor
      // correcting a figure does not have to retype it.
      return {
        ...aircraft,
        mode,
        mtowInput: mode === 'manual' && jet && !aircraft.mtowInput ? String(jet.mtowKg) : aircraft.mtowInput,
      }
    })
    if (mode === 'manual') {
      requestAnimationFrame(() => document.getElementById('mtow')?.focus())
    } else {
      // A frame later, once the picker has mounted to hear the request.
      requestAnimationFrame(() => setOpenRequest((n) => n + 1))
    }
  }

  // ---- services ----------------------------------------------------------

  const toggleService = (id: string) =>
    updateActive((aircraft) => {
      const selected = { ...aircraft.selected }
      if (selected[id]) delete selected[id]
      else selected[id] = 1
      return { ...aircraft, selected }
    })

  const setQuantity = (id: string, value: number) => {
    const quantity = Math.min(MAX_QUANTITY, Math.max(1, Math.round(value) || 1))
    updateActive((aircraft) =>
      aircraft.selected[id] ? { ...aircraft, selected: { ...aircraft.selected, [id]: quantity } } : aircraft
    )
  }

  // ---- gate --------------------------------------------------------------

  const goToGate = () => {
    document.getElementById(GATE_ID)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
    // After the scroll has started, so focusing does not jump the page first.
    setTimeout(() => document.getElementById(GATE_NAME_ID)?.focus({ preventScroll: true }), 350)
  }

  const handleSubmit = async ({ lead: next, phoneRegion, honeypot }: GateSubmission): Promise<string | null> => {
    const now = new Date()
    const quoteNo = newQuoteNumber(now)
    const unlock = () => {
      grantReveal(next, { number: quoteNo, date: quoteDate(now) })
      requestAnimationFrame(() =>
        document.getElementById('quote-unlocked')?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
      )
      return null
    }

    // An email that already produced a lead in this tab unlocks again without
    // filing a second one. See lib/pricing/reveal-store.ts.
    if (isLeadAlreadyCaptured(next.email)) return unlock()

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: next.name,
          email: next.email,
          phone: next.phone,
          company: next.company,
          service: 'fbo',
          message: quoteLeadMessage(priced, quoteNo, phoneRegion),
          // The quote's own total, so the CRM pipeline value reflects it rather
          // than a flat per-service estimate.
          estimatedValue: quoteValue(priced),
          tracking: getTrackingContext('pricing_quote_builder_gate'),
          website: honeypot,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        return data?.error ?? 'Could not submit your details. Please try again.'
      }
      markLeadCaptured(next.email)
      return unlock()
    } catch {
      return 'Network error submitting your details. Please try again.'
    }
  }

  const handleChangeDetails = () => {
    setPrefill(lead)
    // A fresh key remounts the form, so it starts from `prefill` rather than
    // from whatever it held before the unlock.
    setGateKey((k) => k + 1)
    setStatus(null)
    revokeReveal()
    requestAnimationFrame(goToGate)
  }

  // ---- outputs -----------------------------------------------------------

  const handleDownload = async () => {
    if (!lead || !stamp) return
    setStatus(null)
    setIsDownloading(true)
    try {
      const { downloadQuotePdf } = await import('@/lib/pricing/quote-pdf')
      const filename = await downloadQuotePdf({ priced, recipient: lead, quoteNo: stamp.number })
      setStatus({ tone: 'ok', text: `Downloaded ${filename}` })
    } catch {
      setStatus({ tone: 'warn', text: 'The PDF could not be created. Check your connection and try again.' })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopy = async () => {
    const paper = paperRef.current
    if (!paper || !lead || !stamp) return
    // The logo has to be an absolute URL once it lands in someone's inbox.
    const html = `<div style="font-family:Helvetica,Arial,sans-serif;color:#1f1f23;max-width:680px">${paper.innerHTML
      .split(`src="${QUOTE_LOGO_SRC}"`)
      .join(`src="${window.location.origin}${QUOTE_LOGO_SRC}"`)}</div>`
    const text = quotePlainText(priced, lead, stamp.number, stamp.date)
    const done = (ok: boolean) =>
      setStatus(
        ok
          ? { tone: 'ok', text: 'Quote copied. Paste it into a new email in Outlook or Gmail.' }
          : { tone: 'warn', text: 'Copy was blocked by this browser. Select the quote below and copy it manually.' }
      )

    try {
      if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) throw new Error('No rich clipboard')
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ])
      done(true)
    } catch {
      // Older browsers: copy the rendered quote through a selection instead.
      const box = document.createElement('div')
      box.innerHTML = html
      box.style.cssText = 'position:fixed;left:-9999px;top:0;background:#fff'
      document.body.appendChild(box)
      const range = document.createRange()
      range.selectNodeContents(box)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      let ok = false
      try {
        ok = document.execCommand('copy')
      } catch {
        ok = false
      }
      selection?.removeAllRanges()
      box.remove()
      done(ok)
    }
  }

  // ---- derived copy ------------------------------------------------------

  const jet = jetOf(active)
  const kg = mtowOf(active)
  const band = bandOf(active)
  const isManual = active.mode === 'manual'
  const activeCount = selectedCount(active)

  const heading = quoteHeading(
    priced.length
      ? priced
      : fleet.map((aircraft, i) => ({ aircraft, number: i + 1 })).filter(({ aircraft }) => mtowOf(aircraft))
  )
  const previewRows = priced.flatMap((group) => group.lines.map((line) => line.item.name)).slice(0, 8)
  const isReady = priced.length > 0 && pending.length === 0
  const gateHint = pending.length
    ? `Choose the aircraft type or MTOW for Aircraft ${pending[0].number} to price its services.`
    : !fleet.some((aircraft) => mtowOf(aircraft))
      ? 'Select an aircraft or enter its MTOW above to enable pricing.'
      : !priced.length
        ? 'Select at least one service to build your quote.'
        : 'Your quote is ready. Enter your details to see it.'

  return (
    <div className="bg-ean-navy text-ean-text-light">
      {/* HERO — photography with a dark scrim, so literal white type (AGENTS.md
          §5). The photograph is decorative; the h1 carries the meaning. */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <Image
            src="/images/pricing-hero-apron.jpg"
            alt=""
            fill
            sizes="100vw"
            quality={70}
            priority
            /* The jet sits right of centre; the copy takes the dark left side. */
            className="ean-photo-settle object-cover object-[78%_60%] sm:object-[70%_58%]"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/70 via-42% to-black/40" />
          <div className="absolute inset-0 bg-linear-to-t from-black/55 to-transparent to-45%" />
        </div>

        <div className="max-w-ean mx-auto px-6 pt-32 pb-10 md:pt-40 md:pb-[84px] grid gap-2.5">
          <span className="ean-rise font-mono text-[11px] tracking-[.12em] uppercase text-ean-muted-dark">
            EAN Jet Center · Pricing
          </span>
          <h1
            aria-label={HEADLINE.join(' ')}
            className="m-0 overflow-hidden pb-[.08em] font-display font-light text-[clamp(28px,4.4vw,40px)] leading-[1.08] tracking-[-.01em]"
          >
            {HEADLINE.map((word, i) => (
              <React.Fragment key={word}>
                {i > 0 && ' '}
                <span
                  aria-hidden="true"
                  className="ean-rise ean-rise-word"
                  style={{ animationDelay: `${0.12 + i * 0.09}s` }}
                >
                  {word}
                </span>
              </React.Fragment>
            ))}
          </h1>
          <p className="ean-rise ean-rise-delay-2 m-0 max-w-[64ch] font-ui text-[15px] leading-relaxed text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,.4)]">
            Choose your aircraft and the services you need at Lagos, Abuja or our outstations. Your quotation builds
            alongside as you go.
          </p>
          <ol className="m-0 mt-1.5 flex list-none flex-wrap gap-[18px] p-0 font-ui text-[13px] text-white/85">
            {STEPS.map((step, i) => (
              <li
                key={step}
                className="ean-rise inline-flex items-center gap-2"
                style={{ animationDelay: `${0.55 + i * 0.08}s` }}
              >
                <b className="inline-grid w-5 h-5 place-items-center rounded-full border border-white/40 font-mono text-[11px] font-medium">
                  {i + 1}
                </b>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="max-w-ean mx-auto px-6 pt-6 pb-14 grid gap-6 items-start min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
        {/* BUILDER */}
        <div className="grid gap-4 min-w-0">
          <div className="grid gap-2" role="group" aria-label="Aircraft in this quote">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="font-mono text-[11px] tracking-[.12em] uppercase text-ean-slate">
                Aircraft in this quote
              </span>
              <span className="font-ui text-[12.5px] text-ean-slate">
                Quoting more than one aircraft? Add each one and pick its own services.
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {fleet.map((aircraft, i) => {
                const isActive = i === activeIndex
                const count = selectedCount(aircraft)
                return (
                  <div
                    key={aircraft.id}
                    className={`flex items-stretch overflow-hidden rounded-[10px] border bg-ean-white transition-[border-color,box-shadow] ${
                      isActive ? 'border-ean-gold shadow-[0_0_0_1px_var(--color-ean-gold)]' : 'border-ean-border-light'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      aria-pressed={isActive}
                      className={`grid min-w-[140px] gap-px px-3.5 py-[9px] text-left cursor-pointer ${isActive ? 'bg-ean-blue-tint' : ''}`}
                    >
                      <span className="font-mono text-[10px] tracking-[.1em] uppercase text-ean-gold">Aircraft {i + 1}</span>
                      <span className="max-w-[200px] truncate font-ui text-sm font-semibold">{aircraftShortName(aircraft)}</span>
                      <span className="font-ui text-xs text-ean-slate">{plural(count, 'service')}</span>
                    </button>
                    {isFleet && (
                      <button
                        type="button"
                        onClick={() => removeAircraft(i)}
                        aria-label={`Remove aircraft ${i + 1}`}
                        className="grid w-[34px] place-items-center border-l border-ean-border-light text-ean-slate cursor-pointer hover:text-ean-error hover:bg-ean-navy"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )
              })}
              <button
                type="button"
                onClick={addAircraft}
                disabled={fleet.length >= MAX_AIRCRAFT}
                className="inline-flex items-center gap-2 rounded-[10px] border border-dashed border-ean-gold-light px-4 py-[9px] font-ui text-sm font-medium text-ean-gold cursor-pointer hover:bg-ean-blue-tint disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
                Add another aircraft
              </button>
            </div>
          </div>

          <section
            ref={acCardRef}
            aria-labelledby="ac-h"
            className="rounded-xl border border-ean-border-light bg-ean-white min-w-0 scroll-mt-28"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2.5 border-b border-ean-border-light px-[18px] pt-4 pb-3">
              <h2 id="ac-h" className="m-0 font-ui text-base font-semibold">
                1 · Aircraft{isFleet ? ` ${activeIndex + 1}` : ''}
              </h2>
              <button
                type="button"
                onClick={() => setMode(isManual ? 'list' : 'manual')}
                className="inline-flex items-center gap-1.5 font-ui text-[13.5px] font-medium text-ean-gold underline cursor-pointer"
              >
                <PenLine className="w-[15px] h-[15px]" aria-hidden="true" />
                {isManual ? 'Choose from aircraft list' : 'Enter manual MTOW'}
              </button>
            </div>
            <div className="grid gap-3 px-[18px] py-4">
              {isManual ? (
                <div className="grid gap-[5px]">
                  <label htmlFor="mtow" className="font-ui text-[12.5px] font-medium text-ean-muted-light">
                    Maximum take-off weight (kg)
                  </label>
                  <input
                    id="mtow"
                    type="number"
                    inputMode="numeric"
                    min={MTOW_MIN_KG}
                    max={MTOW_MAX_KG}
                    step={100}
                    placeholder="e.g. 24300"
                    value={active.mtowInput}
                    onChange={(e) => updateActive((aircraft) => ({ ...aircraft, mtowInput: e.target.value }))}
                    aria-describedby={AC_META_ID}
                    className="w-full rounded-lg border border-ean-border-light bg-ean-navy px-3 py-[9px] font-ui text-[15px] text-ean-text-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ean-gold-light"
                  />
                </div>
              ) : (
                <AircraftPicker
                  key={active.id}
                  jet={active.jet}
                  onPick={(picked) => updateActive((aircraft) => ({ ...aircraft, jet: picked, mode: 'list' }))}
                  onManual={() => setMode('manual')}
                  openRequest={openRequest}
                  describedBy={AC_META_ID}
                />
              )}
              <p id={AC_META_ID} className="m-0 font-mono text-[13.5px] text-ean-muted-light" aria-live="polite">
                {kg && band ? (
                  `MTOW ${formatKg(kg)} kg · ${bandText(band)}`
                ) : isManual && active.mtowInput ? (
                  <span className="font-ui text-ean-error">Enter a weight between 1,000 and 600,000 kg.</span>
                ) : (
                  'Choose your aircraft and its MTOW fills in automatically.'
                )}
              </p>
            </div>
          </section>

          <section aria-labelledby="sv-h" className="grid gap-4 min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2.5 px-0.5 pt-1">
              <h2 id="sv-h" className="m-0 font-ui text-base font-semibold">
                {isFleet ? `2 · Services for Aircraft ${activeIndex + 1}${jet ? ` · ${jet.model}` : ''}` : '2 · Services'}
              </h2>
              <span className="font-ui text-[12.5px] text-ean-slate">
                {activeCount ? `${plural(activeCount, 'service')} selected` : 'Tick what you need'}
              </span>
            </div>

            <div className="grid gap-4 items-start sm:grid-cols-2">
              {QUOTE_SECTIONS.map((section) => (
                <SectionReveal
                  key={section.id}
                  stagger={0.045}
                  distance={22}
                  duration={0.65}
                  className={`rounded-xl border border-ean-border-light bg-ean-white min-w-0 ${
                    section.id === 'monthly' ? 'sm:col-span-2' : ''
                  }`}
                >
                  <section aria-labelledby={`h-${section.id}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2.5 border-b border-ean-border-light px-4 pt-3 pb-2.5">
                      <h3 id={`h-${section.id}`} className="m-0 font-ui text-[14.5px] font-semibold">
                        {section.title}
                      </h3>
                      {section.note && <span className="font-ui text-[12.5px] text-ean-slate">{section.note}</span>}
                    </div>
                    {section.items.map((item, i) => {
                      const quantity = active.selected[item.id]
                      const isOn = Boolean(quantity)
                      const inputId = `svc-${item.id}`
                      const word = quantityWord(item)
                      return (
                        <div
                          key={item.id}
                          data-reveal=""
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('label,input,button')) return
                            toggleService(item.id)
                          }}
                          className={`grid min-h-[46px] cursor-pointer grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2.5 px-4 py-[9px] hover:bg-ean-blue-tint ${
                            i > 0 ? 'border-t border-ean-border-light' : ''
                          } ${isOn ? 'bg-ean-blue-tint' : ''}`}
                        >
                          <input
                            type="checkbox"
                            id={inputId}
                            checked={isOn}
                            onChange={() => toggleService(item.id)}
                            className="m-0 h-4 w-4 accent-ean-gold cursor-pointer"
                          />
                          <label htmlFor={inputId} className="cursor-pointer font-ui">
                            <span className="text-sm">{item.name}</span>
                            {item.unit && <span className="block font-mono text-[11.5px] text-ean-slate">{item.unit}</span>}
                            {isOn && item.quoteNote && (
                              <span className="mt-0.5 block text-xs text-ean-live">{item.quoteNote}</span>
                            )}
                          </label>
                          <span
                            className={`inline-flex items-center overflow-hidden rounded-[7px] border border-ean-border-light bg-ean-white ${
                              isOn ? '' : 'invisible'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setQuantity(item.id, (quantity ?? 1) - 1)}
                              aria-label={`Fewer — ${item.name}`}
                              tabIndex={isOn ? 0 : -1}
                              className="h-7 w-[26px] cursor-pointer text-[15px] leading-none hover:bg-ean-blue-tint"
                            >
                              −
                            </button>
                            {/* Uncontrolled and re-keyed on each change, so a half-typed
                                value is not clamped mid-word; it commits on blur. */}
                            <input
                              key={quantity ?? 0}
                              type="number"
                              min={1}
                              max={MAX_QUANTITY}
                              defaultValue={quantity ?? 1}
                              onBlur={(e) => setQuantity(item.id, Number(e.target.value))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') e.currentTarget.blur()
                              }}
                              aria-label={`Quantity${word ? ` (${word})` : ''} — ${item.name}`}
                              tabIndex={isOn ? 0 : -1}
                              className="w-[34px] border-0 bg-transparent p-0 text-center font-mono text-[13px] text-ean-text-light [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => setQuantity(item.id, (quantity ?? 1) + 1)}
                              aria-label={`More — ${item.name}`}
                              tabIndex={isOn ? 0 : -1}
                              className="h-7 w-[26px] cursor-pointer text-[15px] leading-none hover:bg-ean-blue-tint"
                            >
                              +
                            </button>
                          </span>
                        </div>
                      )
                    })}
                  </section>
                </SectionReveal>
              ))}
            </div>
          </section>
        </div>

        {/* QUOTE */}
        <aside
          aria-label="Your quotation"
          className="grid gap-3.5 min-w-0 min-[1080px]:sticky min-[1080px]:top-24"
        >
          {isUnlocked && lead && stamp ? (
            <>
              <div className="grid gap-2">
                <div
                  id="quote-unlocked"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ean-border-light bg-ean-white px-4 py-3 scroll-mt-28"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-ean-live text-ean-text-dark" aria-hidden="true">
                      <Check className="w-[15px] h-[15px]" strokeWidth={2.6} />
                    </span>
                    <div className="min-w-0 font-ui">
                      <b className="font-semibold">
                        {lead.name} · {lead.company}
                      </b>
                      <small className="block text-xs text-ean-slate">
                        {lead.email} · {lead.phone}
                      </small>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={handleChangeDetails} className="font-ui text-[13px] text-ean-gold underline cursor-pointer">
                      Change details
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!priced.length}
                      className="inline-flex items-center gap-2 rounded-lg border border-ean-border-light bg-ean-white px-[15px] py-[9px] font-ui text-sm font-medium cursor-pointer hover:border-ean-gold-light disabled:opacity-55 disabled:cursor-not-allowed"
                    >
                      <Mail className="w-4 h-4" aria-hidden="true" />
                      Copy as email
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={!priced.length || isDownloading}
                      className="inline-flex items-center gap-2 rounded-lg bg-ean-gold hover:bg-ean-gold-light px-[15px] py-[9px] font-ui text-sm font-medium text-ean-text-dark cursor-pointer transition-colors disabled:opacity-55 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Download className="w-4 h-4" aria-hidden="true" />
                      )}
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* Kept in the tree while empty — a live region that only appears
                    with its text is not announced. The negative margin takes
                    back the gap an empty line would leave. */}
                <p
                  aria-live="polite"
                  className={`m-0 font-ui text-[12.5px] empty:-mt-2 ${status?.tone === 'warn' ? 'text-ean-error' : 'text-ean-live'}`}
                >
                  {status?.text ?? ''}
                </p>
              </div>
              {pending.length > 0 && (
                <p role="status" className="m-0 font-ui text-[12.5px] text-ean-error">
                  Aircraft {pending[0].number} has services but no aircraft type or MTOW yet, so it isn&apos;t in the
                  quote.
                </p>
              )}

              <div className="overflow-x-auto rounded-xl bg-ean-surface p-3.5">
                <div className="min-w-[500px] rounded-[4px] bg-ean-white px-6 pt-[22px] pb-[18px] font-[Helvetica,Arial,sans-serif] text-xs leading-[1.45] text-ean-text-light shadow-ean-gold">
                  <QuoteDocument
                    ref={paperRef}
                    priced={priced}
                    recipient={lead}
                    quoteNo={stamp.number}
                    date={stamp.date}
                  />
                </div>
              </div>
            </>
          ) : (
            <QuoteGate
              key={gateKey}
              lib={phoneLib}
              prefill={prefill}
              title={heading.title}
              subtitle={heading.subtitle || SCHEDULE_DOCUMENT.locations}
              serviceSummary={
                totalSelected
                  ? `${plural(totalSelected, 'service')} selected${isFleet ? ` across ${fleet.length} aircraft` : ''}`
                  : 'No services selected'
              }
              previewRows={
                previewRows.length ? previewRows : ['Handling', 'Landing permit', 'VIP terminal', 'Parking']
              }
              isReady={isReady}
              hint={gateHint}
              onSubmit={handleSubmit}
            />
          )}

          <p className="m-0 pb-6 font-ui text-xs text-ean-slate">
            Rates per {SCHEDULE_DOCUMENT.ref} v{SCHEDULE_DOCUMENT.version}, issued {ISSUED_LABEL}. Quotations are
            estimates; invoices reflect services delivered.
          </p>
        </aside>
      </div>
    </div>
  )
}
