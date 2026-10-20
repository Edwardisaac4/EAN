import React, { forwardRef } from 'react'
import {
  ISSUED_LABEL,
  SCHEDULE_CONTACT,
  SCHEDULE_DOCUMENT,
  SCHEDULE_TERMS,
} from '@/lib/pricing/rate-schedule'
import {
  QUOTE_SECTIONS,
  aircraftName,
  aircraftSpec,
  money,
  quoteHasRange,
  quoteHeading,
  quoteTotal,
  rateCaption,
  sectionLines,
  sectionNotes,
  type PricedAircraft,
  type QuoteRecipient,
} from '@/lib/pricing/quote'

// =============================================================================
// The quotation, as a document
// =============================================================================
// Inline styles and literal colours, not tokens, on purpose: "Copy as email"
// copies this markup straight into Outlook or Gmail, and an email client keeps
// only what is written on the element. Tables for the same reason. Each colour
// below names the token it mirrors, as lib/pricing/quote-pdf.ts does.

const BLUE = '#2b0098'      // ean-gold
const BLUE_DEEP = '#1a0060' // ean-blue-deep
const LAVENDER = '#cfc6ee'  // ean-muted-dark
const INK = '#1f1f23'       // ean-text-light
const INK_SOFT = '#4a4a4a'  // ean-muted-light
const MUTED = '#6b6b6b'     // ean-slate
const RULE = '#e3e0ec'
const GROUP_FILL = '#f0edf8' // ean-blue-tint
const HEAD_FILL = '#f4f5f7'  // ean-navy
const NOTE_FILL = '#fbfaf3'

/** Where the logo is served from; "Copy as email" rewrites it to an absolute URL. */
export const QUOTE_LOGO_SRC = '/images/EAN-Logo.png'

const cell: React.CSSProperties = { border: `1px solid ${RULE}`, padding: '8px 10px' }
const nowrap: React.CSSProperties = { whiteSpace: 'nowrap' }

interface QuoteDocumentProps {
  priced: readonly PricedAircraft[]
  recipient: QuoteRecipient
  quoteNo: string
  date: string
}

