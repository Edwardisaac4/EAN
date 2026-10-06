import type { CellHookData, HookData, RowInput } from 'jspdf-autotable'
import type { LeadDetails } from '@/types/pricing'
import { BANDS } from './bands'
import {
  BAND_ORDER,
  ISSUED_LABEL,
  SCHEDULE_CONTACT,
  SCHEDULE_DOCUMENT,
  SCHEDULE_SECTIONS,
  SCHEDULE_TERMS,
  figureForBand,
  formatFigure,
  isBandPriced,
} from './rate-schedule'

// =============================================================================
// Rate sheet PDF — the /pricing download, drawn client-side
// =============================================================================
// jsPDF and its table plugin are imported inside the download call, not at the
// top of the module, so neither reaches the page bundle; they load only when a
// visitor asks for the PDF.
//
// jsPDF takes RGB triples, not CSS, so the design tokens are restated here by
// value. Each one names the token it mirrors.

type Rgb = [number, number, number]

const BLUE: Rgb = [43, 0, 152]        // ean-gold / ean-blue #2b0098
const BLUE_DEEP: Rgb = [26, 0, 96]    // ean-blue-deep #1a0060
const LAVENDER: Rgb = [207, 198, 238] // ean-muted-dark #cfc6ee
const INK: Rgb = [31, 31, 35]         // ean-text-light #1f1f23
const INK_SOFT: Rgb = [74, 74, 74]    // ean-muted-light #4a4a4a
const MUTED: Rgb = [107, 107, 107]    // ean-slate #6b6b6b
const RULE: Rgb = [227, 224, 236]
const GROUP_FILL: Rgb = [239, 235, 250]
const HEAD_FILL: Rgb = [244, 245, 247] // ean-navy #f4f5f7

const LOGO_SRC = '/images/EAN-Logo.png'
// The logo file is 586 × 180 px; these keep that ratio at two widths.
const LOGO_MM = { width: 36, height: 11.06 }
const LOGO_CONT_MM = { width: 26, height: 7.99 }

const PAGE_W = 210
const MARGIN = 14
// The body area every page shares: below the continuation header, above the
// footer rule at h - 21 (with room for the rule itself).
const BODY_TOP = 22
const BODY_BOTTOM = 26

const CLOSING_NOTE =
  'Rates valid until superseded and subject to change without notice. This copy reflects the schedule in force on the download date above. Estimates are indicative; invoices reflect services delivered.'

interface Stamp {
  label: string
  iso: string
}

