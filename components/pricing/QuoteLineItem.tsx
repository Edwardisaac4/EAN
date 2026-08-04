'use client'

import React from 'react'
import { QuoteLineItem as LineItem } from '@/types/pricing'

interface QuoteLineItemProps {
  item: LineItem
}

export default function QuoteLineItem({ item }: QuoteLineItemProps) {
  const isUsd = item.currency === 'USD'
  const symbol = isUsd ? 'USD ' : '₦'

  return (
    <div className="flex items-start justify-between py-2 border-b border-white/10 last:border-b-0">
      <div className="pr-2">
        <div className="text-xs font-ui font-medium text-white/90 flex items-center gap-1.5">
          {item.label}
          {item.provisional && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-normal">
              proposed
            </span>
          )}
        </div>
        {item.sub && (
          <div className="text-[11px] font-ui text-white/60">
            {item.sub}
          </div>
        )}
      </div>
      <div className="text-right whitespace-nowrap">
        {item.pending ? (
          <span className="text-xs font-mono text-white/50 italic">TBD</span>
        ) : (
          <span
            className={`text-xs font-mono font-semibold tabular-nums ${
              item.provisional ? 'text-amber-300' : 'text-ean-gold-light'
            }`}
          >
            {symbol}
            {item.value.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  )
}
