'use client'

import React, { useState } from 'react'
import type { CountryCode } from 'libphonenumber-js/max'
import { Check, Loader2, Lock } from 'lucide-react'
import type { LeadDetails } from '@/types/pricing'
import { getTrackingContext } from '@/lib/lead-tracking'
import { isLeadAlreadyCaptured, markLeadCaptured } from '@/lib/pricing/reveal-store'
import { SCHEDULE_DOCUMENT, SCHEDULE_SERVICE_COUNT } from '@/lib/pricing/rate-schedule'
import HoneypotField from '@/components/shared/HoneypotField'
import CountryPhoneField, { dialCode, regionName, type PhoneLib } from './CountryPhoneField'

interface RateSheetGateProps {
  lib: PhoneLib | null
  /** Details to start from — set when the visitor chose "Change details". */
  prefill: LeadDetails | null
  onUnlock: (lead: LeadDetails) => void
}

type FieldKey = 'name' | 'company' | 'email' | 'phone'
type FieldErrors = Record<FieldKey, string>

const NO_ERRORS: FieldErrors = { name: '', company: '', email: '', phone: '' }
const FIELD_ORDER: FieldKey[] = ['name', 'company', 'email', 'phone']

export const GATE_ID = 'rate-gate'
const inputId = (key: FieldKey) => `${GATE_ID}-${key}`
/** The first field — where "View rates" sends focus. */
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

export default function RateSheetGate({ lib, prefill, onUnlock }: RateSheetGateProps) {
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
    const lead: LeadDetails = {
      name: name.trim().replace(/\s+/g, ' '),
      company: company.trim(),
      email: email.trim().toLowerCase(),
      phone: parsed.intl ?? phone.trim(),
    }

    // The same rule as the calculator's gate: an email that already produced a
    // lead in this tab unlocks again without filing a second one.
    if (isLeadAlreadyCaptured(lead.email)) {
      onUnlock(lead)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          service: 'fbo',
          message: `Rate sheet request:
- Viewed: ${SCHEDULE_DOCUMENT.title}, ${SCHEDULE_DOCUMENT.ref} v${SCHEDULE_DOCUMENT.version}
- Company: ${lead.company}
- Phone: ${lead.phone} (${regionName(parsed.country ?? country)})`,
          tracking: getTrackingContext('pricing_rate_sheet_gate'),
          website: honeypot,
        }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.success) {
        setSubmitError(data?.error ?? 'Could not submit your details. Please try again.')
        return
      }

      markLeadCaptured(lead.email)
      onUnlock(lead)
    } catch {
      setSubmitError('Network error submitting your details. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass = (key: FieldKey) =>
    `w-full min-w-0 bg-ean-navy border rounded-lg px-3 py-2.5 font-ui text-[15px] text-ean-text-light placeholder:text-ean-text-light/20 focus:outline-2 focus:outline-ean-gold-light focus:border-transparent ${
      errors[key] ? 'border-ean-error' : 'border-ean-border-light'
    }`
  const labelClass = 'font-ui text-[12.5px] font-medium text-ean-muted-light'
  const errorText = (key: FieldKey) => (
    <span id={`${inputId(key)}-error`} className="font-ui text-xs text-ean-error" aria-live="polite">
      {errors[key]}
    </span>
  )

  const textField = (
    key: Exclude<FieldKey, 'phone'>,
    label: string,
    setter: (v: string) => void,
    props: React.InputHTMLAttributes<HTMLInputElement>,
    isFull = false
  ) => (
    <div className={`grid gap-[5px] min-w-0 ${isFull ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={inputId(key)} className={labelClass}>{label}</label>
      <input
        id={inputId(key)}
        value={values[key]}
        onChange={(e) => handleChange(key, setter)(e.target.value)}
        onBlur={handleBlur(key)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={`${inputId(key)}-error`}
        className={fieldClass(key)}
        {...props}
      />
      {errorText(key)}
    </div>
  )

  return (
    <section
      id={GATE_ID}
      aria-labelledby="rate-gate-heading"
      className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] bg-ean-white border border-ean-border-light rounded-[14px] overflow-hidden scroll-mt-24"
    >
      <div className="bg-ean-blue-muted px-6 py-[26px] grid gap-3 content-start">
        <span className="w-[38px] h-[38px] rounded-[10px] bg-ean-gold text-ean-text-dark grid place-items-center" aria-hidden="true">
          <Lock className="w-[18px] h-[18px]" />
        </span>
        <h2 id="rate-gate-heading" className="font-display font-normal text-[22px] leading-tight text-ean-text-light text-balance">
          Enter your details to see our rates
        </h2>
        <p className="font-ui text-sm text-ean-muted-light">
          Rates are shown once we know who we&apos;re quoting for, so the right member of our dispatch team can
          follow up.
        </p>
        <ul className="mt-1 grid gap-2 font-ui text-[13.5px] text-ean-muted-light">
          {[
            `All ${SCHEDULE_SERVICE_COUNT} services, across all five weight bands`,
            'Fuel and disbursement terms',
            'Takes about 30 seconds',
          ].map((point) => (
            <li key={point} className="flex gap-[9px] items-start">
              <Check className="w-4 h-4 mt-0.5 flex-none text-ean-gold" strokeWidth={2.2} aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} noValidate className="relative p-6 grid sm:grid-cols-2 gap-x-4 gap-y-3.5">
        <HoneypotField value={honeypot} onChange={setHoneypot} />
        {textField('name', 'Full name', setName, { name: 'name', autoComplete: 'name', placeholder: 'Adaeze Okafor' })}
        {textField('company', 'Company name', setCompany, {
          name: 'company',
          autoComplete: 'organization',
          placeholder: 'Operator or management company',
        })}
        {textField(
          'email',
          'Work email',
          setEmail,
          { name: 'email', type: 'email', autoComplete: 'email', inputMode: 'email', placeholder: 'name@company.com' },
          true
        )}

        <div className="grid gap-[5px] min-w-0 sm:col-span-2">
          <label htmlFor={inputId('phone')} className={labelClass}>Phone number</label>
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

        <div className="sm:col-span-2 flex justify-between items-center gap-3.5 flex-wrap pt-1">
          <p className="m-0 font-ui text-xs text-ean-slate max-w-[44ch]">
            By continuing you agree that EAN Aviation may contact you about your enquiry. We don&apos;t share your
            details.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-ean-gold hover:bg-ean-gold-light px-4 py-2.5 font-ui text-sm font-medium text-ean-text-dark cursor-pointer transition-colors disabled:opacity-55 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Revealing prices…' : 'Reveal prices'}
          </button>
        </div>

        {submitError && (
          <p role="alert" className="sm:col-span-2 m-0 font-ui text-[13px] text-ean-error">
            {submitError}
          </p>
        )}
      </form>
    </section>
  )
}
