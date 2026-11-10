import type { HookData, RowInput } from 'jspdf-autotable'
import {
  ISSUED_LABEL,
  SCHEDULE_CONTACT,
  SCHEDULE_DOCUMENT,
  SCHEDULE_TERMS,
} from './rate-schedule'
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
} from './quote'

// =============================================================================
// Quotation PDF — the /pricing download, drawn client-side
// =============================================================================
// jsPDF and its table plugin are imported inside the download call, not at the
// top of the module, so neither reaches the page bundle; they load only when a
// visitor asks for the PDF.
//
// jsPDF takes RGB triples, not CSS, so the design tokens are restated here by
// value. Each one names the token it mirrors.

type Rgb = [number, number, number]

const BLUE: Rgb = [43, 0, 152]          // ean-gold / ean-blue #2b0098
const BLUE_DEEP: Rgb = [26, 0, 96]      // ean-blue-deep #1a0060
const LAVENDER: Rgb = [207, 198, 238]   // ean-muted-dark #cfc6ee
const INK: Rgb = [31, 31, 35]           // ean-text-light #1f1f23
const INK_SOFT: Rgb = [74, 74, 74]      // ean-muted-light #4a4a4a
const MUTED: Rgb = [107, 107, 107]      // ean-slate #6b6b6b
const WHITE: Rgb = [255, 255, 255]
const RULE: Rgb = [227, 224, 236]
const GROUP_FILL: Rgb = [240, 237, 248] // ean-blue-tint #f0edf8
const HEAD_FILL: Rgb = [244, 245, 247]  // ean-navy #f4f5f7
const NOTE_FILL: Rgb = [251, 250, 243]

const LOGO_SRC = '/images/EAN-Logo.png'
// The logo file is 586 × 180 px; these keep that ratio at two widths.
const LOGO_MM = { width: 38, height: 11.67 }
const LOGO_CONT_MM = { width: 26, height: 7.99 }

const PAGE_W = 210
const MARGIN = 14
const BODY_TOP = 22
const BODY_BOTTOM = 28

interface Stamp {
  date: string
  time: string
}

function stampOf(now: Date): Stamp {
  return {
    date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  }
}

