'use client';

import React, { useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import GoldButton from '@/components/shared/GoldButton';
import HoneypotField from '@/components/shared/HoneypotField';
import { getTrackingContext } from '@/lib/lead-tracking';

/**
 * The charter request form — the prototype's `#charter` `.form`.
 *
 * Deliberately not the contact form with different labels. A charter inquiry is
 * a route, a date and a passenger count before it is a message, and the desk
 * cannot quote without those four. The contact form asks for none of them, so a
 * charter routed through it arrives as free text somebody has to chase.
 *
 * It posts to the same `/api/leads` pipeline as every other lead, tagged
 * `service: 'charter'`, with the flight details composed into the message body.
 * That keeps one inbox, one duplicate check and one rate limit rather than a
 * second intake path nobody watches.
 */

/** Mutually exclusive — nobody wants both a light jet and a heavy one. */
const AIRCRAFT_OPTIONS = [
  'No preference',
  'Light jet',
  'Midsize jet',
  'Heavy jet',
  'Helicopter',
] as const;

const TRIP_OPTIONS = [
  { id: 'one-way', label: 'One way' },
  { id: 'return', label: 'Return' },
] as const;

type TripId = (typeof TRIP_OPTIONS)[number]['id'];

interface CharterFormState {
  departure: string;
  destination: string;
  date: string;
  passengers: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const EMPTY_FORM: CharterFormState = {
  departure: '',
  destination: '',
  date: '',
  passengers: '',
  name: '',
  email: '',
  phone: '',
  notes: '',
};

/** `.flab` — mono 10.5px at .14em in brass. */
const LABEL = 'block font-mono text-[10.5px] tracking-[0.14em] uppercase text-ean-gold mb-2';

/** `input.tx` — ink2 ground, hairline border, 4px radius. Inputs are one of the three places Job G keeps a radius. */
const FIELD =
  'w-full bg-ean-navy border text-ean-text-light px-3.25 py-2.75 font-ui text-sm rounded-sm placeholder:text-ean-slate focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors duration-200';

/** `.chk span` — 100px pill, hairline until chosen, logo blue border highlight once it is. */
const CHIP =
  'font-ui text-[12.5px] border px-3.5 py-1.75 rounded-full cursor-pointer transition-all duration-200';

export default function CharterRequestForm() {
  const [form, setForm] = useState<CharterFormState>(EMPTY_FORM);
  const [aircraft, setAircraft] = useState<string>(AIRCRAFT_OPTIONS[0]);
  const [trip, setTrip] = useState<TripId>('one-way');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const found: Record<string, string> = {};

    if (!form.departure.trim()) found.departure = 'Departure airport is required.';
    if (!form.destination.trim()) found.destination = 'Destination airport is required.';

    if (!form.date) {
      found.date = 'A departure date is required.';
    } else {
      // Compared at day granularity against the browser's own clock. This runs
      // on submit, never during render, so it cannot cause a hydration mismatch
      // the way a `min` attribute computed at render time would.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(`${form.date}T00:00:00`) < today) {
        found.date = 'The departure date is in the past.';
      }
    }

    const passengers = Number(form.passengers);
    if (!form.passengers.trim()) {
      found.passengers = 'Passenger count is required.';
    } else if (!Number.isInteger(passengers) || passengers < 1) {
      found.passengers = 'Enter the number of passengers travelling.';
    }

    if (!form.name.trim()) found.name = 'Your name is required.';

    if (!form.email.trim()) {
      found.email = 'An email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      found.email = 'That email address does not look right.';
    }

    if (!form.phone.trim()) found.phone = 'A phone number is required — the desk calls back.';

    setErrors(found);
    return Object.keys(found).length === 0;
  };

  /**
   * The flight details are folded into the message rather than sent as their own
   * fields: `leads` has no route, date or pax columns, and adding four would mean
   * a migration plus every admin view that renders a lead. Written as labelled
   * lines so the desk reads them at a glance in the alert email.
   */
  const composeMessage = () => {
    const lines = [
      `Route: ${form.departure.trim()} to ${form.destination.trim()}`,
      `Date: ${form.date}`,
      `Trip: ${TRIP_OPTIONS.find((t) => t.id === trip)?.label}`,
      `Passengers: ${form.passengers.trim()}`,
      `Aircraft preference: ${aircraft}`,
    ];

    if (form.notes.trim()) {
      lines.push('', `Notes: ${form.notes.trim()}`);
    }

    return lines.join('\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validate() replaces the whole error map, which also clears any form-level
    // failure left over from the previous attempt.
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          service: 'charter',
          message: composeMessage(),
          tracking: getTrackingContext('charter-request-form'),
          website: honeypot,
        }),
      });

      const data = await response.json().catch(() => null);

      // Only the database accepting the row counts as sent. Never confirm a
      // charter request off the back of a failed call.
      if (!response.ok || !data?.success) {
        setIsSubmitting(false);
        setErrors({
          form:
            data?.error ??
            'We could not send your request. Please try again, or call the desk on +234 (0) 805 033 3410.',
        });
        return;
      }

      // `POST /api/leads` collapses a repeat submission within 10 minutes, and
      // findRecentDuplicateLead keys on email + service only — not on the
      // message. Two genuinely different trips requested minutes apart (an
      // outbound and a separate charter for a colleague, say) come back
      // `duplicate: true` with nothing written for the second. Confirming that
      // as sent would tell someone their trip is with the desk when it is not.
      // The DSAR form on /privacy-policy handles the same hazard the same way.
      if (data.duplicate) {
        setIsSubmitting(false);
        setErrors({
          form:
            'A charter request from this email address was logged moments ago, so this one was not recorded separately. ' +
            'If this is a different trip, call the desk on +234 (0) 805 033 3410 so both are on record.',
        });
        return;
      }

      sendGAEvent('event', 'generate_lead', {
        category: 'Charter',
        service: 'charter',
        value: 1,
      });

      setIsSubmitting(false);
      setIsSent(true);
      setForm(EMPTY_FORM);
      setAircraft(AIRCRAFT_OPTIONS[0]);
      setTrip('one-way');
    } catch (err) {
      console.error('Error submitting charter request:', err);
      setIsSubmitting(false);
      setErrors({
        form: 'Network error sending your request. Please try again, or call the desk on +234 (0) 805 033 3410.',
      });
    }
  };

  if (isSent) {
    return (
      <div className="border border-ean-gold bg-ean-navy p-8 sm:p-10 max-w-[70ch]">
        <p className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-ean-gold">
          Request received
        </p>
        <h3 className="font-display text-2xl sm:text-3xl mt-3">Our charter desk has it.</h3>
        <p className="font-ui text-sm text-ean-muted-light font-light mt-4 leading-relaxed">
          You will hear back with aircraft options and an all-in price. If the trip is moving
          sooner than that, call the desk directly on{' '}
          <a href="tel:+2348050333410" className="text-ean-gold-light border-b border-ean-gold/40">
            +234 (0) 805 033 3410
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setIsSent(false)}
          className="mt-6 font-mono text-[10.5px] tracking-[0.14em] uppercase text-ean-slate hover:text-ean-text-light transition-colors cursor-pointer"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative">
      <HoneypotField value={honeypot} onChange={setHoneypot} />

      <div className="grid grid-cols-1 min-[720px]:grid-cols-2 gap-4.5">
        {errors.form && (
          <p
            role="alert"
            className="min-[720px]:col-span-2 font-ui text-sm text-red-400 border border-red-400/40 bg-red-400/5 px-4 py-3"
          >
            {errors.form}
          </p>
        )}

        <Field
          id="charter-departure"
          label="Departure"
          placeholder="Lagos (LOS)"
          value={form.departure}
          error={errors.departure}
          onChange={handleChange}
          name="departure"
          autoComplete="off"
        />

        <Field
          id="charter-destination"
          label="Destination"
          placeholder="Abuja (ABV)"
          value={form.destination}
          error={errors.destination}
          onChange={handleChange}
          name="destination"
          autoComplete="off"
        />

        <Field
          id="charter-date"
          label="Date"
          type="date"
          // A native picker over free text: "04/09" is two different days
          // depending on where the reader is from, and this desk quotes for both
          // Nigerian and international operators. `color-scheme` keeps the
          // browser's own calendar dark instead of dropping a white panel on ink.
          className="scheme-dark"
          value={form.date}
          error={errors.date}
          onChange={handleChange}
          name="date"
        />

        <Field
          id="charter-passengers"
          label="Passengers"
          type="number"
          min={1}
          inputMode="numeric"
          placeholder="4"
          value={form.passengers}
          error={errors.passengers}
          onChange={handleChange}
          name="passengers"
        />

        <div className="min-[720px]:col-span-2">
          <span id="charter-aircraft-label" className={LABEL}>
            Aircraft preference
          </span>
          <div className="flex flex-wrap gap-2" aria-labelledby="charter-aircraft-label">
            {AIRCRAFT_OPTIONS.map((option) => {
              const isOn = aircraft === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => setAircraft(option)}
                  className={`${CHIP} ${
                    isOn
                      ? 'border-ean-blue text-ean-blue-light bg-ean-blue-muted/30 shadow-[0_0_12px_rgba(145,116,220,0.15)]'
                      : 'border-ean-border-dark text-ean-slate hover:border-ean-blue hover:text-ean-blue-light'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/*
         * Split out of the aircraft row, where the prototype leaves it. "Return
         * flight" sitting beside "Light jet" under one AIRCRAFT PREFERENCE label
         * reads as a sixth aircraft type, and it is the one chip in that row that
         * is not mutually exclusive with the others.
         */}
        <div className="min-[720px]:col-span-2">
          <span id="charter-trip-label" className={LABEL}>
            Trip
          </span>
          <div className="flex flex-wrap gap-2" aria-labelledby="charter-trip-label">
            {TRIP_OPTIONS.map((option) => {
              const isOn = trip === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => setTrip(option.id)}
                  className={`${CHIP} ${
                    isOn
                      ? 'border-ean-blue text-ean-blue-light bg-ean-blue-muted/30 shadow-[0_0_12px_rgba(145,116,220,0.15)]'
                      : 'border-ean-border-dark text-ean-slate hover:border-ean-blue hover:text-ean-blue-light'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <Field
          id="charter-name"
          label="Name"
          value={form.name}
          error={errors.name}
          onChange={handleChange}
          name="name"
          autoComplete="name"
        />

        <Field
          id="charter-email"
          label="Email"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={handleChange}
          name="email"
          autoComplete="email"
        />

        <Field
          id="charter-phone"
          label="Phone"
          type="tel"
          value={form.phone}
          error={errors.phone}
          onChange={handleChange}
          name="phone"
          autoComplete="tel"
          className="min-[720px]:col-span-2"
        />

        <div className="min-[720px]:col-span-2">
          <label htmlFor="charter-notes" className={LABEL}>
            Notes
          </label>
          <textarea
            id="charter-notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Catering, ground transport, special requirements"
            className={`${FIELD} border-ean-border-dark min-h-27.5 resize-y`}
          />
        </div>

        {/*
         * The `.assure` line. Its 2px brass rule is the one place this form keeps
         * a weight above hairline — it is an accent marker, not a separator, and
         * it is the same device the pull-quotes use.
         */}
        <p className="min-[720px]:col-span-2 font-ui text-xs font-light leading-relaxed text-ean-slate border-l-2 border-ean-gold pl-3.5 max-w-[70ch]">
          Charter inquiries are handled confidentially by our charter desk. Routes, dates and
          passenger details are never published or shared.
        </p>

        <div className="min-[720px]:col-span-2">
          <GoldButton type="submit" disabled={isSubmitting} className="disabled:opacity-60">
            {isSubmitting ? 'Sending…' : 'Send charter request'}
          </GoldButton>
        </div>
      </div>
    </form>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

/**
 * One labelled input. Extracted because there are seven of them and the error
 * wiring — `aria-invalid`, `aria-describedby`, the red border — is four things
 * that have to agree on every one.
 */
function Field({ id, label, error, className = '', ...props }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${FIELD} ${error ? 'border-red-400' : 'border-ean-border-dark'}`}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="block font-ui text-xs text-red-400 mt-1.5">
          {error}
        </span>
      )}
    </div>
  );
}
