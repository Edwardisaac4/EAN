'use client'

import React from 'react'
import { ADDONS } from '@/lib/pricing/bands'
import { MtowBand } from '@/types/pricing'
import { Layers, CheckSquare, Square } from 'lucide-react'

interface AddonsGridProps {
  addons: Record<string, boolean>
  band: MtowBand
  onToggleAddon: (id: string) => void
}

export default function AddonsGrid({ addons, band, onToggleAddon }: AddonsGridProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-ean-border-light">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-ean-border-light">
        <h3 className="font-display font-semibold text-xl text-ean-navy flex items-center gap-2">
          <Layers className="w-5 h-5 text-ean-gold" />
          4. Add-on Ground Services
        </h3>
        <span className="text-xs font-ui uppercase tracking-wider text-ean-gold bg-ean-gold/10 px-2.5 py-1 rounded-full font-semibold">
          Step 4 of 4
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ADDONS.map((addon) => {
          const isChecked = Boolean(addons[addon.id])
          const priceDisplay = addon.per === 'flat'
            ? `$${addon.value}`
            : `$${addon.values[band]}`

          return (
            <label
              key={addon.id}
              className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer select-none focus-within:ring-2 focus-within:ring-ean-gold ${
                isChecked
                  ? 'bg-ean-navy/5 border-ean-gold shadow-sm'
                  : 'bg-ean-surface border-ean-border-light hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isChecked}
                onChange={() => onToggleAddon(addon.id)}
              />
              <div className="mt-0.5 text-ean-gold shrink-0">
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-ean-gold fill-ean-gold/20" />
                ) : (
                  <Square className="w-4 h-4 text-ean-muted-dark" />
                )}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <span className={`text-xs font-ui font-medium block ${isChecked ? 'text-ean-navy font-semibold' : 'text-ean-text-dark'}`}>
                    {addon.label}
                  </span>
                  <span className="text-[10px] font-ui text-ean-muted-dark uppercase tracking-wider">
                    {addon.per === 'flat' ? 'Flat rate' : 'Standard rate'}
                  </span>
                </div>
                <span className="text-xs font-ui font-bold text-ean-gold tabular-nums ml-2">
                  {priceDisplay}
                </span>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
