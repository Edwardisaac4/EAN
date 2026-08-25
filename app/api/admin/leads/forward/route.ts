// =============================================================================
// /api/admin/leads/forward — Forward / Redirect Lead Email Notification
// Sends formatted email to target staff member/sales rep via Resend
// SERVER ONLY
// =============================================================================

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { adminSupabase } from '@/utils/supabase/admin'
import { dbError, badRequest } from '@/lib/supabase/helpers'
import { requireAdmin } from '@/lib/auth-guard'

const FROM_EMAIL = 'EAN Aviation Lead Handoff <noreply@ean.aero>'

// ---------------------------------------------------------------------------
// HTML Escaping — prevents XSS from lead-supplied content in email templates
// ---------------------------------------------------------------------------
function escapeHtml(value: string | undefined | null): string {
  if (!value) return ''
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ---------------------------------------------------------------------------
// Basic email format check — consistent with project's manual validation style
// ---------------------------------------------------------------------------
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    // -----------------------------------------------------------------------
    // Auth Guard — verify admin session cookie before any processing
    // -----------------------------------------------------------------------
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    // -----------------------------------------------------------------------
    // Body Parsing
    // -----------------------------------------------------------------------
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON body')
    }

    const {
      leadId,
      leadCode,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      serviceName,
      message,
      recipientEmail,
      recipientName,
      note,
      senderName = 'Marketing Desk',
    } = body as {
      leadId?: string
      leadCode?: string
      clientName?: string
      clientEmail?: string
      clientPhone?: string
      clientCompany?: string
      serviceName?: string
      message?: string
      recipientEmail?: string
      recipientName?: string
      note?: string
      senderName?: string
    }

    // -----------------------------------------------------------------------
    // Required-field validation
    // -----------------------------------------------------------------------
    if (!recipientEmail || !clientName) {
      return badRequest('Recipient email and client name are required')
    }

    if (!EMAIL_REGEX.test(recipientEmail)) {
      return badRequest('Invalid recipient email format')
    }

    // Enforce @ean.aero domain for all forwarded emails
    if (!recipientEmail.toLowerCase().endsWith('@ean.aero')) {
      return badRequest('Recipient email must be an @ean.aero address')
    }

    const displayCode = leadCode || leadId || 'EAN-LEAD'
    const staffName = recipientName || recipientEmail

    // -----------------------------------------------------------------------
    // Escape all lead-supplied values before inserting into HTML
    // -----------------------------------------------------------------------
    const safeClientName = escapeHtml(clientName)
    const safeClientEmail = escapeHtml(clientEmail)
    const safeClientPhone = escapeHtml(clientPhone)
    const safeClientCompany = escapeHtml(clientCompany)
    const safeServiceName = escapeHtml(serviceName)
    const safeMessage = escapeHtml(message)
    const safeNote = escapeHtml(note)
    const safeSenderName = escapeHtml(senderName)
    const safeStaffName = escapeHtml(staffName)
    const safeDisplayCode = escapeHtml(displayCode)

    // URL-encode values for mailto/tel href attributes
    const encodedClientEmail = encodeURIComponent(clientEmail || '')
    const encodedClientPhone = encodeURIComponent(clientPhone || '')
    const encodedMailtoSubject = encodeURIComponent(`Re: EAN Aviation Inquiry (${displayCode})`)

    // -----------------------------------------------------------------------
    // 1. Send Forwarding Email via Resend
    // -----------------------------------------------------------------------
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const resend = new Resend(apiKey)

      const subject = `📥 Lead Redirect [${safeDisplayCode}]: ${safeClientName} — ${safeServiceName || 'General Inquiry'}`

      const htmlBody = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; border-radius: 12px; overflow: hidden; border: 1px solid #262626;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #c9a84c, #8b6914); padding: 24px 32px;">
            <h1 style="margin: 0; font-size: 20px; color: #ffffff; font-weight: 700;">
              📥 Internal Lead Handoff &amp; Redirect
            </h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.85);">
              EAN Aviation Command Desk → ${safeStaffName}
            </p>
          </div>

          <!-- Note Banner if added by sender -->
          ${
            note
              ? `
          <div style="padding: 16px 32px; background: #1c1917; border-bottom: 1px solid #292524; border-left: 4px solid #c9a84c;">
            <p style="margin: 0 0 4px; font-size: 11px; color: #c9a84c; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              Handoff Note from ${safeSenderName}
            </p>
            <p style="margin: 0; font-size: 13px; color: #f5f5f4; font-style: italic;">
              &quot;${safeNote}&quot;
            </p>
          </div>
          `
              : ''
          }

          <!-- Lead Details Table -->
          <div style="padding: 28px 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px; width: 140px;">Lead Code</td>
                <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${safeDisplayCode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Client Name</td>
                <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${safeClientName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Email Address</td>
                <td style="padding: 8px 0; color: #c9a84c; font-size: 14px;">
                  <a href="mailto:${encodedClientEmail}" style="color: #c9a84c; text-decoration: none;">${safeClientEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Phone Number</td>
                <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">
                  <a href="tel:${encodedClientPhone}" style="color: #ffffff; text-decoration: none;">${safeClientPhone || 'Not provided'}</a>
                </td>
              </tr>
              ${
                clientCompany
                  ? `
              <tr>
                <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Company</td>
                <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${safeClientCompany}</td>
              </tr>
              `
                  : ''
              }
              <tr>
                <td style="padding: 8px 0; color: #a3a3a3; font-size: 13px;">Service Required</td>
                <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${safeServiceName || 'General'}</td>
              </tr>
            </table>

            <!-- Client Message -->
            <div style="margin-top: 20px; padding: 16px; background: #171717; border-radius: 8px; border: 1px solid #262626;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Client Message</p>
              <p style="margin: 0; font-size: 14px; color: #e5e5e5; line-height: 1.6;">${safeMessage || 'No message content provided.'}</p>
            </div>

            <!-- Direct Action Button -->
            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${encodedClientEmail}?subject=${encodedMailtoSubject}" style="display: inline-block; background: #c9a84c; color: #0a0a0a; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 13px;">
                Reply Directly to Client
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 32px; background: #0d0d0d; border-top: 1px solid #262626; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #737373;">
              This lead was reassigned and forwarded via the EAN Aviation Lead Management Hub.
              <br>Murtala Muhammed International Airport, Lagos, Nigeria
            </p>
          </div>
        </div>
      `

      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [recipientEmail],
        subject,
        html: htmlBody,
      })

      if (sendError) {
        console.error('[Lead Forward] Resend send failed:', sendError)
        return dbError(`Email delivery failed: ${sendError.message || 'Unknown Resend error'}`)
      }
    } else {
      console.warn('[Lead Forward] RESEND_API_KEY missing. Simulated email forwarding to:', recipientEmail)
    }

    // -----------------------------------------------------------------------
    // 2. Audit Trail & Supabase DB update if leadId exists (non-fatal)
    // -----------------------------------------------------------------------
    if (leadId) {
      try {
        const { error: updateError } = await adminSupabase
          .from('leads')
          .update({ assigned_to: staffName })
          .eq('id', leadId)

        if (updateError) {
          console.warn('[Lead Forward] Non-fatal: leads update failed:', updateError.message)
        }

        const { error: insertError } = await adminSupabase.from('lead_activities').insert({
          lead_id: leadId,
          author: senderName,
          action: `Redirected & forwarded lead to ${staffName} (${recipientEmail})`,
          note: note || undefined,
        })

        if (insertError) {
          console.warn('[Lead Forward] Non-fatal: lead_activities insert failed:', insertError.message)
        }
      } catch (dbErr) {
        console.warn('[Lead Forward] Non-fatal Supabase audit update:', dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Lead successfully redirected and email forwarded to ${staffName} (${recipientEmail}).`,
    })
  } catch (err) {
    console.error('POST /api/admin/leads/forward error:', err)
    return dbError('Failed to forward lead email')
  }
}
