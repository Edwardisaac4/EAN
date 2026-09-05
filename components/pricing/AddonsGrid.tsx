'use client'

import React from 'react'
import { ADDONS } from '@/lib/pricing/bands'
import { Operation } from '@/types/pricing'

interface AddonsGridProps {
  addons: Record<string, boolean>
  operation: Operation
  onToggleAddon: (id: string) => void
}

export default function AddonsGrid({ addons, operation, onToggleAddon }: AddonsGridProps) {
  // Some services exist only on an international movement — PSC among them.
  // They are dropped from the grid rather than shown disabled: a domestic
  // visitor has no decision to make about a charge that cannot apply to them.
  const offered = ADDONS.filter(a => !a.intlOnly || operation === 'intl')

  // CIQ leads on its own row — it is the one service most international
  // movements need, and the operation toggle ticks it automatically.
  const ciqAddon = offered.find(a => a.id === 'ciq')
  const remainingAddons = offered.filter(a => a.id !== 'ciq')

  return (
    <div className="bg-white p-6 md:p-8 shadow-sm border border-ean-border-light space-y-5">
      <div>
        <h2 className="font-display font-medium text-lg md:text-xl text-ean-text-light tracking-wide">
          Add services
        </h2>
        {/* No per-service figure is quoted here. The published sheet stays with
            the FBO — what the visitor gets is the estimated total for the
            turnaround they have configured, in the summary alongside. */}
        <p className="font-ui text-xs md:text-sm text-ean-muted-light mt-0.5">
          Optional. Your estimated total updates as you select — the items marked
          on request are quoted separately and do not move the figure.
        </p>
      </div>

      <div className="space-y-3">
        {ciqAddon && (
          <label className="flex items-center gap-3 py-1.5 px-1 hover:bg-ean-surface transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(addons[ciqAddon.id])}
              onChange={() => onToggleAddon(ciqAddon.id)}
              className="w-4 h-4 accent-ean-gold cursor-pointer shrink-0"
            />
            <span className="font-ui text-[13.5px] text-ean-text-light">
              {ciqAddon.label}
            </span>
          </label>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
          {remainingAddons.map((addon) => {
            // `per` says how a service is priced, never what it costs. The
            // on-request items are the one thing worth flagging up front: the
            // CRO prices them by hand, so they stay outside the total and the
            // figure on screen will not move when one is ticked.
            const isOnRequest = addon.per === 'request'

            return (
              <label
                key={addon.id}
                className="flex items-center justify-between gap-4 py-1.5 px-1 hover:bg-ean-surface transition-colors cursor-pointer select-none"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={Boolean(addons[addon.id])}
                    onChange={() => onToggleAddon(addon.id)}
                    className="w-4 h-4 accent-ean-gold cursor-pointer shrink-0"
                  />
                  <span className="font-ui text-[13.5px] text-ean-text-light truncate">
                    {addon.label}
                  </span>
                </span>
                {isOnRequest && (
                  <span className="font-ui text-[11.5px] text-ean-slate shrink-0 whitespace-nowrap">
                    On request
                  </span>
                )}
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
