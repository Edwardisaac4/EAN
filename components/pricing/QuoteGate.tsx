'use client'

import React, { useState } from 'react'
import type { CountryCode } from 'libphonenumber-js/max'
import { Loader2 } from 'lucide-react'
import type { LeadDetails } from '@/types/pricing'
import HoneypotField from '@/components/shared/HoneypotField'
import CountryPhoneField, { dialCode, regionName, type PhoneLib } from './CountryPhoneField'

export interface GateSubmission {
  lead: LeadDetails
  /** Region of the phone number, e.g. "Nigeria" — for the lead note. */
  phoneRegion: string
  honeypot: string
}

interface QuoteGateProps {
  lib: PhoneLib | null
  /** Details to start from — set when the visitor chose "Change details". */
  prefill: LeadDetails | null
  /** The quote's heading, restated on the blue band above the form. */
  title: string
  subtitle: string
  serviceSummary: string
  /** Service names drawn blurred behind the form, as a preview of the quote. */
  previewRows: string[]
  /** A priceable quote with no aircraft waiting on a weight. */
  isReady: boolean
  /** Why the button is disabled, or that the quote is ready. */
  hint: string
  /** Files the lead and unlocks the quote. Resolves to an error message, or null. */
  onSubmit: (submission: GateSubmission) => Promise<string | null>
}

type FieldKey = 'name' | 'company' | 'email' | 'phone'
type FieldErrors = Record<FieldKey, string>

const NO_ERRORS: FieldErrors = { name: '', company: '', email: '', phone: '' }
const FIELD_ORDER: FieldKey[] = ['name', 'company', 'email', 'phone']

export const GATE_ID = 'quote-gate'
const inputId = (key: FieldKey) => `${GATE_ID}-${key}`
/** The first field — where "Change details" sends focus. */
export const GATE_NAME_ID = inputId('name')

// Common misspellings of the big free-mail domains. A lead with a dead address
// is a lead nobody can answer, so the form asks rather than accepting it.
const EMAIL_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com',
  'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.co': 'gmail.com',
  'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com', 'outlok.com': 'outlook.com',
}

