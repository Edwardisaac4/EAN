'use client'

import React from 'react'
import { BANDS } from '@/lib/pricing/bands'
import { MtowBand } from '@/types/pricing'
import { Info } from 'lucide-react'

/**
 * The published FBO schedule, as a directory of what EAN charges for rather
 * than a rate card. Every line on `docs/FBO PRICE LIST_adjusted.pdf` appears
 * here with the basis it is priced on — per turnaround, per day, per night, by
 * MTOW band — and no figure. The tariff itself is quoted against a
 * configuration through the calculator, or by the CRO on enquiry.
 *
 * `basis` is safe to publish: it says *how* a service is priced, never what it
 * costs. Keep it that way — the moment a number lands in this file it is on the
 * public page and in the JS bundle.
 */
interface PriceListRow {
  name: string
  basis: string
}

const SECTIONS: readonly { title: string; rows: readonly PriceListRow[] }[] = [
  {
    title: 'Handling',
    rows: [
      { name: 'Handling fee — Lagos (MMIA)', basis: 'Per turnaround · by MTOW band' },
      { name: 'Handling fee — Abuja (NAIA)', basis: 'Per turnaround · flat across bands' },
      { name: 'Outstation handling', basis: 'Per turnaround · any station outside Lagos and Abuja' },
      { name: 'CIQ (customs / immigration / quarantine)', basis: 'Per turnaround · flat across bands' },
      { name: 'Monthly handling — hangarage', basis: 'Per calendar month · by MTOW band' },
      { name: 'Monthly handling — apron', basis: 'Per calendar month · by MTOW band' },
    ],
  },
  {
    title: 'Parking',
    rows: [
      { name: 'Apron parking', basis: 'Per day · by MTOW band' },
      { name: 'Overnight parking', basis: 'Per night · flat across bands' },
      { name: 'Hangarage', basis: 'Per day · by MTOW band' },
      { name: 'Block clearance', basis: 'Quoted on request' },
    ],
  },
  {
    title: 'Permits',
    rows: [
      { name: 'Overflight permit', basis: 'Per permit · flat across bands' },
      { name: 'Technical landing permit', basis: 'Per permit · flat across bands' },
    ],
  },
  {
    title: 'Aircraft & cabin',
    rows: [
      { name: 'A/C external wash (international)', basis: 'Per wash · by MTOW band' },
      { name: 'Towing services (international)', basis: 'Per movement · flat across bands' },
      { name: 'Interior clean', basis: 'Per service · flat across bands' },
      { name: 'Toilet service (international)', basis: 'Per service · flat across bands' },
      { name: 'Potable water (international)', basis: 'Per service · flat across bands' },
      { name: 'Ice cubes', basis: 'Per service · flat across bands' },
      { name: 'Dishes', basis: 'Per service · flat across bands' },
      { name: 'Trash collection', basis: 'Per service · flat across bands' },
      { name: 'Laundry', basis: 'Per service · flat across bands' },
      { name: 'Newspaper', basis: 'Per service · flat across bands' },
      { name: 'Fridge storage', basis: 'Per service · flat across bands' },
    ],
  },
  {
    title: 'Passenger & special',
    rows: [
      { name: 'Dispatch facilitation fee', basis: 'Per movement · flat across bands' },
      { name: 'Wheelchair service (international)', basis: 'Per passenger · flat across bands' },
      { name: 'Ambulance tarmac pass', basis: 'Per pass · flat across bands' },
      { name: 'GPU (diesel)', basis: 'Per connection · flat across bands' },
    ],
  },
  {
    title: 'Fuel',
    rows: [
      { name: 'Jet A-1 uplift', basis: 'Platts-based location pricing · quoted at uplift' },
      { name: 'Disbursement fee', basis: 'Percentage of any payment EAN makes on your behalf' },
    ],
  },
]

const BAND_ORDER: readonly MtowBand[] = ['A', 'B', 'C', 'D', 'E']

export default function PriceListTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 md:p-8 shadow-sm border border-ean-border-light space-y-6">
        <div>
          <h2 className="font-display font-medium text-lg md:text-xl text-ean-text-light tracking-wide">
            EAN FBO price list
          </h2>
          <p className="font-ui text-xs md:text-sm text-ean-muted-light mt-0.5">
            The approved schedule, effective 01 August 2025. Owner: Business Intelligence Unit.
            Every service below is quoted in USD against your configuration.
          </p>
        </div>

        {/* MTOW BANDS — the sheet's five columns. A weight range is not a rate,
            so the bands themselves are publishable and the calculator captions
            itself with the same metadata. */}
        <div className="bg-ean-surface border border-ean-border-light p-4 md:p-5">
          <div className="text-[11px] font-ui font-semibold uppercase tracking-widest text-ean-gold">
            Priced by MTOW band
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-2 mt-3">
            {BAND_ORDER.map((key) => (
              <div key={key}>
                <div className="font-ui text-xs font-semibold text-ean-text-light">Band {key}</div>
                <div className="font-ui text-[11.5px] text-ean-slate">{BANDS[key].range}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-7">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="text-[11px] font-ui font-semibold uppercase tracking-widest text-ean-gold pb-2 border-b border-ean-border-light">
                {section.title}
              </h3>
              <div>
                {section.rows.map((row) => (
                  <div
                    key={row.name}
                    className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-x-6 gap-y-0.5 py-2.5 border-b border-ean-border-light last:border-b-0"
                  >
                    <span className="font-ui text-[13.5px] text-ean-text-light">{row.name}</span>
                    <span className="font-ui text-[11.5px] text-ean-slate sm:text-right shrink-0">
                      {row.basis}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="bg-ean-gold-muted border-l-3 border-ean-gold p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-ui font-semibold uppercase tracking-widest text-ean-gold">
            <Info className="w-3.5 h-3.5" /> How to get a figure
          </div>
          <p className="font-ui text-xs text-ean-text-light leading-relaxed">
            Every line above carries the basis it is priced on — handling is per aircraft
            turnaround (arrival and departure); the rest is priced per day, night, month,
            permit, movement or service, as stated against it. All of it is quoted in USD.
            Build a quote on the previous tab for an estimated total against your aircraft
            and visit, or contact operations for the full schedule.
          </p>
          <p className="font-ui text-xs text-ean-text-light leading-relaxed">
            Payment terms are 7 days on receipt of invoice. A disbursement fee applies to any
            payment EAN makes on your behalf — fuel uplift, permits and third-party invoices
            included.
          </p>
        </div>
      </div>
    </div>
  )
}