function downloadStamp(now: Date): Stamp {
  const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  let zone = ''
  try {
    zone =
      new Intl.DateTimeFormat('en-GB', { timeZoneName: 'short' })
        .formatToParts(now)
        .find((part) => part.type === 'timeZoneName')?.value ?? ''
  } catch {
    // Older engines without formatToParts — the time prints without a zone.
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    label: `${date}, ${time}${zone ? ` ${zone}` : ''}`,
    iso: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
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

function tableBody(): RowInput[] {
  const body: RowInput[] = []
  const groupStyles = { fillColor: GROUP_FILL, fontStyle: 'bold' as const, textColor: INK, halign: 'left' as const }

  SCHEDULE_SECTIONS.forEach((section) => {
    body.push([
      {
        content: section.title + (section.note ? `   ${section.note}` : ''),
        colSpan: 6,
        styles: groupStyles,
      },
    ])
    section.items.forEach((item) => {
      // Banded figures print in the brand blue and flat ones in ink, matching
      // the table on the page.
      const textColor = isBandPriced(item.price) ? BLUE : INK
      body.push([
        { content: item.name + (item.unit ? `\n${item.unit}` : ''), styles: { halign: 'left' } },
        ...BAND_ORDER.map((band) => ({
          content: formatFigure(figureForBand(item, band)),
          styles: { textColor },
        })),
      ])
    })
  })

  body.push([{ content: 'Terms & Notes', colSpan: 6, styles: groupStyles }])
  SCHEDULE_TERMS.forEach((term) => {
    body.push([
      { content: term.label, styles: { halign: 'left', fontStyle: 'bold' } },
      { content: term.text, colSpan: 5, styles: { halign: 'left', textColor: INK_SOFT } },
    ])
  })

  return body
}

async function buildPdf(lead: LeadDetails | null): Promise<{ blob: Blob; filename: string }> {
  const [{ jsPDF }, { autoTable }, logo] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
    loadLogo(),
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const stamp = downloadStamp(new Date())
  const pageHeight = () => doc.internal.pageSize.getHeight()

  // Header — logo left, document reference right.
  if (logo) doc.addImage(logo, 'PNG', MARGIN, 12, LOGO_MM.width, LOGO_MM.height)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  const reference: [string, string][] = [
    ['Document', SCHEDULE_DOCUMENT.ref],
    ['Version', SCHEDULE_DOCUMENT.version],
    ['Issued', ISSUED_LABEL],
    ['Downloaded', stamp.label],
  ]
  reference.forEach(([label, value], i) => {
    doc.setTextColor(...MUTED)
    doc.text(label, PAGE_W - MARGIN - 58, 13.5 + i * 4)
    doc.setTextColor(...INK)
    doc.text(value, PAGE_W - MARGIN, 13.5 + i * 4, { align: 'right' })
  })

  // Title band — the page hero, restated.
  doc.setFillColor(...BLUE_DEEP)
  doc.rect(0, 32, PAGE_W, 22, 'F')
  doc.setTextColor(...LAVENDER)
  doc.setFontSize(7)
  doc.text('EAN JET CENTER  ·  RATE SCHEDULE', MARGIN, 39, { charSpace: 0.4 })
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(19)
  doc.text(SCHEDULE_DOCUMENT.title, MARGIN, 47.5)
  doc.setFontSize(8)
  doc.setTextColor(...LAVENDER)
  doc.text('All prices in US dollars, by aircraft maximum take-off weight (MTOW).', MARGIN, 51.8)

  let y = 60
  if (lead) {
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('Prepared for', MARGIN, y)
    doc.setTextColor(...INK)
    doc.setFont('helvetica', 'bold')
    doc.text([lead.name, lead.company].filter(Boolean).join(', '), MARGIN + 20, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text([lead.email, lead.phone].filter(Boolean).join('  ·  '), PAGE_W - MARGIN, y, { align: 'right' })
    y += 4
  }

  // The continuation header and the footer. Shared by the table's pages and by
  // a page added for the closing note, so every page carries the same chrome.
  const drawPageChrome = (pageNumber: number) => {
    const h = pageHeight()

    if (pageNumber > 1) {
      if (logo) doc.addImage(logo, 'PNG', PAGE_W - MARGIN - LOGO_CONT_MM.width, 8, LOGO_CONT_MM.width, LOGO_CONT_MM.height)
      doc.setFontSize(10)
      doc.setTextColor(...INK)
      doc.text(`${SCHEDULE_DOCUMENT.title} (continued)`, MARGIN, 13.5)
    }

    // Footer — the dispatch desk and the download date on every page.
    doc.setDrawColor(...RULE)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, h - 21, PAGE_W - MARGIN, h - 21)
    doc.setFontSize(7.4)
    doc.setTextColor(...BLUE)
    doc.setFont('helvetica', 'bold')
    doc.text('EAN Jet Center  ·  Dispatch 24/7', MARGIN, h - 16.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...INK)
    doc.text(
      [SCHEDULE_CONTACT.email, SCHEDULE_CONTACT.phone, SCHEDULE_CONTACT.phone2, SCHEDULE_CONTACT.web].join('   ·   '),
      MARGIN,
      h - 12.5
    )
    doc.setTextColor(...MUTED)
    doc.text(SCHEDULE_CONTACT.address, MARGIN, h - 8.5)
    doc.text(`Downloaded ${stamp.label}`, PAGE_W - MARGIN, h - 16.5, { align: 'right' })
    doc.text(`${SCHEDULE_DOCUMENT.ref} v${SCHEDULE_DOCUMENT.version}`, PAGE_W - MARGIN, h - 12.5, { align: 'right' })
  }

  // Where the table ends on its last page. autoTable v5 returns nothing and
  // does not type `doc.lastAutoTable`, so the page hook records the cursor.
  let tableEndY = y

  autoTable(doc, {
    startY: y + 2,
    head: [[
      { content: 'Service', styles: { halign: 'left', valign: 'bottom' } },
      ...BAND_ORDER.map((band) => ({ content: `BAND ${band}\n${BANDS[band].range}` })),
    ]],
    body: tableBody(),
    theme: 'grid',
    margin: { left: MARGIN, right: MARGIN, top: BODY_TOP, bottom: BODY_BOTTOM },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: { top: 1.9, bottom: 1.9, left: 2.4, right: 2.4 },
      lineColor: RULE,
      lineWidth: 0.2,
      textColor: INK,
      halign: 'right',
      valign: 'middle',
    },
    headStyles: { fillColor: HEAD_FILL, textColor: INK, fontStyle: 'bold', fontSize: 7.6, halign: 'right', lineColor: RULE },
    columnStyles: { 0: { cellWidth: 56 } },
    didParseCell: (hook: CellHookData) => {
      if (hook.section === 'head' && hook.column.index > 0) hook.cell.styles.textColor = BLUE
    },
    didDrawPage: (hook: HookData) => {
      if (hook.cursor) tableEndY = hook.cursor.y
      drawPageChrome(hook.pageNumber)
    },
  })

  // The closing note goes under the table, unless the table ended so low that
  // the note would run into the footer — then it takes a page of its own.
  doc.setPage(doc.getNumberOfPages())
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.2)
  const noteWidth = PAGE_W - 2 * MARGIN
  const note: string[] = doc.splitTextToSize(CLOSING_NOTE, noteWidth)
  // Measured from the string with the same width, so jsPDF wraps it into the
  // same lines — its types take a string here, not the split array.
  const noteHeight = doc.getTextDimensions(CLOSING_NOTE, { maxWidth: noteWidth }).h
  let noteY = tableEndY + 6
  if (noteY + noteHeight > pageHeight() - BODY_BOTTOM) {
    doc.addPage()
    drawPageChrome(doc.getNumberOfPages())
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.2)
    noteY = BODY_TOP + 3
  }
  doc.setTextColor(...MUTED)
  doc.text(note, MARGIN, noteY)

  // Numbered last, so a page added for the note is counted.
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(7.4)
    doc.setTextColor(...MUTED)
    doc.text(`Page ${i} of ${pages}`, PAGE_W - MARGIN, pageHeight() - 8.5, { align: 'right' })
  }

  return {
    blob: doc.output('blob'),
    filename: `EAN-FBO-Rates_v${SCHEDULE_DOCUMENT.version}_downloaded-${stamp.iso}.pdf`,
  }
}

/** Builds the rate sheet PDF and hands it to the browser. Returns the filename. */
export async function downloadRateSheetPdf(lead: LeadDetails | null): Promise<string> {
  const { blob, filename } = await buildPdf(lead)
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
