'use client';

import React, { useState } from 'react';
import { Check, ConciergeBell, PlaneTakeoff, type LucideIcon } from 'lucide-react';
import GoldButton from '@/components/shared/GoldButton';
import HoneypotField from '@/components/shared/HoneypotField';
import {
  FEEDBACK_AUDIENCES,
  FEEDBACK_AUDIENCE_LABELS,
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_TYPES,
  FEEDBACK_TYPE_LABELS,
  type FeedbackAudience,
  type FeedbackType,
} from '@/lib/feedback';

/**
 * The customer feedback form on /feedback.
 *
 * Opens on a single question — client or operator — and shows the form for the
 * answer. The two ask for different things: an operator's feedback is about a
 * movement, so it carries the company and the aircraft, which a
 * passenger's lounge or charter feedback has no use for.
 *
 * It posts to `/api/feedback`, not `/api/leads`. Feedback is not a sales lead:
 * routed through the leads pipeline it would be scored, prioritised and worked
 * by the marketing desk, and a complaint filed as `general` derives to low
 * priority and is never emailed to anyone. The feedback route emails the
 * departments that own it and stores nothing.
 *
 * Field styling follows CharterRequestForm, which is the reference for forms on
 * the paper ramp.
 */

/**
 * Both audiences in one state object, so switching between them mid-way keeps
 * what was typed into the fields they share. Fields the chosen audience does
 * not show are never sent.
 */
interface FeedbackFormState {
  name: string;
  email: string;
  phone: string;
  date: string;
  message: string;
  company: string;
  registration: string;
}

const EMPTY_FORM: FeedbackFormState = {
  name: '',
  email: '',
  phone: '',
  date: '',
  message: '',
  company: '',
  registration: '',
};

const AUDIENCE_HINTS: Record<FeedbackAudience, string> = {
  client: 'passengers, principals, and lounge, charter or catering customers',
  operator: 'aircraft operators, flight departments and crews we handle',
};

const AUDIENCE_ICONS: Record<FeedbackAudience, LucideIcon> = {
  client: ConciergeBell,
  operator: PlaneTakeoff,
};

const MESSAGE_PLACEHOLDERS: Record<FeedbackAudience, string> = {
  client: 'What happened? Tell us which lounge, flight or order it relates to.',
  operator: 'What happened? Include the flight number or callsign, and times if they matter.',
};

const LABEL = 'block font-mono text-[10.5px] tracking-[0.14em] uppercase text-ean-gold mb-2';

const FIELD =
  'w-full bg-ean-navy border text-ean-text-light px-3.25 py-2.75 font-ui text-sm rounded-sm placeholder:text-ean-slate focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors duration-200';

const CHIP =
  'font-ui text-[12.5px] border px-3.5 py-1.75 rounded-full cursor-pointer transition-all duration-200';

const CHIP_ON =
  'border-ean-blue text-ean-blue-light bg-ean-blue-muted/30 shadow-[0_0_12px_rgba(43,0,152,0.15)]';

const CHIP_OFF =
  'border-ean-border-dark text-ean-slate hover:border-ean-blue hover:text-ean-blue-light';

const FALLBACK_ERROR =
  'We could not send your feedback. Please try again, or email info@ean.aero.';

