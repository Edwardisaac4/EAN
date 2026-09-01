'use client'

import React from 'react'
import { ADDONS, addonRate } from '@/lib/pricing/bands'
import { MtowBand } from '@/types/pricing'

interface AddonsGridProps {
  addons: Record<string, boolean>
  band: MtowBand
  onToggleAddon: (id: string) => void
}

export default function AddonsGrid({ addons, band, onToggleAddon }: AddonsGridProps) {
  // Separate CIQ (first item) and the rest of the items for clean 2-column layout matching screenshot
  const ciqAddon = ADDONS.find(a => a.id === 'ciq')
  const remainingAddons = ADDONS.filter(a => a.id !== 'ciq')

  return (
    <div className="bg-white p-6 md:p-8 shadow-sm border border-ean-border-light space-y-6">
      {/* HEADER SECTION */}
      <div>
        <h2 className="font-ui font-bold text-lg md:text-xl text-ean-text-light tracking-tight">
          Add services
        </h2>
        <p className="font-ui text-xs md:text-sm text-ean-muted-light mt-0.5">
          Optional. Prices update as you select.
        </p>
      </div>

      <div className="space-y-4">
        {/* TOP ITEM: CIQ (Full Width or Primary Row) */}
        {ciqAddon && (
          <label
            key={ciqAddon.id}
            className="flex items-center justify-between gap-4 p-1 hover:bg-ean-surface transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={Boolean(addons[ciqAddon.id])}
                onChange={() => onToggleAddon(ciqAddon.id)}
                className="w-4 h-4 border-ean-border-light text-ean-text-light focus:ring-ean-burgundy-rich accent-ean-burgundy-rich cursor-pointer"
              />
              <span className="font-ui text-sm font-medium text-ean-text-light">
                {ciqAddon.label}
              </span>
            </div>
            <span className="font-ui text-sm text-ean-muted-light shrink-0">
              ${addonRate(ciqAddon, band)?.toLocaleString()}
            </span>
          </label>
        )}

        {/* 2-COLUMN CHECKBOX GRID FOR REMAINING SERVICES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {remainingAddons.map((addon) => {
            const isChecked = Boolean(addons[addon.id])
            const rate = addonRate(addon, band)
            // Band-priced services move with MTOW, so the figure shown is the
            // one for the aircraft currently selected, not a headline rate.
            const priceDisplay = rate === null ? 'On request' : `$${rate.toLocaleString()}`

            return (
              <label
                key={addon.id}
                className="flex items-center justify-between gap-4 p-1 hover:bg-ean-surface transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleAddon(addon.id)}
                    className="w-4 h-4 border-ean-border-light text-ean-text-light focus:ring-ean-burgundy-rich accent-ean-burgundy-rich cursor-pointer shrink-0"
                  />
                  <span className="font-ui text-sm font-medium text-ean-text-light truncate">
                    {addon.label}
                  </span>
                </div>
                <span className="font-ui text-sm text-ean-muted-light shrink-0 ml-2">
                  {priceDisplay}
                </span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
