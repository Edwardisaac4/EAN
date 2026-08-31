// =============================================================================
// Lead Email Notifications — Resend → marketing@ean.aero
// Sends instant alerts to the marketing desk for high-priority leads
// SERVER ONLY
// =============================================================================

import { Resend } from 'resend'
import type { LeadRow } from '@/types/database'
import { SERVICE_LABELS, PRIORITY_LABELS } from '@/types/database'

const MARKETING_EMAIL = 'marketing@ean.aero'
const FROM_EMAIL = 'EAN Aviation Leads <noreply@ean.aero>'

/**
 * Every value below arrives from an unauthenticated public form and is dropped
 * straight into an HTML template, so it is escaped here rather than trusted.
 *
 * The risk is not the usual one: this email is only ever delivered to the desk,
 * so there is no visitor to attack. It is that a submitter can put working
 * markup — a link, a styled block — into an internal email the desk reads as
 * EAN's own, which is the shape of the impersonated-FBO fraud the security page
 * already calls out as a known pattern in this region.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ---------------------------------------------------------------------------
// Send new lead alert to marketing desk
// ---------------------------------------------------------------------------

export async function sendNewLeadAlert(lead: LeadRow): Promise<void> {
  // Only send for urgent and high priority leads (configurable)
  if (lead.priority !== 'urgent' && lead.priority !== 'high') {
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[Lead Alert] RESEND_API_KEY environment variable is missing. Skipping email notification.')
    return
  }

  const resend = new Resend(apiKey)

  const serviceLabel = SERVICE_LABELS[lead.service] || lead.service
  const priorityLabel = PRIORITY_LABELS[lead.priority] || lead.priority
  const isUrgent = lead.priority === 'urgent'

  const subject = isUrgent
    ? `🚨 URGENT LEAD: ${lead.full_name} — ${serviceLabel}`
    : `📋 New High-Priority Lead: ${lead.full_name} — ${serviceLabel}`

  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; border-radius: 12px; overflow: hidden;">
      <!-- Header -->
      <div style="background: ${isUrgent ? 'linear-gradient(135deg, #dc2626, #991b1b)' : 'linear-gradient(135deg, #c4a576, #6f5a3c)'}; padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 20px; color: #ffffff; font-weight: 700;">
          ${isUrgent ? '🚨 Urgent Lead Alert' : '📋 New Lead Alert'}
        </h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.8);">
          EAN Aviation — Lead Command Center
        </p>
      </div>

      <!-- Lead Details -->
      <div style="padding: 28px 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px; width: 140px;">Lead Code</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${lead.lead_code}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Full Name</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${escapeHtml(lead.full_name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Email</td>
            <td style="padding: 8px 0; color: #c4a576; font-size: 14px;">
              <a href="mailto:${escapeHtml(lead.email)}" style="color: #c4a576; text-decoration: none;">${escapeHtml(lead.email)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Phone</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${escapeHtml(lead.phone || 'Not provided')}</td>
          </tr>
          ${lead.company ? `
          <tr>
            <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Company</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${escapeHtml(lead.company ?? "")}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Service</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${serviceLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Priority</td>
            <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: ${isUrgent ? '#ef4444' : '#eab308'};">
              ${priorityLabel}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Est. Value</td>
            <td style="padding: 8px 0; color: #22c55e; font-size: 14px; font-weight: 600;">
              $${(lead.estimated_value || 0).toLocaleString()}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Source</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${lead.source}</td>
          </tr>
        </table>

        <!-- Message -->
        <div style="margin-top: 20px; padding: 16px; background: #171717; border-radius: 8px; border-left: 3px solid #c4a576;">
          <p style="margin: 0 0 6px; font-size: 12px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 0.5px;">Client Message</p>
          <p style="margin: 0; font-size: 14px; color: #e5e5e5; line-height: 1.6; white-space: pre-line;">${escapeHtml(lead.message)}</p>
        </div>

        ${isUrgent ? `
        <div style="margin-top: 20px; padding: 12px 16px; background: #450a0a; border-radius: 8px; border: 1px solid #dc2626;">
          <p style="margin: 0; font-size: 13px; color: #fca5a5;">
            ⏱️ <strong>SLA Reminder:</strong> Urgent leads require response within 1 hour.
          </p>
        </div>
        ` : ''}
      </div>

      <!-- Footer -->
      <div style="padding: 16px 32px; background: #0d0d0d; border-top: 1px solid #262626;">
        <p style="margin: 0; font-size: 11px; color: #737373;">
          This alert was automatically generated by the EAN Aviation Lead Management System.
          <br>Murtala Muhammed International Airport, Lagos, Nigeria
        </p>
      </div>
    </div>
  `

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [MARKETING_EMAIL],
      subject,
      html: htmlBody,
    })
    console.log(`[Lead Alert] Email sent for ${lead.lead_code} (${lead.priority}) → ${MARKETING_EMAIL}`)
  } catch (error) {
    // Non-fatal — log but don't fail the lead creation
    console.error(`[Lead Alert] Failed to send email for ${lead.lead_code}:`, error)
  }
}