export default function FeedbackForm() {
  const [audience, setAudience] = useState<FeedbackAudience | null>(null);
  const [form, setForm] = useState<FeedbackFormState>(EMPTY_FORM);
  // No default: a complaint left on a preselected "Compliment" would reach the
  // departments mislabelled, so the customer has to choose.
  const [type, setType] = useState<FeedbackType | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const isOperator = audience === 'operator';

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleAudienceChange = (value: FeedbackAudience) => {
    setAudience(value);
    // Errors were raised against the other form's fields.
    setErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const validate = () => {
    const found: Record<string, string> = {};

    if (!type) found.type = 'Choose whether this is a compliment, suggestion or complaint.';
    if (isOperator && !form.company.trim()) found.company = 'The operator or company name is required.';
    if (!form.name.trim()) found.name = 'Your name is required.';

    // Required from an operator only; a client can be answered by phone.
    if (!form.email.trim()) {
      if (isOperator) found.email = 'An email address is required so we can reply.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      found.email = 'That email address does not look right.';
    }

    if (!form.phone.trim()) found.phone = 'A phone number is required.';

    // Feedback is about something that has happened. Checked on submit against
    // the browser's clock rather than as a `max` attribute, which would have to
    // read the clock during render and could mismatch on hydration.
    if (form.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(`${form.date}T00:00:00`) > today) {
        found.date = 'That date is in the future.';
      }
    }

    if (!form.message.trim()) found.message = 'Please write your feedback.';

    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validate() replaces the whole error map, which also clears any form-level
    // failure left over from the previous attempt.
    if (!audience || !validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience,
          type,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          date: form.date,
          message: form.message.trim(),
          ...(isOperator && {
            company: form.company.trim(),
            registration: form.registration.trim(),
          }),
          website: honeypot,
        }),
      });

      const data = await response.json().catch(() => null);

      // The route answers only once the email has gone. Anything else means it
      // did not, and nothing else holds the feedback, so never confirm it.
      if (!response.ok || !data?.success) {
        setIsSubmitting(false);
        setErrors({ form: data?.error ?? FALLBACK_ERROR });
        return;
      }

      setIsSubmitting(false);
      setIsSent(true);
      setForm(EMPTY_FORM);
      setType(null);
    } catch {
      setIsSubmitting(false);
      setErrors({ form: `Network error. ${FALLBACK_ERROR}` });
    }
  };

  if (isSent) {
    return (
      <div className="border border-ean-gold bg-ean-navy p-8 sm:p-10 max-w-[70ch]">
        <p className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-ean-gold">
          Feedback received
        </p>
        <h3 className="font-display text-2xl sm:text-3xl mt-3">Thank you for telling us.</h3>
        <p className="font-ui text-sm text-ean-muted-light font-light mt-4 leading-relaxed">
          Your feedback has gone to the teams responsible. If it needs an answer, we will get
          back to you on the contact details you gave.
        </p>
        <button
          type="button"
          onClick={() => setIsSent(false)}
          className="mt-6 font-mono text-[10.5px] tracking-[0.14em] uppercase text-ean-slate hover:text-ean-text-light transition-colors cursor-pointer"
        >
          Send more feedback
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative max-w-200">
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <p className={LABEL}>Let’s hear from you</p>
      <h2
        id="feedback-audience-label"
        className="font-display text-xl sm:text-2xl leading-tight text-ean-text-light"
      >
        Are you a client or an operator?
      </h2>

      {/*
       * Two buttons rather than a dropdown: the choice reshapes the whole form,
       * so both options are on screen before anything else. Sized and set like
       * GoldButton so they read as the site's own controls; the chosen one takes
       * GoldButton's blue fill, the other stays outlined and takes the same fill
       * on hover, so hovering previews the choice.
       */}
      <div
        role="group"
        aria-labelledby="feedback-audience-label"
        aria-describedby="feedback-audience-hint"
        className="mt-5 flex flex-wrap gap-3"
      >
        {FEEDBACK_AUDIENCES.map((option) => {
          const isOn = audience === option;
          const Icon = AUDIENCE_ICONS[option];
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isOn}
              onClick={() => handleAudienceChange(option)}
              className={`group inline-flex items-center gap-2.5 border px-6 py-3.5 font-ui font-semibold text-[12.5px] uppercase tracking-[0.08em] cursor-pointer transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ean-gold focus-visible:ring-offset-2 ${
                isOn
                  ? 'bg-ean-gold border-ean-gold text-ean-text-dark shadow-[0_10px_24px_-14px_rgba(43,0,152,0.6)]'
                  : 'bg-ean-black border-ean-border-dark text-ean-text-light hover:bg-ean-gold hover:border-ean-gold hover:text-ean-text-dark'
              }`}
            >
              <Icon
                aria-hidden
                strokeWidth={1.5}
                className={`w-4.5 h-4.5 transition-colors duration-300 ${
                  isOn ? 'text-ean-text-dark' : 'text-ean-gold group-hover:text-ean-text-dark'
                }`}
              />
              {FEEDBACK_AUDIENCE_LABELS[option]}
              {isOn && <Check aria-hidden className="w-4 h-4" />}
            </button>
          );
        })}
      </div>

      <p id="feedback-audience-hint" className="mt-3 font-ui text-xs text-ean-slate leading-relaxed max-w-[70ch]">
        {FEEDBACK_AUDIENCES.map((option, index) => (
          <React.Fragment key={option}>
            {index > 0 && <br />}
            <span className="font-semibold">{FEEDBACK_AUDIENCE_LABELS[option]}</span> —{' '}
            {AUDIENCE_HINTS[option]}
          </React.Fragment>
        ))}
      </p>

      {audience && (
        <div className="mt-8 pt-8 border-t border-ean-border-light grid grid-cols-1 min-[720px]:grid-cols-2 gap-4.5">
          {errors.form && (
            <p
              role="alert"
              className="min-[720px]:col-span-2 font-ui text-sm text-ean-error border border-ean-error/40 bg-ean-error/5 px-4 py-3"
            >
              {errors.form}
            </p>
          )}

          <ChipGroup
            id="feedback-type"
            label="Type of feedback"
            options={FEEDBACK_TYPES}
            labels={FEEDBACK_TYPE_LABELS}
            value={type}
            error={errors.type}
            onSelect={(option) => {
              setType(option);
              clearError('type');
            }}
          />

          {isOperator && (
            <>
              <Field
                id="feedback-company"
                label="Operator / company"
                value={form.company}
                error={errors.company}
                onChange={handleChange}
                name="company"
                autoComplete="organization"
                maxLength={160}
              />

              <Field
                id="feedback-registration"
                label="Aircraft registration (optional)"
                placeholder="5N-ABC"
                value={form.registration}
                error={errors.registration}
                onChange={handleChange}
                name="registration"
                autoComplete="off"
                maxLength={20}
                className="uppercase placeholder:normal-case"
              />
            </>
          )}

          <Field
            id="feedback-name"
            label="Your name"
            value={form.name}
            error={errors.name}
            onChange={handleChange}
            name="name"
            autoComplete="name"
            maxLength={120}
          />

          <Field
            id="feedback-email"
            label={isOperator ? 'Email' : 'Email (optional)'}
            type="email"
            value={form.email}
            error={errors.email}
            onChange={handleChange}
            name="email"
            autoComplete="email"
          />

          <Field
            id="feedback-phone"
            label="Phone"
            type="tel"
            value={form.phone}
            error={errors.phone}
            onChange={handleChange}
            name="phone"
            autoComplete="tel"
            maxLength={40}
          />

          <Field
            id="feedback-date"
            label={isOperator ? 'Date of operation (optional)' : 'Date of visit (optional)'}
            type="date"
            value={form.date}
            error={errors.date}
            onChange={handleChange}
            name="date"
          />

          <div className="min-[720px]:col-span-2">
            <label htmlFor="feedback-message" className={LABEL}>
              Your feedback
            </label>
            <textarea
              id="feedback-message"
              name="message"
              value={form.message}
              onChange={handleChange}
              maxLength={FEEDBACK_MESSAGE_MAX}
              placeholder={MESSAGE_PLACEHOLDERS[audience]}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? 'feedback-message-error' : undefined}
              className={`${FIELD} ${errors.message ? 'border-ean-error' : 'border-ean-border-dark'} min-h-40 resize-y`}
            />
            {errors.message && (
              <span id="feedback-message-error" className="block font-ui text-xs text-ean-error mt-1.5">
                {errors.message}
              </span>
            )}
          </div>

          <p className="min-[720px]:col-span-2 font-ui text-xs font-light leading-relaxed text-ean-slate border-l-2 border-ean-gold pl-3.5 max-w-[70ch]">
            Feedback is read by EAN staff only and is never published. Your contact details are used
            only to reply to you.
          </p>

          <div className="min-[720px]:col-span-2">
            <GoldButton type="submit" disabled={isSubmitting} className="disabled:opacity-60">
              {isSubmitting ? 'Sending…' : 'Send feedback'}
            </GoldButton>
          </div>
        </div>
      )}
    </form>
  );
}