const EMAIL_PATTERN =
  /^(?!.*\.\.)[A-Za-z0-9._%+'-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/

interface ParsedPhone {
  ok: boolean
  intl?: string
  national?: string
  country?: string
}

function parsePhone(lib: PhoneLib | null, raw: string, country: string): ParsedPhone {
  const value = raw.trim()
  if (!lib) {
    // Metadata not loaded yet (or failed to load): a length check, so the form
    // still works rather than blocking on a library.
    const digits = value.replace(/\D/g, '')
    return digits.length >= 6 && digits.length <= 14
      ? { ok: true, intl: `+${dialCode(null, country) ?? ''} ${digits.replace(/^0/, '')}`, national: value }
      : { ok: false }
  }
  try {
    const parsed = value.startsWith('+')
      ? lib.parsePhoneNumberFromString(value)
      : lib.parsePhoneNumberFromString(value, country as CountryCode)
    if (parsed?.isValid()) {
      return {
        ok: true,
        intl: parsed.formatInternational(),
        national: parsed.formatNational(),
        country: parsed.country ?? country,
      }
    }
  } catch {
    // Unparseable input is simply invalid.
  }
  return { ok: false }
}

function validateName(value: string): string {
  const v = value.trim().replace(/\s+/g, ' ')
  if (!v) return 'Enter your full name.'
  if (!/^[\p{L}][\p{L}'’.\- ]*$/u.test(v)) return 'Use letters only in your name.'
  if (v.split(' ').filter((w) => w.replace(/[.'’-]/g, '').length).length < 2) {
    return 'Enter your first and last name.'
  }
  return ''
}

function validateCompany(value: string): string {
  const v = value.trim()
  if (!v) return 'Enter your company name.'
  if (v.length < 2) return 'Company name looks too short.'
  return ''
}

function validateEmail(value: string): string {
  const v = value.trim()
  if (!v) return 'Enter your email address.'
  const [local = '', domain = ''] = v.split('@')
  if (!EMAIL_PATTERN.test(v) || v.startsWith('.') || local.endsWith('.')) {
    return 'Enter a valid email address, like name@company.com.'
  }
  const suggestion = EMAIL_TYPOS[domain.toLowerCase()]
  if (suggestion) return `Did you mean ${local}@${suggestion}?`
  return ''
}

function validatePhone(lib: PhoneLib | null, value: string, country: string): string {
  if (!value.trim()) return 'Enter your phone number.'
  return parsePhone(lib, value, country).ok
    ? ''
    : `That isn't a valid ${regionName(country)} number. Check the digits or change the country code.`
}

function initialPhone(lib: PhoneLib | null, prefill: LeadDetails | null): { country: string; value: string } {
  if (!prefill?.phone) return { country: 'NG', value: '' }
  const parsed = parsePhone(lib, prefill.phone, 'NG')
  return parsed.ok && parsed.country
    ? { country: parsed.country, value: parsed.national ?? prefill.phone }
    : { country: 'NG', value: prefill.phone }
}

export default function QuoteGate({
  lib,
  prefill,
  title,
  subtitle,
  serviceSummary,
  previewRows,
  isReady,
  hint,
  onSubmit,
}: QuoteGateProps) {
  const [name, setName] = useState(prefill?.name ?? '')
  const [company, setCompany] = useState(prefill?.company ?? '')
  const [email, setEmail] = useState(prefill?.email ?? '')
  const [country, setCountry] = useState(() => initialPhone(lib, prefill).country)
  const [phone, setPhone] = useState(() => initialPhone(lib, prefill).value)
  const [errors, setErrors] = useState<FieldErrors>(NO_ERRORS)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Spam trap — see components/shared/HoneypotField.tsx.
  const [honeypot, setHoneypot] = useState('')

  const values: Record<FieldKey, string> = { name, company, email, phone }
  const validate = (key: FieldKey, next = values[key], nextCountry = country): string => {
    if (key === 'name') return validateName(next)
    if (key === 'company') return validateCompany(next)
    if (key === 'email') return validateEmail(next)
    return validatePhone(lib, next, nextCountry)
  }

  const setError = (key: FieldKey, message: string) =>
    setErrors((prev) => (prev[key] === message ? prev : { ...prev, [key]: message }))

  // Errors appear on blur, never mid-word; once a field is showing one, it is
  // re-checked on every keystroke so it clears the moment it is fixed.
  const handleChange = (key: FieldKey, setter: (v: string) => void) => (next: string) => {
    setter(next)
    if (errors[key]) setError(key, validate(key, next))
  }
  const handleBlur = (key: FieldKey) => () => {
    if (values[key].trim()) setError(key, validate(key))
  }

  const handlePhoneBlur = () => {
    const parsed = parsePhone(lib, phone, country)
    if (parsed.ok && parsed.country) {
      setCountry(parsed.country)
      setPhone(parsed.national ?? phone)
      setError('phone', '')
      return
    }
    if (phone.trim()) setError('phone', validate('phone'))
  }

  const handleCountryChange = (code: string) => {
    setCountry(code)
    if (phone.trim()) setError('phone', validate('phone', phone, code))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isReady || isSubmitting) return
    setSubmitError('')

    const nextErrors: FieldErrors = { ...NO_ERRORS }
    FIELD_ORDER.forEach((key) => {
      nextErrors[key] = validate(key)
    })
    setErrors(nextErrors)
    const firstBad = FIELD_ORDER.find((key) => nextErrors[key])
    if (firstBad) {
      document.getElementById(inputId(firstBad))?.focus()
      return
    }

    const parsed = parsePhone(lib, phone, country)
    setIsSubmitting(true)
    const error = await onSubmit({
      lead: {
        name: name.trim().replace(/\s+/g, ' '),
        company: company.trim(),
        email: email.trim().toLowerCase(),
        phone: parsed.intl ?? phone.trim(),
      },
      phoneRegion: regionName(parsed.country ?? country),
      honeypot,
    })
    // On success the gate unmounts, so only a failure has state left to set.
    if (error) {
      setSubmitError(error)
      setIsSubmitting(false)
    }
  }

  const fieldClass = (key: FieldKey) =>
    `w-full min-w-0 bg-ean-white border rounded-[2px] px-4 py-3.5 font-ui text-[15px] text-ean-text-light placeholder:text-ean-slate focus:outline-2 focus:outline-ean-gold-light focus:border-transparent ${
      errors[key] ? 'border-ean-error' : 'border-ean-border-light'
    }`
  const errorText = (key: FieldKey) => (
    <span id={`${inputId(key)}-error`} className="mt-[5px] empty:mt-0 font-ui text-xs text-ean-error" aria-live="polite">
      {errors[key]}
    </span>
  )

  const textField = (
    key: Exclude<FieldKey, 'phone'>,
    label: string,
    setter: (v: string) => void,
    props: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div className="flex flex-col min-w-0">
      <label htmlFor={inputId(key)} className="sr-only">{label}</label>
      <input
        id={inputId(key)}
        value={values[key]}
        onChange={(e) => handleChange(key, setter)(e.target.value)}
        onBlur={handleBlur(key)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={`${inputId(key)}-error`}
        placeholder={label}
        className={fieldClass(key)}
        {...props}
      />
      {errorText(key)}
    </div>
  )

  return (
    <section
      id={GATE_ID}
      aria-labelledby="quote-gate-heading"
      className="bg-ean-white border border-ean-border-light rounded-[4px] shadow-[0_1px_2px_var(--color-ean-blue-muted)] scroll-mt-28"
    >
      {/* The quote's own heading on the blue band, so the visitor sees which
          aircraft they are about to be quoted for before they give details. */}
      <div className="bg-ean-gold text-ean-text-dark px-5 py-[22px] sm:px-[34px] sm:pt-[26px] sm:pb-6 rounded-t-[4px]">
        <div key={title} className="ean-swap font-ui font-medium text-[clamp(24px,2.6vw,32px)] leading-[1.15] text-balance">
          {title}
        </div>
        <div className="mt-1.5 font-ui text-[15px] text-ean-text-dark/85">{subtitle}</div>
        <div className="mt-2.5 font-ui text-[13.5px] text-ean-text-dark/75">{serviceSummary}</div>
      </div>

      <div className="relative px-3.5 py-[22px] sm:px-[34px] sm:pt-[34px] sm:pb-[30px]">
        {/* The quote lines, blurred: a preview of what the form unlocks.
            Decorative — the rows carry no prices. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[18px] inset-y-[26px] grid content-start gap-4 blur-[7px] opacity-55 pointer-events-none select-none"
        >
          {previewRows.map((row, i) => (
            <div key={`${row}-${i}`} className="flex justify-between gap-4 font-ui text-sm text-ean-gold">
              <span>{row}</span>
              <b className="w-[72px] h-3 self-center rounded bg-ean-muted-dark" />
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t-2 border-ean-gold pt-3 font-ui text-sm font-semibold text-ean-gold">
            <span>Estimated total</span>
            <b className="w-[72px] h-3 self-center rounded bg-ean-muted-dark" />
          </div>
        </div>

        <div className="relative z-1 mx-auto max-w-[480px] bg-ean-navy border border-ean-border-light px-[18px] py-[22px] sm:px-[34px] sm:pt-[30px] sm:pb-[26px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-ean-white px-3.5 py-[7px] font-ui text-sm font-medium shadow-[0_1px_4px_var(--color-ean-blue-border)]">
            <i className="w-[9px] h-[9px] rounded-full bg-ean-gold" aria-hidden="true" />
            See your quote
          </span>
          <h2
            id="quote-gate-heading"
            className="mt-[18px] mb-1.5 font-ui font-semibold text-[22px] leading-[1.3] text-ean-text-light text-balance"
          >
            Enter your details to see your quote
          </h2>
          <p className="mt-0 mb-[18px] font-ui text-[15px] text-ean-muted-light">
            So our team can follow up and prepare your handling.
          </p>

          <form onSubmit={handleSubmit} noValidate className="relative grid gap-3">
            <HoneypotField value={honeypot} onChange={setHoneypot} />
            {textField('name', 'Full name', setName, { name: 'name', autoComplete: 'name' })}
            {textField('company', 'Company name', setCompany, { name: 'company', autoComplete: 'organization' })}
            {textField('email', 'Email', setEmail, {
              name: 'email',
              type: 'email',
              autoComplete: 'email',
              inputMode: 'email',
            })}

            <div className="flex flex-col min-w-0">
              <label htmlFor={inputId('phone')} className="sr-only">Phone / WhatsApp</label>
              <CountryPhoneField
                inputId={inputId('phone')}
                describedBy={`${inputId('phone')}-error`}
                lib={lib}
                country={country}
                onCountryChange={handleCountryChange}
                value={phone}
                onValueChange={handleChange('phone', setPhone)}
                onBlur={handlePhoneBlur}
                isInvalid={Boolean(errors.phone)}
              />
              {errorText('phone')}
            </div>

            <div className="grid gap-2.5 pt-0.5">
              <button
                type="submit"
                disabled={!isReady || isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[2px] bg-ean-gold hover:bg-ean-gold-light px-4 py-[15px] font-ui text-base font-semibold text-ean-text-dark shadow-ean-gold cursor-pointer transition-colors disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:bg-ean-gold"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                {isSubmitting ? 'Preparing your quote…' : 'See Quote'}
              </button>
              <p className="m-0 text-center font-ui text-[13px] text-ean-muted-light" aria-live="polite">
                {hint}
              </p>
              {submitError && (
                <p role="alert" className="m-0 text-center font-ui text-[13px] text-ean-error">
                  {submitError}
                </p>
              )}
              <p className="m-0 text-center font-ui text-[11.5px] text-ean-slate">
                By continuing you agree that EAN Aviation may contact you about your enquiry. We don&apos;t share
                your details.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
