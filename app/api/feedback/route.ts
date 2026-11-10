// =============================================================================
// /api/feedback — public customer feedback form
// Emails each submission to the feedback departments; nothing is stored
// =============================================================================

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { FEEDBACK_MESSAGE_MAX, FEEDBACK_TYPES } from '@/lib/feedback'
import { sendFeedbackEmail } from '@/lib/services/feedback-notifications'
import {
  consumeRateLimit,
  clientIpFrom,
  feedbackKey,
  FEEDBACK_MAX_SUBMISSIONS,
  FEEDBACK_WINDOW_SECONDS,
} from '@/lib/rate-limiter'
import { badRequest, dbError } from '@/lib/supabase/helpers'

const SUCCESS_MESSAGE = 'Thank you. Your feedback has been sent to our team.'

/** A trimmed string, or undefined when blank or absent. */
function optionalText(max: number, tooLong: string) {
  return z
    .string()
    .trim()
    .max(max, tooLong)
    .nullish()
    .transform((value) => value || undefined)
}

/** Whitespace is collapsed because these go into the email subject, and a
 *  caller other than the form can send them with line breaks in. */
function requiredLine(max: number, missing: string, tooLong: string) {
  return z
    .string(missing)
    .trim()
    .min(1, missing)
    .max(max, tooLong)
    .transform((value) => value.replace(/\s+/g, ' '))
}

const email = z
  .string('An email address is required.')
  .trim()
  .toLowerCase()
  .max(254, 'That email address is too long.')
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please provide a valid email address.')

const sharedFields = {
  name: requiredLine(120, 'Your name is required.', 'That name is too long.'),
  phone: requiredLine(40, 'A phone number is required.', 'That phone number is too long.'),
  type: z.enum(FEEDBACK_TYPES, 'Please choose a compliment, suggestion or complaint.'),
  // The date of the visit or operation. Format only: the form keeps it out of
  // the future, and a wrong date on feedback is a detail, not a fault.
  date: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value || undefined)
    .pipe(z.iso.date('That date is not valid.').optional()),
  message: z
    .string('Please write your feedback.')
    .trim()
    .min(1, 'Please write your feedback.')
    .max(FEEDBACK_MESSAGE_MAX, `Feedback is limited to ${FEEDBACK_MESSAGE_MAX} characters.`),
}

// Email is required from an operator but optional for a client, who can still
// be answered on the phone number they must give. A client's is checked for
// shape only when one is given.
const clientSchema = z.object({
  audience: z.literal('client'),
  ...sharedFields,
  email: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value || undefined)
    .pipe(email.optional()),
})

const operatorSchema = z.object({
  audience: z.literal('operator'),
  ...sharedFields,
  email,
  company: requiredLine(160, 'The operator or company name is required.', 'That company name is too long.'),
  registration: optionalText(20, 'That registration is too long.').transform((value) =>
    value?.toUpperCase()
  ),
})

const feedbackSchema = z.discriminatedUnion(
  'audience',
  [clientSchema, operatorSchema],
  'Please say whether you are a client or an operator.'
)

export async function POST(request: Request) {
  try {
    // Throttled before any parsing: this is an unauthenticated path and every
    // accepted submission sends an email to two inboxes.
    const rateCheck = await consumeRateLimit(
      feedbackKey(clientIpFrom(request)),
      FEEDBACK_MAX_SUBMISSIONS,
      FEEDBACK_WINDOW_SECONDS
    )

    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too much feedback has been sent from this connection. Please try again later.',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSeconds ?? 3600) },
        }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON request body')
    }

    if (typeof body !== 'object' || body === null) {
      return badRequest('Invalid request body')
    }

    // Honeypot — see components/shared/HoneypotField.tsx. Answered with the
    // normal success shape so a bot has no signal to adapt to.
    const { website } = body as { website?: unknown }
    if (typeof website === 'string' && website.trim() !== '') {
      console.warn('[feedback] honeypot triggered, discarding submission')
      return NextResponse.json({ success: true, message: SUCCESS_MESSAGE }, { status: 201 })
    }

    const parsed = feedbackSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? 'Invalid feedback submission')
    }

    const isSent = await sendFeedbackEmail(parsed.data)

    if (!isSent) {
      return dbError(
        'We could not send your feedback just now. Please try again, or email info@ean.aero.',
        502
      )
    }

    return NextResponse.json({ success: true, message: SUCCESS_MESSAGE }, { status: 201 })
  } catch (err) {
    console.error('POST /api/feedback error:', err)
    return dbError('Internal server error sending feedback')
  }
}
