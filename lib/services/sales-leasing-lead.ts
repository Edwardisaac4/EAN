// =============================================================================
// Sales & Leasing enquiry — checking a submission and writing it up for the desk
// =============================================================================
// SERVER ONLY by use: /api/sales-leasing passes every request body through
// `parseSalesLeasingEnquiry` before anything is saved or sent. The browser runs
// the same checks for the visitor's convenience; these are the ones that count.

import {
  BRANCH_LABELS,
  CONTACT_FIELDS,
  CONTACT_METHODS,
  EMPTY_CONTACT_DETAILS,
  answeredPath,
  buildEnquiryPath,
  describeAnswer,
  isAnswerValid,
  resolveBranch,
  validateContactDetails,
  type AnsweredQuestion,
  type ContactDetails,
  type EnquiryAnswerValue,
  type EnquiryAnswers,
  type EnquiryBranch,
} from '@/lib/sales-leasing-enquiry'
import {
  TEMPERATURE_ACTIONS,
  TEMPERATURE_LABELS,
  scoreEnquiry,
  type EnquiryScore,
  type LeadTemperature,
} from '@/lib/sales-leasing-score'
import type { LeadPriorityEnum, LeadServiceEnum } from '@/types/database'

/**
 * Filed under `charter`, the service labelled "Aircraft Sales & Charter". The
 * `leasing` service looks closer but is hangar and office space, and giving
 * aircraft sales a service of its own needs a migration to the `lead_service`
 * enum. The tracking form id and the message's first line are what set these
 * apart from charter requests.
 */
export const SALES_LEASING_LEAD_SERVICE: LeadServiceEnum = 'charter'

/**
 * Hot is `high`, not `urgent`: urgent carries a one-hour response SLA in the
 * admin desk, and the guide gives a Hot lead 24 hours.
 */
export const TEMPERATURE_PRIORITY: Record<LeadTemperature, LeadPriorityEnum> = {
  hot: 'high',
  warm: 'normal',
  cold: 'low',
}

/** First line of every enquiry's message, so the admin desk can spot one at a glance. */
const MESSAGE_TITLE = 'AIRCRAFT SALES & LEASING ENQUIRY'

/** Question ids are kebab-case. Anything else — `__proto__` included — is not an answer. */
const ANSWER_ID = /^[a-z][a-z0-9-]*$/
const MAX_ANSWERS = 40
const MAX_MULTI_PICKS = 10
/** Well above any question's own limit; only stops an oversized body being processed. */
const MAX_RAW_LENGTH = 1000

export interface SalesLeasingEnquiry {
  branch: EnquiryBranch
  /** Only questions on this visitor's path, each with a value that question could produce. */
  answered: AnsweredQuestion[]
  contact: ContactDetails
  score: EnquiryScore
}

export type ParsedEnquiry =
  | { ok: true; enquiry: SalesLeasingEnquiry }
  | { ok: false; error: string }

/**
 * One line of plain text. The message is plain text read top to bottom, so a
 * typed answer carrying newlines could otherwise add a line of its own — a
 * second "Lead score:" further down, say.
 */
function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function sanitizeAnswers(value: unknown): Record<string, EnquiryAnswerValue> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const answers: Record<string, EnquiryAnswerValue> = {}
  const entries = Object.entries(value as Record<string, unknown>).slice(0, MAX_ANSWERS)
  for (const [id, raw] of entries) {
    if (!ANSWER_ID.test(id)) continue
    if (typeof raw === 'string' && raw.length <= MAX_RAW_LENGTH) {
      answers[id] = oneLine(raw)
    } else if (
      Array.isArray(raw) &&
      raw.length <= MAX_MULTI_PICKS &&
      raw.every((item): item is string => typeof item === 'string' && item.length <= MAX_RAW_LENGTH)
    ) {
      answers[id] = raw.map(oneLine)
    }
  }
  return answers
}

function sanitizeContact(value: unknown): ContactDetails {
  const raw: Record<string, unknown> =
    value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {}
  const text = (key: string): string => {
    const field = raw[key]
    return typeof field === 'string' && field.length <= MAX_RAW_LENGTH ? oneLine(field) : ''
  }

  const details: ContactDetails = { ...EMPTY_CONTACT_DETAILS }
  for (const field of CONTACT_FIELDS) {
    details[field.id] = text(field.id)
  }
  details.contactMethod = CONTACT_METHODS.find((m) => m.id === raw.contactMethod)?.id ?? ''
  details.hasAcceptedProofOfFunds = raw.hasAcceptedProofOfFunds === true
  return details
}

/**
 * Accepts a submission only if every question the visitor's own path asks was
 * answered, and the contact details pass the same rules the screen applies.
 * The score is worked out here, from the cleaned answers — never taken from
 * the browser.
 */
export function parseSalesLeasingEnquiry(body: Record<string, unknown>): ParsedEnquiry {
  const submitted = sanitizeAnswers(body.answers)

  const branch = resolveBranch(submitted)
  if (!branch) {
    return { ok: false, error: 'Please choose whether you want to buy or lease, and what kind of aircraft.' }
  }

  const unanswered = buildEnquiryPath(submitted).find(
    (question) => !question.isOptional && !isAnswerValid(question, submitted[question.id]),
  )
  if (unanswered) {
    return { ok: false, error: `Please go back and answer “${unanswered.title}”.` }
  }

  const answered = answeredPath(submitted)
  const answers: EnquiryAnswers = Object.fromEntries(
    answered.map(({ question, value }) => [question.id, value]),
  )

  const contact = sanitizeContact(body.contact)
  const contactErrors = validateContactDetails(contact)
  const firstContactError = [...CONTACT_FIELDS.map((f) => f.id), 'contactMethod' as const]
    .map((id) => contactErrors[id])
    .find(Boolean)
  if (firstContactError) {
    return { ok: false, error: firstContactError }
  }

  const score = scoreEnquiry({
    branch,
    answers,
    company: contact.company,
    companyWebsite: contact.companyWebsite,
    hasAcceptedProofOfFunds: contact.hasAcceptedProofOfFunds,
  })

  return { ok: true, enquiry: { branch, answered, contact, score } }
}

export function contactMethodLabel(contact: ContactDetails): string {
  return CONTACT_METHODS.find((m) => m.id === contact.contactMethod)?.label ?? ''
}

/**
 * The lead's message: what the admin desk shows, and the record that outlives
 * the email. Name, email, phone and company have columns of their own, so they
 * are not repeated here.
 */
export function composeEnquiryMessage({ branch, answered, contact, score }: SalesLeasingEnquiry): string {
  const reasons = score.lines.length
    ? score.lines.map((line) => `+${line.points}  ${line.reason}`)
    : ['No answers that earn points']

  return [
    MESSAGE_TITLE,
    `Route: ${BRANCH_LABELS[branch]}`,
    `Lead score: ${TEMPERATURE_LABELS[score.temperature].toUpperCase()} (${score.points} points)`,
    `Next step: ${TEMPERATURE_ACTIONS[score.temperature]}`,
    '',
    'WHY THIS SCORE',
    ...reasons,
    '',
    'ANSWERS',
    ...answered.map(({ question, value }) => `${question.title} — ${describeAnswer(question, value)}`),
    '',
    'CONTACT',
    `Country: ${contact.country}`,
    ...(contact.companyWebsite ? [`Company website: ${contact.companyWebsite}`] : []),
    `Preferred contact: ${contactMethodLabel(contact)}`,
    `Proof-of-funds box: ${contact.hasAcceptedProofOfFunds ? 'ticked' : 'not ticked'}`,
  ].join('\n')
}