interface ChipGroupProps<T extends string> {
  id: string;
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T | null;
  error?: string;
  onSelect: (option: T) => void;
}

/** A labelled row of single-choice pills — the charter form's `.chk` row. */
function ChipGroup<T extends string>({
  id,
  label,
  options,
  labels,
  value,
  error,
  onSelect,
}: ChipGroupProps<T>) {
  return (
    <div className="min-[720px]:col-span-2">
      <span id={`${id}-label`} className={LABEL}>
        {label}
      </span>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {options.map((option) => {
          const isOn = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isOn}
              onClick={() => onSelect(option)}
              className={`${CHIP} ${isOn ? CHIP_ON : CHIP_OFF}`}
            >
              {labels[option]}
            </button>
          );
        })}
      </div>
      {error && (
        <span id={`${id}-error`} className="block font-ui text-xs text-ean-error mt-1.5">
          {error}
        </span>
      )}
    </div>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

/**
 * One labelled input, with the error wiring CharterRequestForm's Field uses.
 * `className` styles the input, not the wrapper, so a field can transform its
 * own text (the registration is shown upper-case).
 */
function Field({ id, label, error, className = '', ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${FIELD} ${error ? 'border-ean-error' : 'border-ean-border-dark'} ${className}`}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="block font-ui text-xs text-ean-error mt-1.5">
          {error}
        </span>
      )}
    </div>
  );
}