const QuoteDocument = forwardRef<HTMLDivElement, QuoteDocumentProps>(function QuoteDocument(
  { priced, recipient, quoteNo, date },
  ref
) {
  const isFleet = priced.length > 1
  const heading = quoteHeading(priced)

  const rows: React.ReactNode[] = []
  if (!priced.length) {
    rows.push(
      <tr key="empty">
        <td colSpan={4} style={{ ...cell, padding: '22px 10px', color: MUTED, textAlign: 'center' }}>
          Choose an aircraft and at least one service to price your quotation.
        </td>
      </tr>
    )
  }

  priced.forEach((group) => {
    const name = aircraftName(group.aircraft, group.number)
    if (isFleet) {
      rows.push(
        <tr key={`ac-${group.aircraft.id}`} style={{ background: BLUE, color: '#ffffff' }}>
          <td colSpan={4} style={{ ...cell, border: `1px solid ${BLUE}`, padding: '9px 10px' }}>
            <strong>
              Aircraft {group.number} · {name}
            </strong>
            <br />
            <span style={{ fontSize: '10.5px', color: LAVENDER }}>{aircraftSpec(group.aircraft)}</span>
          </td>
        </tr>
      )
    }
    QUOTE_SECTIONS.forEach((section) => {
      const lines = sectionLines(group, section)
      if (!lines.length) return
      rows.push(
        <tr key={`${group.aircraft.id}-${section.id}`} style={{ background: GROUP_FILL }}>
          <td colSpan={4} style={{ ...cell, padding: '7px 10px', fontWeight: 'bold' }}>
            {section.title}
            {section.note && (
              <>
                {'  '}
                <span style={{ fontWeight: 'normal', color: MUTED }}>{section.note}</span>
              </>
            )}
          </td>
        </tr>
      )
      lines.forEach((line) =>
        rows.push(
          <tr key={`${group.aircraft.id}-${line.item.id}`}>
            <td style={cell}>
              {line.item.name}
              {line.item.unit && (
                <>
                  <br />
                  <span style={{ color: MUTED }}>{line.item.unit}</span>
                </>
              )}
            </td>
            <td align="center" style={{ ...cell, padding: '8px', ...nowrap }}>
              {line.quantity}
            </td>
            <td align="right" style={{ ...cell, ...nowrap, color: line.isBanded ? BLUE : INK }}>
              {money(line.rate)}
            </td>
            <td align="right" style={{ ...cell, ...nowrap, fontWeight: 'bold' }}>
              {money(line.amount)}
            </td>
          </tr>
        )
      )
      sectionNotes(lines).forEach((note) =>
        rows.push(
          <tr key={`${group.aircraft.id}-${section.id}-note-${note}`}>
            <td colSpan={4} style={{ ...cell, background: NOTE_FILL, color: INK_SOFT }}>
              <strong style={{ color: INK }}>Note:</strong> {note}
            </td>
          </tr>
        )
      )
    })
    if (isFleet) {
      rows.push(
        <tr key={`${group.aircraft.id}-subtotal`} style={{ background: HEAD_FILL }}>
          <td colSpan={3} style={{ ...cell, padding: '9px 10px', fontWeight: 'bold' }}>
            Subtotal · {name}
          </td>
          <td align="right" style={{ ...cell, padding: '9px 10px', fontWeight: 'bold', ...nowrap }}>
            {money(group.subtotal)}
          </td>
        </tr>
      )
    }
  })

  if (priced.length) {
    rows.push(
      <tr key="total" style={{ background: BLUE_DEEP, color: '#ffffff' }}>
        <td colSpan={3} style={{ padding: '10px', border: `1px solid ${BLUE_DEEP}`, fontWeight: 'bold' }}>
          Estimated total (USD){isFleet && ` · ${priced.length} aircraft`}
        </td>
        <td
          align="right"
          style={{ padding: '10px', border: `1px solid ${BLUE_DEEP}`, fontWeight: 'bold', fontSize: '13px', ...nowrap }}
        >
          {money(quoteTotal(priced))}
        </td>
      </tr>
    )
    if (quoteHasRange(priced)) {
      rows.push(
        <tr key="range-note">
          <td colSpan={4} style={{ ...cell, padding: '7px 10px', color: MUTED, fontSize: '11px' }}>
            Where a range is shown, the final handling fee within the range is confirmed by EAN Dispatch for your
            operation.
          </td>
        </tr>
      )
    }
  }

  rows.push(
    <tr key="terms" style={{ background: GROUP_FILL }}>
      <td colSpan={4} style={{ ...cell, padding: '7px 10px', fontWeight: 'bold' }}>
        Payment &amp; Credit Terms
      </td>
    </tr>
  )
  SCHEDULE_TERMS.forEach((term) =>
    rows.push(
      <tr key={`term-${term.label}`}>
        <td style={{ ...cell, fontWeight: 'bold', verticalAlign: 'top' }}>{term.label}</td>
        <td colSpan={3} style={cell}>
          {term.text}
        </td>
      </tr>
    )
  )

  const small: React.CSSProperties = { color: INK }

  return (
    <div ref={ref}>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ padding: '0 0 18px' }}>
              <table role="presentation" width="100%">
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: 'middle' }}>
                      {/* A plain <img>, not next/image: this markup is copied into
                          email, where an optimiser URL would not resolve. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={QUOTE_LOGO_SRC}
                        alt="EAN Aviation"
                        width={124}
                        height={38}
                        style={{ display: 'block', width: '124px', height: 'auto' }}
                      />
                    </td>
                    <td align="right" style={{ verticalAlign: 'middle' }}>
                      <table role="presentation" style={{ fontSize: '11px', lineHeight: 1.7, color: MUTED }}>
                        <tbody>
                          {[
                            ['Document', 'Quotation'],
                            ['Quote no.', quoteNo],
                            ['Date', date],
                          ].map(([label, value]) => (
                            <tr key={label}>
                              <td style={{ paddingRight: '22px' }}>{label}</td>
                              <td align="right" style={small}>
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style={{ background: BLUE_DEEP, padding: '14px 20px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '10px', letterSpacing: '2px', color: LAVENDER }}>
                EAN JET CENTER &nbsp;·&nbsp; QUOTATION
              </p>
              <p style={{ margin: '0 0 4px', fontSize: '21px', color: '#ffffff' }}>Ground Handling Quotation</p>
              <p style={{ margin: 0, fontSize: '11px', color: LAVENDER }}>
                {heading.title}
                {heading.subtitle && <> &nbsp;·&nbsp; {heading.subtitle}</>} &nbsp;·&nbsp; All prices in US dollars.
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 0', borderBottom: `1px solid ${RULE}`, fontSize: '11px', color: MUTED }}>
              Prepared for &nbsp;<strong style={small}>{recipient.name}</strong> &nbsp;·&nbsp; {recipient.company}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '16px 0 4px', fontSize: '13px', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 8px' }}>Dear {recipient.name.split(' ')[0]},</p>
              <p style={{ margin: '0 0 8px' }}>
                Thank you for your interest in EAN Jet Center. Please find below our quotation for {heading.intro},
                based on the services you selected.
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ paddingTop: '6px' }}>
              <table
                role="presentation"
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: 'collapse', border: `1px solid ${RULE}`, fontSize: '12px', color: INK }}
              >
                <tbody>
                  <tr style={{ background: HEAD_FILL }}>
                    <td style={{ ...cell, padding: '12px 10px 8px', fontWeight: 'bold' }}>Service</td>
                    <td align="center" style={{ ...cell, padding: '12px 8px 8px', fontWeight: 'bold', width: '44px' }}>
                      Qty
                    </td>
                    <td
                      align="right"
                      style={{ ...cell, padding: '12px 10px 8px', fontWeight: 'bold', color: BLUE, width: '110px' }}
                    >
                      Rate
                      <br />
                      <span style={{ fontWeight: 'normal', fontSize: '10.5px' }}>{rateCaption(priced)}</span>
                    </td>
                    <td align="right" style={{ ...cell, padding: '12px 10px 8px', fontWeight: 'bold', width: '110px' }}>
                      Amount
                    </td>
                  </tr>
                  {rows}
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '18px 0 20px', fontSize: '13px', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 12px' }}>
                To confirm dates and book, reply to <strong>{SCHEDULE_CONTACT.email}</strong> or call{' '}
                {SCHEDULE_CONTACT.phone}. Fuel and any services not listed are quoted on request.
              </p>
              <p style={{ margin: 0 }}>Kind regards,</p>
              <p style={{ margin: '6px 0 0' }}>
                <strong>EAN Jet Center Dispatch</strong>
                <br />
                <span style={{ fontSize: '11.5px', color: MUTED }}>Flight Dispatch · 24/7</span>
              </p>
            </td>
          </tr>
          <tr>
            <td
              style={{ borderTop: `1px solid ${RULE}`, padding: '10px 0 0', fontSize: '10px', lineHeight: 1.7, color: MUTED }}
            >
              <strong style={{ color: BLUE }}>EAN Jet Center &nbsp;·&nbsp; Dispatch 24/7</strong>
              <br />
              <span style={small}>{SCHEDULE_CONTACT.email}</span> &nbsp;·&nbsp;{' '}
              <span style={small}>{SCHEDULE_CONTACT.phone}</span> &nbsp;·&nbsp;{' '}
              <span style={small}>{SCHEDULE_CONTACT.phone2}</span> &nbsp;·&nbsp;{' '}
              <span style={small}>{SCHEDULE_CONTACT.web}</span>
              <br />
              {SCHEDULE_CONTACT.address}
              <br />
              Rates per {SCHEDULE_DOCUMENT.ref} v{SCHEDULE_DOCUMENT.version} ({ISSUED_LABEL}). Estimate only; invoices
              reflect services delivered.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
})

export default QuoteDocument
