'use client';

import React, { useId } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Eyebrow from '@/components/shared/Eyebrow';
import GoldButton from '@/components/shared/GoldButton';
import HoneypotField from '@/components/shared/HoneypotField';
import { CARD_RESTING, CARD_SELECTED, FIELD, LABEL, OptionCard } from '@/components/sales-leasing/OptionCard';
import {
  CONTACT_FIELDS,
  CONTACT_METHODS,
  PROOF_OF_FUNDS_TEXT,
  type ContactDetails,
  type ContactErrors,
  type ContactFieldId,
  type ContactMethod,
} from '@/lib/sales-leasing-enquiry';

/** DOM id for a contact field — also how the parent focuses the first field with an error. */
export function contactInputId(id: ContactFieldId | 'contactMethod'): string {
  return `enquiry-contact-${id}`;
}

interface ContactStepProps {
  details: ContactDetails;
  errors: ContactErrors;
  honeypot: string;
  isSubmitting: boolean;
  /** Why the last send failed, in words the visitor can act on; empty when it has not. */
  submitError: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onFieldChange: (id: ContactFieldId, value: string) => void;
  onMethodChange: (method: ContactMethod) => void;
  onProofChange: (hasAccepted: boolean) => void;
  onHoneypotChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

/**
 * The last screen of every path, and the only one with typing — the guide's
 * rule is taps first, typing last, after the visitor has invested in the
 * questions.
 *
 * The proof-of-funds box is optional. Ticking it earns a point in the score;
 * making it required would hand every lead the same point and tell the sales
 * team nothing.
 */
export default function ContactStep({
  details,
  errors,
  honeypot,
  isSubmitting,
  submitError,
  headingRef,
  onFieldChange,
  onMethodChange,
  onProofChange,
  onHoneypotChange,
  onSubmit,
  onBack,
}: ContactStepProps) {
  const methodName = useId();
  const methodErrorId = `${contactInputId('contactMethod')}-error`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="ean-enter-up relative mt-8 sm:mt-9">
      <Eyebrow as="p">Your details</Eyebrow>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 font-display text-[28px] sm:text-[36px] leading-[1.15] text-ean-text-light outline-none"
      >
        How should our team reach you?
      </h2>
      <p className="mt-2.5 font-ui text-sm font-light text-ean-slate">
        Your answers go straight to our sales and leasing team, who will come back to you directly.
      </p>

      <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-5 min-[640px]:grid-cols-2">
        {CONTACT_FIELDS.map((field) => {
          const id = contactInputId(field.id);
          const error = errors[field.id];
          return (
            <div key={field.id}>
              <label htmlFor={id} className={LABEL}>
                {field.label}
                {!field.isRequired && (
                  <span className="normal-case tracking-normal text-ean-slate"> (optional)</span>
                )}
              </label>
              <input
                id={id}
                name={field.id}
                type={field.type}
                autoComplete={field.autoComplete}
                maxLength={field.maxLength}
                placeholder={field.placeholder || undefined}
                value={details[field.id]}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                aria-required={field.isRequired || undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`${FIELD} ${error ? 'border-ean-error' : 'border-ean-border-dark'}`}
              />
              {error && (
                <span id={`${id}-error`} className="mt-1.5 block font-ui text-xs text-ean-error">
                  {error}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <fieldset
        id={contactInputId('contactMethod')}
        aria-describedby={errors.contactMethod ? methodErrorId : undefined}
        className="mt-7"
      >
        <legend className={LABEL}>How would you like us to contact you?</legend>
        <div className="grid grid-cols-3 gap-3">
          {CONTACT_METHODS.map((method) => (
            <OptionCard
              key={method.id}
              type="radio"
              name={methodName}
              option={method}
              isSelected={details.contactMethod === method.id}
              onSelect={() => onMethodChange(method.id)}
            />
          ))}
        </div>
        {errors.contactMethod && (
          <span id={methodErrorId} className="mt-1.5 block font-ui text-xs text-ean-error">
            {errors.contactMethod}
          </span>
        )}
      </fieldset>

      <label
        className={`mt-7 flex cursor-pointer items-start gap-3.5 border px-4.5 py-4 transition-colors duration-200 has-focus-visible:ring-2 has-focus-visible:ring-ean-gold/40 ${
          details.hasAcceptedProofOfFunds ? CARD_SELECTED : CARD_RESTING
        }`}
      >
        <input
          type="checkbox"
          checked={details.hasAcceptedProofOfFunds}
          onChange={(e) => onProofChange(e.target.checked)}
          className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer accent-ean-gold"
        />
        <span className="font-ui text-[14px] leading-relaxed text-ean-text-light">
          {PROOF_OF_FUNDS_TEXT}
        </span>
      </label>

      <p className="mt-6 max-w-[70ch] border-l-2 border-ean-gold pl-3.5 font-ui text-xs font-light leading-relaxed text-ean-slate">
        Enquiries are handled confidentially by our sales and leasing team. Your details are never
        published or shared. See our{' '}
        <Link href="/privacy-policy" className="text-ean-gold underline underline-offset-2 hover:text-ean-gold-light">
          Privacy Policy
        </Link>
        .
      </p>

      <HoneypotField value={honeypot} onChange={onHoneypotChange} />

      {submitError && (
        <p
          role="alert"
          className="mt-8 border border-ean-error/40 bg-ean-error/5 px-4 py-3 font-ui text-sm text-ean-error"
        >
          {submitError}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-ean-border-light pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ean-slate transition-colors duration-200 hover:text-ean-gold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back
        </button>
        <GoldButton
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting || undefined}
          className="disabled:cursor-wait disabled:opacity-70"
        >
          <span>{isSubmitting ? 'Sending…' : 'Send enquiry'}</span>
          {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden />}
        </GoldButton>
      </div>
    </form>
  );
}
