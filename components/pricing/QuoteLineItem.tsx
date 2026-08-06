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
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-b-0">
      <div className="pr-2">
        <div className="text-xs font-ui font-semibold text-[#1A2035] flex items-center gap-1.5">
          {item.label}
          {item.provisional && (
            <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-mono font-medium">
              proposed
            </span>
          )}
        </div>
        {item.sub && (
          <div className="text-[11px] font-ui text-[#64748B] mt-0.5">
            {item.sub}
          </div>
        )}
      </div>
      <div className="text-right whitespace-nowrap">
        {item.pending ? (
          <span className="text-xs font-mono text-gray-400 italic">TBD</span>
        ) : (
          <span
            className={`text-xs font-mono font-bold tabular-nums ${
              item.provisional ? 'text-amber-700' : 'text-[#581825]'
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