/** The logo as a data URL, or null — a missing logo should not cost the PDF. */
async function loadLogo(): Promise<string | null> {
  try {
    const res = await fetch(LOGO_SRC)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function tableBody(priced: readonly PricedAircraft[]): RowInput[] {
  const body: RowInput[] = []
  const isFleet = priced.length > 1
  const groupStyles = { fillColor: GROUP_FILL, fontStyle: 'bold' as const, halign: 'left' as const }

  priced.forEach((group) => {
    if (isFleet) {
      body.push([
        {
          content: `Aircraft ${group.number} · ${aircraftName(group.aircraft, group.number)}\n${aircraftSpec(group.aircraft)}`,
          colSpan: 4,
          styles: { fillColor: BLUE, textColor: WHITE, fontStyle: 'bold', halign: 'left' },
        },
      ])
    }
    QUOTE_SECTIONS.forEach((section) => {
      const lines = sectionLines(group, section)
      if (!lines.length) return
      body.push([{ content: section.title + (section.note ? `   ${section.note}` : ''), colSpan: 4, styles: groupStyles }])
      lines.forEach((line) =>
        body.push([
          { content: line.item.name + (line.item.unit ? `\n${line.item.unit}` : ''), styles: { halign: 'left' } },
          { content: String(line.quantity), styles: { halign: 'center' } },
          // Banded figures print in the brand blue and flat ones in ink, as on the page.
          { content: money(line.rate), styles: { textColor: line.isBanded ? BLUE : INK } },
          { content: money(line.amount), styles: { fontStyle: 'bold' } },
        ])
      )
      sectionNotes(lines).forEach((note) =>
        body.push([
          { content: `Note: ${note}`, colSpan: 4, styles: { halign: 'left', fillColor: NOTE_FILL, textColor: INK_SOFT } },
        ])
      )
    })
    if (isFleet) {
      body.push([
        {
          content: `Subtotal · ${aircraftName(group.aircraft, group.number)}`,
          colSpan: 3,
          styles: { halign: 'left', fontStyle: 'bold', fillColor: HEAD_FILL },
        },
        { content: money(group.subtotal), styles: { fontStyle: 'bold', fillColor: HEAD_FILL } },
      ])
    }
  })

  body.push([
    {
      content: `Estimated total (USD)${isFleet ? `  ·  ${priced.length} aircraft` : ''}`,
      colSpan: 3,
      styles: { halign: 'left', fillColor: BLUE_DEEP, textColor: WHITE, fontStyle: 'bold' },
    },
    { content: money(quoteTotal(priced)), styles: { fillColor: BLUE_DEEP, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5 } },
  ])
  if (quoteHasRange(priced)) {
    body.push([
      {
        content:
          'Where a range is shown, the final handling fee within the range is confirmed by EAN Dispatch for your operation.',
        colSpan: 4,
        styles: { halign: 'left', textColor: MUTED, fontSize: 7.2 },
      },
    ])
  }

  body.push([{ content: 'Payment & Credit Terms', colSpan: 4, styles: groupStyles }])
  SCHEDULE_TERMS.forEach((term) =>
    body.push([
      { content: term.label, styles: { halign: 'left', fontStyle: 'bold' } },
      { content: term.text, colSpan: 3, styles: { halign: 'left' } },
    ])
  )
  return body
}

export interface QuotePdfInput {
  priced: readonly PricedAircraft[]
  recipient: QuoteRecipient & { email: string; phone: string }
  quoteNo: string
}

async function buildPdf({ priced, recipient, quoteNo }: QuotePdfInput): Promise<{ blob: Blob; filename: string }> {
  const [{ jsPDF }, { autoTable }, logo] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
    loadLogo(),
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const stamp = stampOf(new Date())
  const heading = quoteHeading(priced)
  const pageHeight = () => doc.internal.pageSize.getHeight()

  // Header — logo left, quotation reference right.
  if (logo) doc.addImage(logo, 'PNG', MARGIN, 12, LOGO_MM.width, LOGO_MM.height)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const reference: [string, string][] = [
    ['Document', 'Quotation'],
    ['Quote no.', quoteNo],
    ['Date', stamp.date],
    ['Downloaded', `${stamp.date}, ${stamp.time}`],
  ]
  reference.forEach(([label, value], i) => {
    doc.setTextColor(...MUTED)
    doc.text(label, PAGE_W - MARGIN - 52, 14 + i * 4.2)
    doc.setTextColor(...INK)
    doc.text(value, PAGE_W - MARGIN, 14 + i * 4.2, { align: 'right' })
  })

  // Title band.
  doc.setFillColor(...BLUE_DEEP)
  doc.rect(MARGIN, 33, PAGE_W - 2 * MARGIN, 21, 'F')
  doc.setFontSize(7)
  doc.setTextColor(...LAVENDER)
  doc.text('EAN JET CENTER  ·  QUOTATION', MARGIN + 6, 39.5, { charSpace: 0.5 })
  doc.setFontSize(16)
  doc.setTextColor(...WHITE)
  doc.text('Ground Handling Quotation', MARGIN + 6, 46.5)
  doc.setFontSize(8)
  doc.setTextColor(...LAVENDER)
  const strap = [heading.title, heading.subtitle, 'All prices in US dollars.'].filter(Boolean).join('  ·  ')
  doc.text(doc.splitTextToSize(strap, PAGE_W - 2 * MARGIN - 12)[0], MARGIN + 6, 51)

  // Prepared for.
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Prepared for', MARGIN, 60.5)
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.text(recipient.name, MARGIN + 19, 60.5)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `·  ${[recipient.company, recipient.email, recipient.phone].join('  ·  ')}`,
    MARGIN + 19 + doc.getTextWidth(recipient.name) + 2,
    60.5
  )
  doc.setDrawColor(...RULE)
  doc.line(MARGIN, 63, PAGE_W - MARGIN, 63)

  doc.setFontSize(9.5)
  doc.setTextColor(...INK)
  doc.text(`Dear ${recipient.name.split(' ')[0]},`, MARGIN, 70)
  doc.text(
    doc.splitTextToSize(
      `Thank you for your interest in EAN Jet Center. Please find below our quotation for ${heading.intro}, based on the services you selected.`,
      PAGE_W - 2 * MARGIN
    ),
    MARGIN,
    76
  )

  const drawPageChrome = (pageNumber: number) => {
    const h = pageHeight()
    if (pageNumber > 1) {
      if (logo) doc.addImage(logo, 'PNG', PAGE_W - MARGIN - LOGO_CONT_MM.width, 8, LOGO_CONT_MM.width, LOGO_CONT_MM.height)
      doc.setFontSize(10)
      doc.setTextColor(...INK)
      doc.text(`Quotation ${quoteNo} (continued)`, MARGIN, 13.5)
    }
    doc.setDrawColor(...RULE)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, h - 22, PAGE_W - MARGIN, h - 22)
    doc.setFontSize(7.4)
    doc.setTextColor(...BLUE)
    doc.setFont('helvetica', 'bold')
    doc.text('EAN Jet Center  ·  Dispatch 24/7', MARGIN, h - 17.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...INK)
    doc.text(
      [SCHEDULE_CONTACT.email, SCHEDULE_CONTACT.phone, SCHEDULE_CONTACT.phone2, SCHEDULE_CONTACT.web].join('   ·   '),
      MARGIN,
      h - 13.5
    )
    doc.setTextColor(...MUTED)
    doc.text(SCHEDULE_CONTACT.address, MARGIN, h - 9.5)
    doc.text(`Downloaded ${stamp.date}, ${stamp.time}`, PAGE_W - MARGIN, h - 17.5, { align: 'right' })
  }

  // autoTable v5 returns nothing and does not type `doc.lastAutoTable`, so the
  // page hook records where the table ends.
  let tableEndY = 84

  autoTable(doc, {
    startY: 84,
    head: [[
      { content: 'Service', styles: { halign: 'left' } },
      { content: 'Qty', styles: { halign: 'center' } },
      { content: `Rate\n${rateCaption(priced)}`, styles: { textColor: BLUE } },
      'Amount',
    ]],
    body: tableBody(priced),
    theme: 'grid',
    margin: { left: MARGIN, right: MARGIN, top: BODY_TOP, bottom: BODY_BOTTOM },
    styles: {
      font: 'helvetica',
      fontSize: 8.4,
      cellPadding: { top: 1.6, bottom: 1.6, left: 2.6, right: 2.6 },
      lineColor: RULE,
      lineWidth: 0.2,
      textColor: INK,
      halign: 'right',
      valign: 'middle',
    },
    headStyles: { fillColor: HEAD_FILL, textColor: INK, fontStyle: 'bold', halign: 'right', lineColor: RULE },
    columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 14 }, 2: { cellWidth: 32 }, 3: { cellWidth: 32 } },
    didDrawPage: (hook: HookData) => {
      if (hook.cursor) tableEndY = hook.cursor.y
      drawPageChrome(hook.pageNumber)
    },
  })

  // The sign-off goes under the table, or on a page of its own if the table
  // ended too low for it to clear the footer.
  doc.setPage(doc.getNumberOfPages())
  let y = tableEndY + 8
  if (y > pageHeight() - 54) {
    doc.addPage()
    drawPageChrome(doc.getNumberOfPages())
    y = BODY_TOP + 4
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...INK)
  doc.text(
    doc.splitTextToSize(
      `To confirm dates and book, reply to ${SCHEDULE_CONTACT.email} or call ${SCHEDULE_CONTACT.phone}. Fuel and any services not listed are quoted on request.`,
      PAGE_W - 2 * MARGIN
    ),
    MARGIN,
    y
  )
  doc.text('Kind regards,', MARGIN, y + 11)
  doc.setFont('helvetica', 'bold')
  doc.text('EAN Jet Center Dispatch', MARGIN, y + 17)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Flight Dispatch · 24/7', MARGIN, y + 21)
  doc.setFontSize(7.2)
  doc.text(
    `Rates per ${SCHEDULE_DOCUMENT.ref} v${SCHEDULE_DOCUMENT.version} (${ISSUED_LABEL}). Estimate only; invoices reflect services delivered.`,
    MARGIN,
    y + 28
  )

  // Numbered last, so a page added for the sign-off is counted.
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(7.4)
    doc.setTextColor(...MUTED)
    doc.text(`Page ${i} of ${pages}`, PAGE_W - MARGIN, pageHeight() - 9.5, { align: 'right' })
  }

  const company = recipient.company.replace(/[\\/:*?"<>|]/g, '').trim()
  return { blob: doc.output('blob'), filename: `EAN Quotation ${quoteNo} - ${company}.pdf` }
}

/** Builds the quotation PDF and hands it to the browser. Returns the filename. */
export async function downloadQuotePdf(input: QuotePdfInput): Promise<string> {
  const { blob, filename } = await buildPdf(input)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoked late: some browsers read the blob after click() has returned.
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  return filename
}
