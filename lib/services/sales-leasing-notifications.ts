// =============================================================================
// Sales & Leasing enquiry alert — Resend
// One email per enquiry to SALES_LEASING_RECIPIENTS, with Hot / Warm / Cold in
// the subject so the inbox itself says who to call first.
// SERVER ONLY
// =============================================================================

import { Resend } from 'resend'
import type { LeadRow } from '@/types/database'
import { SALES_LEASING_RECIPIENTS } from '@/lib/email-recipients'
import { escapeHtml } from '@/lib/services/lead-notifications'
import { contactMethodLabel, type SalesLeasingEnquiry } from '@/lib/services/sales-leasing-lead'
import { SITE_URL } from '@/lib/seo'
import { BRANCH_LABELS, describeAnswer } from '@/lib/sales-leasing-enquiry'
import { TEMPERATURE_ACTIONS, TEMPERATURE_LABELS, type LeadTemperature } from '@/lib/sales-leasing-score'

const FROM_EMAIL = 'EAN Aviation Leads <noreply@ean.aero>'

/** Email clients cannot read the site's tokens, so the brand values are written out. */
const BRAND_BLUE = '#2b0098'
const INK = '#1f1f23'
const SLATE = '#6b6b6b'
const RULE = '#e4e4e7'
const PAPER_RAISED = '#f4f5f7'

const TEMPERATURE_COLOURS: Record<LeadTemperature, string> = {
  hot: '#b91c1c',
  warm: '#b45309',
  cold: '#4a4a4a',
}

function row(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding: 9px 12px 9px 0; border-bottom: 1px solid ${RULE}; color: ${SLATE}; font-size: 13px; vertical-align: top; width: 42%;">${escapeHtml(label)}</td>
      <td style="padding: 9px 0; border-bottom: 1px solid ${RULE}; color: ${INK}; font-size: 14px; vertical-align: top;">${valueHtml}</td>
    </tr>`
}

function sectionTitle(text: string): string {
  return `<p style="margin: 28px 0 6px; font-size: 11px; letter-spacing: 1.4px; text-transform: uppercase; color: ${BRAND_BLUE}; font-weight: 700;">${escapeHtml(text)}</p>`
}

/** Subject and body, apart from sending, so the email can be previewed without mailing anyone. */
export function buildSalesLeasingEmail(
  leadCode: string,
  { branch, answered, contact, score }: SalesLeasingEnquiry,
): { subject: string; html: string } {
  const temperature = TEMPERATURE_LABELS[score.temperature].toUpperCase()
  const colour = TEMPERATURE_COLOURS[score.temperature]
  const who = contact.company ? `${contact.fullName} (${contact.company})` : contact.fullName

  // Bracketed so an inbox rule can sort on it, e.g. "subject contains [HOT]".
  const subject = `[${temperature}] Sales & Leasing enquiry: ${who} — ${BRANCH_LABELS[branch]}`

  const reasons = score.lines.length
    ? score.lines
        .map((line) => `<li style="margin: 2px 0;">+${line.points}&nbsp;&nbsp;${escapeHtml(line.reason)}</li>`)
        .join('')
    : '<li style="margin: 2px 0;">No answers that earn points</li>'

  const contactRows = [
    row('Name', escapeHtml(contact.fullName)),
    ...(contact.company ? [row('Company', escapeHtml(contact.company))] : []),
    ...(contact.companyWebsite ? [row('Company website', escapeHtml(contact.companyWebsite))] : []),
    row('Country', escapeHtml(contact.country)),
    row(
      'Email',
      `<a href="mailto:${escapeHtml(contact.email)}" style="color: ${BRAND_BLUE};">${escapeHtml(contact.email)}</a>`,
    ),
    row('Phone / WhatsApp', escapeHtml(contact.phone)),
    row('Prefers', `<strong>${escapeHtml(contactMethodLabel(contact))}</strong>`),
    row('Proof-of-funds box', contact.hasAcceptedProofOfFunds ? 'Ticked' : 'Not ticked'),
  ].join('')

  const answerRows = answered
    .map(({ question, value }) => row(question.title, escapeHtml(describeAnswer(question, value))))
    .join('')

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; color: ${INK}; border: 1px solid ${RULE};">
      <div style="background: ${BRAND_BLUE}; padding: 22px 28px;">
        <p style="margin: 0; font-size: 11px; letter-spacing: 1.4px; text-transform: uppercase; color: #cfc6ee;">Aircraft Sales &amp; Leasing</p>
        <h1 style="margin: 6px 0 0; font-size: 20px; color: #ffffff; font-weight: 700;">New enquiry · ${escapeHtml(BRANCH_LABELS[branch])}</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #cfc6ee;">${escapeHtml(leadCode)}</p>
      </div>

      <div style="padding: 24px 28px 8px;">
        <div style="padding: 16px 18px; background: ${PAPER_RAISED}; border-left: 4px solid ${colour};">
          <p style="margin: 0; font-size: 22px; font-weight: 700; color: ${colour};">${temperature} · ${score.points} points</p>
          <p style="margin: 6px 0 0; font-size: 14px; color: ${INK};">${escapeHtml(TEMPERATURE_ACTIONS[score.temperature])}</p>
          <ul style="margin: 10px 0 0; padding-left: 18px; font-size: 13px; color: ${SLATE};">${reasons}</ul>
        </div>

        ${sectionTitle('Contact')}
        <table style="width: 100%; border-collapse: collapse;">${contactRows}</table>

        ${sectionTitle('Their answers')}
        <table style="width: 100%; border-collapse: collapse;">${answerRows}</table>
      </div>

      <div style="padding: 18px 28px 22px; font-size: 12px; color: ${SLATE}; line-height: 1.6;">
        Reply to this email to answer ${escapeHtml(contact.fullName)} directly.
        The enquiry is also saved in the <a href="${SITE_URL}/admin/leads" style="color: ${BRAND_BLUE};">leads desk</a> as ${escapeHtml(leadCode)}.
      </div>
    </div>
  `

  return { subject, html }
}

/**
 * Sends the alert. Never throws: the lead is already saved by the time this
 * runs, so a failed email is logged rather than turned into an error for a
 * visitor whose enquiry did arrive.
 */
export async function sendSalesLeasingAlert(lead: LeadRow, enquiry: SalesLeasingEnquiry): Promise<void> {
  const recipients = [...SALES_LEASING_RECIPIENTS]
  if (!recipients.length) {
    console.warn(`[Sales & Leasing Alert] No recipients configured. Skipping email for ${lead.lead_code}.`)
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[Sales & Leasing Alert] RESEND_API_KEY is missing. Skipping email notification.')
    return
  }

  const { subject, html } = buildSalesLeasingEmail(lead.lead_code, enquiry)

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: FROM_EMAIL,
      to: recipients,
      replyTo: enquiry.contact.email,
      subject,
      html,
    })

    if (error) {
      console.error(`[Sales & Leasing Alert] Resend rejected the email for ${lead.lead_code}:`, error)
      return
    }
    console.log(`[Sales & Leasing Alert] Email sent for ${lead.lead_code} (${enquiry.score.temperature}) → ${recipients.join(', ')}`)
  } catch (error) {
    console.error(`[Sales & Leasing Alert] Failed to send email for ${lead.lead_code}:`, error)
  }
}
