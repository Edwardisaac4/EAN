'use client'

import React from 'react'
import { QuoteLineItem as LineItem } from '@/types/pricing'

interface QuoteLineItemProps {
  item: LineItem
  /** Gated: the line's figure is withheld until the visitor clears the lead form. */
  isLocked: boolean
}

// Each line carries its own price, so the visitor can check the total against
// the rate sheet line by line. Behind the gate the figure is masked rather than
// blurred, for the same reason the total is: a blurred number is still in the DOM.
export default function QuoteLineItem({ item, isLocked }: QuoteLineItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-ean-border-light last:border-b-0">
      <div>
        <div className="text-[13.5px] font-ui text-ean-text-light flex items-center gap-1.5">
          {item.label}
          {item.provisional && (
            <span className="text-[10px] font-ui bg-ean-gold-muted text-ean-gold px-1.5 py-0.5 font-medium">
              proposed
            </span>
          )}
        </div>
        {item.sub && (
          <div className="text-[11.5px] font-ui text-ean-slate mt-0.5">
            {item.sub}
          </div>
        )}
      </div>
      {/* An on-request service is priced by the CRO, so it sits outside the
          total — say so on the line rather than showing it as USD 0. */}
      {item.pending ? (
        <span className="text-[11.5px] font-ui text-ean-slate whitespace-nowrap shrink-0">
          Quoted on request
        </span>
      ) : (
        <span className="text-[13.5px] font-ui font-medium text-ean-text-light tabular-nums whitespace-nowrap shrink-0">
          {isLocked ? 'USD ——' : `USD ${item.value.toLocaleString()}`}
        </span>
      )}
    </div>
  )
}
