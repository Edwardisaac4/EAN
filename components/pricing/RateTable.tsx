import React from 'react'
import { BANDS } from '@/lib/pricing/bands'
import {
  BAND_ORDER,
  SCHEDULE_SECTIONS,
  SCHEDULE_TERMS,
  figureForBand,
  formatFigure,
  isBandPriced,
  type ScheduleFigure,
} from '@/lib/pricing/rate-schedule'

interface RateTableProps {
  isRevealed: boolean
  /** A click anywhere in the locked body sends the visitor to the form. */
  onLockedClick: () => void
}

// Placeholder figures of the right shape sit under the blur, so the real prices
// are not in the DOM until the visitor unlocks — a blur alone is a picture of a
// number with the number still in the markup.
function mask(figure: ScheduleFigure): string {
  if (typeof figure !== 'number') return '$0,000–0,000'
  return figure >= 1000 ? '$00,000' : '$000'
}

// The sticky service column needs an opaque fill or the figures scroll visibly
// underneath it, and `ean-blue-muted` is translucent. `ean-blue-tint` is the
// same wash flattened onto paper, so it stays opaque and still reads as the brand.
const TINT = 'bg-ean-blue-tint'
const HOVER_TINT = 'group-hover:bg-ean-blue-tint'

const STICKY =
  'sticky left-0 z-[1] min-w-[240px] text-left shadow-[1px_0_0_var(--color-ean-border-light)]'
const CELL = 'px-3.5 py-[11px] border-b border-ean-border-light align-middle'

export default function RateTable({ isRevealed, onLockedClick }: RateTableProps) {
  const bodyProps = isRevealed
    ? {}
    : { onClick: onLockedClick, className: 'cursor-pointer' }

  return (
    <div className="overflow-x-auto border-t border-ean-border-light">
      <table className="w-full min-w-[860px] border-separate border-spacing-0 font-ui text-sm tabular-nums">
        <thead>
          <tr>
            <th
              scope="col"
              className={`${STICKY} ${CELL} bg-ean-navy align-bottom border-b-2 border-b-ean-gold pt-3.5 font-mono text-[10.5px] font-medium tracking-[.12em] uppercase text-ean-slate`}
            >
              Service
            </th>
            {BAND_ORDER.map((band) => (
              <th
                key={band}
                scope="col"
                className={`${CELL} bg-ean-navy align-bottom text-right border-l border-b-2 border-b-ean-gold pt-3.5 font-semibold text-[13.5px] leading-snug text-ean-text-light`}
              >
                <span className="block mb-[3px] font-mono text-[10px] font-medium tracking-[.12em] uppercase text-ean-gold">
                  Band {band}
                </span>
                {BANDS[band].range}
              </th>
            ))}
          </tr>
        </thead>

        {SCHEDULE_SECTIONS.map((section) => (
          <tbody key={section.id} {...bodyProps}>
            <tr>
              <th
                colSpan={6}
                scope="rowgroup"
                className={`${TINT} ${CELL} sticky left-0 text-left py-2.5 font-semibold text-sm text-ean-text-light`}
              >
                {section.title}
                {section.note && (
                  <em className="not-italic font-normal text-xs text-ean-slate ml-2.5">{section.note}</em>
                )}
              </th>
            </tr>
            {section.items.map((item) => {
              const isBanded = isBandPriced(item.price)
              return (
                <tr key={item.id} className="group">
                  <th scope="row" className={`${STICKY} ${CELL} ${HOVER_TINT} bg-ean-white font-normal text-ean-text-light`}>
                    {item.name}
                    {item.unit && <span className="block font-mono text-[11px] text-ean-slate">{item.unit}</span>}
                  </th>
                  {BAND_ORDER.map((band) => {
                    const figure = figureForBand(item, band)
                    return (
                      <td
                        key={band}
                        className={`${CELL} ${HOVER_TINT} bg-ean-white border-l text-right font-mono font-medium whitespace-nowrap ${
                          isBanded ? 'text-ean-gold' : 'text-ean-text-light'
                        }`}
                      >
                        {isRevealed ? (
                          formatFigure(figure)
                        ) : (
                          <span className="blur-[5px] select-none" aria-hidden="true">
                            {mask(figure)}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        ))}

        {/* Terms are not prices, so they stay legible while the table is locked. */}
        <tbody>
          <tr>
            <th colSpan={6} scope="rowgroup" className={`${TINT} ${CELL} sticky left-0 text-left py-2.5 font-semibold text-sm text-ean-text-light`}>
              Terms &amp; Notes
            </th>
          </tr>
          {SCHEDULE_TERMS.map((term) => (
            <tr key={term.label} className="group">
              <th scope="row" className={`${STICKY} ${CELL} ${HOVER_TINT} bg-ean-white font-medium text-ean-text-light`}>
                {term.label}
              </th>
              <td colSpan={5} className={`${CELL} ${HOVER_TINT} bg-ean-white border-l text-left text-[13.5px] text-ean-muted-light`}>
                {term.text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
