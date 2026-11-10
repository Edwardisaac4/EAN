// =============================================================================
// Customer Feedback Email — Resend → the two feedback departments
// Sends each /feedback submission to both department inboxes
// SERVER ONLY
// =============================================================================

import { Resend } from 'resend'
import {
  FEEDBACK_AUDIENCE_LABELS,
  FEEDBACK_TYPE_LABELS,
  type FeedbackType,
} from '@/lib/feedback'
import { escapeHtml } from '@/lib/services/lead-notifications'
import { FEEDBACK_RECIPIENTS } from '@/lib/email-recipients'

const FROM_EMAIL = 'EAN Aviation Feedback <noreply@ean.aero>'

interface FeedbackBase {
  name: string
  /** Optional for a client; required from an operator. */
  email?: string
  phone: string
  type: FeedbackType
  /** ISO date of the visit (client) or the operation (operator). */
  date?: string
  message: string
}

export type FeedbackSubmission =
  | (FeedbackBase & { audience: 'client' })
  | (FeedbackBase & {
      audience: 'operator'
      email: string
      company: string
      registration?: string
    })

interface DetailRow {
  label: string
  /** Plain text; escaped when the HTML is built. */
  value: string
  isEmail?: boolean
  isEmphasised?: boolean
}

/** "2026-10-14" → "14 Oct 2026". Parsed as UTC so the day cannot shift. */
function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** The labelled lines of the email, in reading order, skipping what was not given. */
function detailRows(feedback: FeedbackSubmission): DetailRow[] {
  const isOperator = feedback.audience === 'operator'
  const rows: DetailRow[] = [{ label: 'From', value: FEEDBACK_AUDIENCE_LABELS[feedback.audience] }]

  if (isOperator) rows.push({ label: 'Operator', value: feedback.company })

  rows.push({ label: 'Name', value: feedback.name })
  if (feedback.email) rows.push({ label: 'Email', value: feedback.email, isEmail: true })
  rows.push({ label: 'Phone', value: feedback.phone })

  if (isOperator && feedback.registration) {
    rows.push({ label: 'Aircraft', value: feedback.registration })
  }
  if (feedback.date) {
    rows.push({
      label: isOperator ? 'Date of operation' : 'Date of visit',
      value: formatDate(feedback.date),
    })
  }

  rows.push({
    label: 'Type',
    value: FEEDBACK_TYPE_LABELS[feedback.type],
    isEmphasised: feedback.type === 'complaint',
  })

  return rows
}

function rowHtml({ label, value, isEmail, isEmphasised }: DetailRow): string {
  const safe = escapeHtml(value)
  const cell = isEmail
    ? `<a href="mailto:${safe}" style="color: #2b0098; text-decoration: none;">${safe}</a>`
    : safe
  const weight = isEmphasised ? 'font-weight: 600; color: #b91c1c;' : ''

  return `
          <tr>
            <td style="padding: 8px 0; color: #6b6b6b; font-size: 13px; width: 140px; vertical-align: top;">${label}</td>
            <td style="padding: 8px 0; font-size: 14px; ${weight}">${cell}</td>
          </tr>`
}

/**
 * Sends the feedback email and reports whether Resend accepted it.
 *
 * Unlike the lead alert this is awaited and its result returned, because
 * nothing else keeps the submission: there is no table behind this form. If
 * the email does not go, the customer has to be told so they can try again —
 * confirming it would drop their feedback without anyone knowing.
 *
 * Resend v6 reports a rejected send as `{ error }` rather than throwing, so
 * both paths are checked.
 */
export async function sendFeedbackEmail(feedback: FeedbackSubmission): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[Feedback] RESEND_API_KEY is not set; feedback cannot be delivered.')
    return false
  }

  const audienceLabel = FEEDBACK_AUDIENCE_LABELS[feedback.audience]
  const typeLabel = FEEDBACK_TYPE_LABELS[feedback.type]
  const isComplaint = feedback.type === 'complaint'
  // An operator is answered as a company; a client as a person.
  const sender = feedback.audience === 'operator' ? feedback.company : feedback.name

  // Audience and type lead the subject so a mail rule can sort operator
  // complaints from client compliments without anyone opening them.
  const subject = `[${audienceLabel} · ${typeLabel}] ${sender}`

  const rows = detailRows(feedback)
  // Without an email a reply would go to noreply@, so the team is told to call.
  const howToAnswer = feedback.email
    ? `Replying to this email answers the customer directly at ${feedback.email}.`
    : `The customer left no email address. To answer, call them on ${feedback.phone}.`

  const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #1f1f23; border: 1px solid #eaecf0;">
      <div style="background: ${isComplaint ? '#b91c1c' : '#2b0098'}; padding: 24px 32px;">
        <p style="margin: 0; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.75);">
          ${audienceLabel} feedback
        </p>
        <h1 style="margin: 6px 0 0; font-size: 20px; color: #ffffff; font-weight: 700;">
          ${typeLabel} from ${escapeHtml(sender)}
        </h1>
      </div>

      <div style="padding: 28px 32px;">
        <table style="width: 100%; border-collapse: collapse;">${rows.map(rowHtml).join('')}
        </table>

        <div style="margin-top: 20px; padding: 16px; background: #f4f5f7; border-left: 3px solid #2b0098;">
          <p style="margin: 0 0 6px; font-size: 12px; color: #6b6b6b; text-transform: uppercase; letter-spacing: 0.5px;">Feedback</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-line;">${escapeHtml(feedback.message)}</p>
        </div>

        <p style="margin: 20px 0 0; font-size: 13px; color: #4a4a4a;">
          ${escapeHtml(howToAnswer)}
        </p>
      </div>

      <div style="padding: 16px 32px; background: #f9fafb; border-top: 1px solid #eaecf0;">
        <p style="margin: 0; font-size: 11px; color: #6b6b6b;">
          Sent from the feedback form at ean.aero/feedback.
        </p>
      </div>
    </div>
  `

  const textBody = [
    `${audienceLabel} ${typeLabel.toLowerCase()} from ${sender}`,
    '',
    ...rows.map((row) => `${row.label}: ${row.value}`),
    '',
    feedback.message,
    '',
    howToAnswer,
  ].join('\n')

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: FROM_EMAIL,
      to: [...FEEDBACK_RECIPIENTS],
      ...(feedback.email && { replyTo: feedback.email }),
      subject,
      html: htmlBody,
      text: textBody,
    })

    if (error) {
      console.error('[Feedback] Resend rejected the feedback email:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('[Feedback] Sending the feedback email threw:', err)
    return false
  }
}
