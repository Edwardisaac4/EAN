'use client'

import React from 'react'
import { QuoteLineItem as LineItem } from '@/types/pricing'

interface QuoteLineItemProps {
  item: LineItem
}

// A line says what the turnaround includes, never what that service costs. The
// published sheet is not shown on the site: the estimated total is the only
// figure the visitor sees, and it appears once the gate is cleared.
export default function QuoteLineItem({ item }: QuoteLineItemProps) {
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
          total — say so on the line rather than letting it read as included. */}
      <span className="text-[11.5px] font-ui text-ean-slate whitespace-nowrap shrink-0">
        {item.pending ? 'Quoted on request' : 'Included'}
      </span>
    </div>
  )
}
