'use client'

import React, { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Check, Download, Loader2, Lock } from 'lucide-react'
import type { LeadDetails } from '@/types/pricing'
import {
  getRevealServerSnapshot,
  getRevealSnapshot,
  grantReveal,
  revokeReveal,
  subscribeToReveal,
} from '@/lib/pricing/reveal-store'
import {
  ISSUED_LABEL,
  SCHEDULE_CONTACT,
  SCHEDULE_DOCUMENT,
} from '@/lib/pricing/rate-schedule'
import RateSheetGate, { GATE_ID, GATE_NAME_ID } from './RateSheetGate'
import RateTable from './RateTable'
import type { PhoneLib } from './CountryPhoneField'

const QUOTE_HREF = '/pricing/quote'

const TABLE_ID = 'rate-table'

type DownloadStatus = { tone: 'ok' | 'warn'; text: string } | null

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

export default function RateSheet() {
  // The same store as the calculator, so an unlock here is an unlock there and
  // a refresh re-gates both. See lib/pricing/reveal-store.ts.
  const { revealed, lead } = useSyncExternalStore(
    subscribeToReveal,
    getRevealSnapshot,
    getRevealServerSnapshot
  )

  const [phoneLib, setPhoneLib] = useState<PhoneLib | null>(null)
  const [gateKey, setGateKey] = useState(0)
  const [prefill, setPrefill] = useState<LeadDetails | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>(null)

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
    if (!downloadStatus || downloadStatus.tone === 'warn') return
    const timer = setTimeout(() => setDownloadStatus(null), 6000)
    return () => clearTimeout(timer)
  }, [downloadStatus])

  const goToGate = () => {
    document.getElementById(GATE_ID)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
    // After the scroll has started, so focusing does not jump the page first.
    setTimeout(() => document.getElementById(GATE_NAME_ID)?.focus({ preventScroll: true }), 350)
  }

  const handleViewRates = () => {
    if (revealed) {
      document.getElementById(TABLE_ID)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
    } else {
      goToGate()
    }
  }

  const handleUnlock = (next: LeadDetails) => {
    grantReveal(next)
    requestAnimationFrame(() =>
      document.getElementById('rate-unlocked')?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
    )
  }

  const handleChangeDetails = () => {
    setPrefill(lead)
    // A fresh key remounts the form, so it starts from `prefill` rather than
    // from whatever it held before the unlock.
    setGateKey((k) => k + 1)
    revokeReveal()
    requestAnimationFrame(goToGate)
  }

  const handleDownload = async () => {
    setDownloadStatus(null)
    setIsDownloading(true)
    try {
      const { downloadRateSheetPdf } = await import('@/lib/pricing/rate-sheet-pdf')
      const filename = await downloadRateSheetPdf(lead)
      setDownloadStatus({ tone: 'ok', text: `Downloaded ${filename}` })
    } catch {
      setDownloadStatus({
        tone: 'warn',
        text: 'The PDF could not be created. Check your connection and try again.',
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const downloadButton = (variant: 'primary' | 'ghost') => (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-ui text-sm font-medium cursor-pointer transition-colors disabled:opacity-55 disabled:cursor-not-allowed ${
        variant === 'primary'
          ? 'bg-ean-gold hover:bg-ean-gold-light text-ean-text-dark'
          : 'border border-ean-border-light text-ean-text-light hover:border-ean-gold'
      }`}
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="w-4 h-4" aria-hidden="true" />
      )}
      Download PDF
    </button>
  )

  return (
    <div className="bg-ean-navy text-ean-text-light">
      {/* HERO — the brand blue as a full-bleed band (AGENTS.md §5), deepening to
          ean-blue-deep at the edges. Every layer is decorative. */}
      <section className="relative overflow-hidden bg-ean-blue-deep text-ean-text-dark">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(900px_300px_at_85%_-10%,var(--color-ean-gold-light),transparent_65%)] opacity-70"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-linear-gradient(90deg,var(--color-ean-text-dark)_0_1px,transparent_1px_88px)] opacity-[.04]"
        />
        <div className="relative max-w-ean mx-auto px-6 pt-32 pb-10 md:pt-36 md:pb-12 grid gap-3.5">
          <span className="font-mono text-[11px] tracking-[.12em] uppercase text-ean-muted-dark">
            EAN Jet Center · Pricing
          </span>
          <h1 className="m-0 font-display font-light text-[clamp(30px,5vw,46px)] leading-[1.08] tracking-[-.01em] text-balance">
            {SCHEDULE_DOCUMENT.title}
          </h1>
          <p className="m-0 max-w-[60ch] font-ui text-[15px] leading-relaxed text-ean-muted-dark">
            Handling, permits and aircraft services at Murtala Muhammed International Airport, Lagos, Nnamdi
            Azikiwe International Airport, Abuja, and outstations across Nigeria. All prices in US dollars,
            banded by maximum take-off weight.
          </p>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {[SCHEDULE_DOCUMENT.locations, `Currency: ${SCHEDULE_DOCUMENT.currency}`].map((pill) => (
              <span
                key={pill}
                className="font-mono text-[11.5px] px-2.5 py-[5px] rounded-full border border-ean-muted-dark/40 text-ean-text-dark"
              >
                {pill}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5 mt-2">
            <button
              type="button"
              onClick={handleViewRates}
              className="inline-flex items-center rounded-lg bg-ean-white px-4 py-2.5 font-ui text-sm font-medium text-ean-gold cursor-pointer hover:bg-ean-navy transition-colors"
            >
              View rates
            </button>
            <Link
              href={QUOTE_HREF}
              className="inline-flex items-center rounded-lg border border-ean-muted-dark/50 px-4 py-2.5 font-ui text-sm font-medium text-ean-text-dark hover:border-ean-text-dark transition-colors"
            >
              Build your own quote
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-ean mx-auto px-6 pt-7 pb-14 grid gap-[22px]">
        {revealed && lead ? (
          <div
            id="rate-unlocked"
            className="flex flex-wrap items-center justify-between gap-3.5 bg-ean-white border border-ean-border-light rounded-xl px-[18px] py-3.5 scroll-mt-24"
          >
            <div className="flex items-center gap-3">
              <span className="w-[30px] h-[30px] flex-none rounded-full bg-ean-live text-ean-text-dark grid place-items-center" aria-hidden="true">
                <Check className="w-4 h-4" strokeWidth={2.6} />
              </span>
              <div className="font-ui">
                <b className="font-semibold">Prices unlocked for {lead.name}</b>
                <small className="block text-[12.5px] text-ean-slate">
                  {[lead.company, lead.email, lead.phone].filter(Boolean).join(' · ')}
                </small>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={handleChangeDetails}
                className="font-ui text-[13px] text-ean-gold underline cursor-pointer"
              >
                Not you? Change details
              </button>
              {downloadButton('ghost')}
              <Link
                href={QUOTE_HREF}
                className="inline-flex items-center rounded-lg bg-ean-gold hover:bg-ean-gold-light px-4 py-2.5 font-ui text-sm font-medium text-ean-text-dark transition-colors"
              >
                Build your own quote
              </Link>
            </div>
          </div>
        ) : (
          <RateSheetGate key={gateKey} lib={phoneLib} prefill={prefill} onUnlock={handleUnlock} />
        )}

        <section
          id={TABLE_ID}
          aria-labelledby="rate-table-heading"
          className="bg-ean-white border border-ean-border-light rounded-[14px] overflow-hidden scroll-mt-24"
        >
          <div className="flex flex-wrap items-end justify-between gap-3.5 px-[22px] pt-5 pb-4">
            <div>
              <h2 id="rate-table-heading" className="m-0 font-display font-medium text-xl text-balance">
                Full rate table, all weight bands
              </h2>
              <p className="mt-1 mb-0 font-ui text-[13px] text-ean-slate">
                USD per service. Weight bands are by aircraft maximum take-off weight (MTOW).
              </p>
            </div>
            {revealed ? (
              downloadButton('primary')
            ) : (
              <span className="inline-flex items-center gap-[7px] rounded-full bg-ean-blue-muted px-[11px] py-1.5 font-mono text-[11px] tracking-[.04em] text-ean-gold">
                <Lock className="w-[13px] h-[13px]" aria-hidden="true" />
                Prices hidden until you enter your details
              </span>
            )}
          </div>
          <p
            aria-live="polite"
            // Kept in the tree while empty — a live region that only appears
            // with its text is not announced.
            className={`m-0 px-[22px] font-ui text-[12.5px] ${downloadStatus ? 'pb-2.5' : ''} ${
              downloadStatus?.tone === 'warn' ? 'text-ean-error' : 'text-ean-live'
            }`}
          >
            {downloadStatus?.text ?? ''}
          </p>
          <RateTable isRevealed={revealed} onLockedClick={goToGate} />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-[18px] rounded-xl bg-ean-gold text-ean-text-dark p-[18px]">
          <div className="grid gap-0.5">
            <span className="font-mono text-[11px] tracking-[.12em] uppercase text-ean-muted-dark">Dispatch · 24/7</span>
            <a href={`mailto:${SCHEDULE_CONTACT.email}`} className="font-mono text-sm hover:underline">
              {SCHEDULE_CONTACT.email}
            </a>
          </div>
          <div className="grid gap-0.5">
            <span className="font-mono text-[11px] tracking-[.12em] uppercase text-ean-muted-dark">Telephone</span>
            <span className="font-mono text-sm select-all">
              {SCHEDULE_CONTACT.phone}  ·  {SCHEDULE_CONTACT.phone2}
            </span>
          </div>
          <Link
            href={QUOTE_HREF}
            className="inline-flex items-center rounded-lg bg-ean-white px-4 py-2.5 font-ui text-sm font-medium text-ean-gold hover:bg-ean-navy transition-colors"
          >
            Build your own quote
          </Link>
        </div>

        <div className="flex flex-wrap justify-between gap-3 font-ui text-xs text-ean-slate">
          <span>
            {SCHEDULE_DOCUMENT.ref} v{SCHEDULE_DOCUMENT.version} · {ISSUED_LABEL} · Rates subject to change; the
            latest version applies.
          </span>
          <span>{SCHEDULE_CONTACT.address}</span>
        </div>
      </div>
    </div>
  )
}
