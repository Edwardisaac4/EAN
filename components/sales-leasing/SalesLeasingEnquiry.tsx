'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Eyebrow from '@/components/shared/Eyebrow';
import GoldButton from '@/components/shared/GoldButton';
import ContactStep, { contactInputId } from '@/components/sales-leasing/ContactStep';
import { CARD_RESTING, CARD_SELECTED, FIELD, LABEL, OptionCard } from '@/components/sales-leasing/OptionCard';
import { LAGOS_HQ } from '@/lib/constants';
import { getTrackingContext } from '@/lib/lead-tracking';
import {
  BRANCH_LABELS,
  BUDGET_QUESTIONS,
  CONTACT_FIELDS,
  EMPTY_CONTACT_DETAILS,
  FUNDING_QUESTION,
  INTENT_QUESTION,
  LEASING_PROFILE_QUESTION,
  MONTH_ASAP,
  ROLE_QUESTION,
  SALES_LEASING_FORM_ID,
  SALES_TYPE_QUESTION,
  TIMELINE_QUESTION,
  answeredPath,
  buildEnquiryPath,
  formatMonth,
  isAnswerValid,
  resolveBranch,
  validateContactDetails,
  type ChoiceQuestion,
  type ContactDetails,
  type ContactErrors,
  type ContactFieldId,
  type ContactMethod,
  type EnquiryAnswerValue,
  type EnquiryAnswers,
  type EnquiryOption,
  type EnquiryQuestion,
  type MonthQuestion,
  type SalesLeasingSubmission,
  type TextQuestion,
} from '@/lib/sales-leasing-enquiry';

type AnswerState = Record<string, EnquiryAnswerValue>;

/** The service page the thank-you screen links back to. */
interface ServiceLink {
  slug: string;
  name: string;
}

interface SalesLeasingEnquiryProps {
  /** From the SERVICES_DATA record the page already reads, so the link and its words stay in step. */
  service: ServiceLink;
}

interface ChoiceAnswerProps {
  question: ChoiceQuestion;
  value: EnquiryAnswerValue | undefined;
  onChange: (next: EnquiryAnswerValue) => void;
}

interface TextAnswerProps {
  question: TextQuestion;
  value: string;
  onChange: (next: string) => void;
}

interface MonthAnswerProps {
  question: MonthQuestion;
  value: string;
  onChange: (next: string) => void;
}

interface ThankYouProps {
  fullName: string;
  contactMethod: ContactMethod | '';
  leadCode: string;
  service: ServiceLink;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}

/** How far ahead the month picker reaches. Two years covers any lease being planned today. */
const MONTHS_AHEAD = 24;

/** Longest label that still fits half a phone's width without wrapping awkwardly. */
const COMPACT_LABEL_MAX = 16;

/**
 * Below this distance from the top of the window the progress bar is under the
 * fixed navbar. The container's scroll margin (96–104px) is where it lands instead.
 */
const NAVBAR_CLEARANCE = 80;

/** The questions every path ends on, whichever branch it took. */
const FINAL_QUESTIONS: readonly EnquiryQuestion[] = [
  ROLE_QUESTION,
  FUNDING_QUESTION,
  TIMELINE_QUESTION,
  ...Object.values(BUDGET_QUESTIONS).filter((q): q is ChoiceQuestion => q !== undefined),
];

/** Contact fields in screen order, then the method — the order errors are focused in. */
const CONTACT_ERROR_ORDER: readonly (ContactFieldId | 'contactMethod')[] = [
  ...CONTACT_FIELDS.map((f) => f.id),
  'contactMethod',
];

/** Ends the thank-you sentence: "…will contact you by WhatsApp." */
const METHOD_PHRASES: Record<ContactMethod, string> = {
  phone: 'phone',
  whatsapp: 'WhatsApp',
  email: 'email',
};

const SEND_FAILED_MESSAGE = `We could not send your enquiry. Please try again, or call us on ${LAGOS_HQ.phone}.`;
const NETWORK_FAILED_MESSAGE = `We could not reach our server, so your enquiry was not sent. Please check your connection and try again, or call us on ${LAGOS_HQ.phone}.`;

/** The small line above each question, so the visitor always knows which route they are on. */
function stageLabel(question: EnquiryQuestion, answers: EnquiryAnswers): string {
  if (question === INTENT_QUESTION) return 'Getting started';
  if (question === SALES_TYPE_QUESTION) return 'Aircraft sales';
  if (question === LEASING_PROFILE_QUESTION) return 'Aircraft leasing';
  if (FINAL_QUESTIONS.includes(question)) return 'Almost done';
  const branch = resolveBranch(answers);
  return branch ? BRANCH_LABELS[branch] : '';
}

/** The continue label: "Skip" says plainly that an optional question can be passed. */
function continueLabel(question: EnquiryQuestion, value: EnquiryAnswerValue | undefined): string {
  if (question.isOptional && !isAnswerValid(question, value)) return 'Skip';
  return 'Continue';
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ean-slate transition-colors duration-200 hover:text-ean-gold"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      Back
    </button>
  );
}

// -----------------------------------------------------------------------------
// Answer inputs
// -----------------------------------------------------------------------------

function ChoiceAnswer({ question, value, onChange }: ChoiceAnswerProps) {
  const name = useId();
  const selected = typeof value === 'string' ? [value] : (value ?? []);

  const handleToggle = (option: EnquiryOption) => {
    if (question.kind === 'single') {
      onChange(option.id);
      return;
    }
    if (selected.includes(option.id)) {
      onChange(selected.filter((id) => id !== option.id));
      return;
    }
    // "None" clears the rest; picking anything else clears "None".
    const exclusiveIds = question.options.filter((o) => o.isExclusive).map((o) => o.id);
    onChange(
      option.isExclusive
        ? [option.id]
        : [...selected.filter((id) => !exclusiveIds.includes(id)), option.id],
    );
  };

  // Short answers ("1–4", "Yes") sit two to a row even on a phone, which keeps
  // Continue on screen; anything with a second line needs the full width there.
  const isCompact = question.options.every(
    (o) => !o.detail && o.label.length <= COMPACT_LABEL_MAX,
  );

  return (
    <fieldset
      aria-labelledby={`enquiry-q-${question.id}`}
      aria-describedby={question.helper || question.isOptional ? `enquiry-help-${question.id}` : undefined}
      className={`grid gap-3 ${isCompact ? 'grid-cols-2' : 'grid-cols-1 min-[460px]:grid-cols-2'}`}
    >
      {question.options.map((option) => (
        <OptionCard
          key={option.id}
          type={question.kind === 'single' ? 'radio' : 'checkbox'}
          name={name}
          option={option}
          isSelected={selected.includes(option.id)}
          onSelect={() => handleToggle(option)}
        />
      ))}
    </fieldset>
  );
}

function TextAnswer({ question, value, onChange }: TextAnswerProps) {
  return (
    <input
      type="text"
      aria-labelledby={`enquiry-q-${question.id}`}
      aria-describedby={question.helper || question.isOptional ? `enquiry-help-${question.id}` : undefined}
      placeholder={question.placeholder}
      maxLength={question.maxLength}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${FIELD} border-ean-border-dark`}
    />
  );
}

/**
 * "As soon as possible" as a card, or a month from a list. A list rather than
 * `<input type="month">`, which desktop Safari and Firefox render as a bare
 * text box. Built from the visitor's own clock: this question is never the
 * first screen, so it only ever renders in the browser, never into the
 * prerendered HTML where it would freeze the months at build time.
 */
function MonthAnswer({ question, value, onChange }: MonthAnswerProps) {
  const name = useId();
  const selectId = useId();
  const [months] = useState(() => {
    const now = new Date();
    return Array.from({ length: MONTHS_AHEAD }, (_, i) => {
      const d = new Date(Date.UTC(now.getFullYear(), now.getMonth() + i, 1));
      const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      return { value: iso, label: formatMonth(iso) };
    });
  });
  const isMonth = value !== '' && value !== MONTH_ASAP;

  return (
    <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2">
      <OptionCard
        type="radio"
        name={name}
        option={{ id: MONTH_ASAP, label: question.asapLabel }}
        isSelected={value === MONTH_ASAP}
        onSelect={() => onChange(MONTH_ASAP)}
      />
      <div
        className={`flex flex-col justify-center border px-4.5 py-4 transition-colors duration-200 ${
          isMonth ? CARD_SELECTED : CARD_RESTING
        }`}
      >
        <label htmlFor={selectId} className={LABEL}>
          Or pick a month
        </label>
        <select
          id={selectId}
          value={isMonth ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${FIELD} border-ean-border-dark cursor-pointer`}
        >
          <option value="" disabled>
            Select a month
          </option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// After the lead is saved
// -----------------------------------------------------------------------------

/**
 * No response time is promised here. Timing claims are held until Operations
 * confirms them (C50, as on /charter), and the guide's 24-hour target for a Hot
 * lead is the team's own goal, not something to publish to every visitor.
 */
function ThankYou({ fullName, contactMethod, leadCode, service, headingRef, onRestart }: ThankYouProps) {
  const firstName = fullName.trim().split(/\s+/)[0];

  return (
    <div className="ean-enter-up mt-8 sm:mt-9">
      <Eyebrow as="p">Enquiry received</Eyebrow>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 font-display text-[28px] sm:text-[36px] leading-[1.15] text-ean-text-light outline-none"
      >
        Thank you{firstName ? `, ${firstName}` : ''}.
      </h2>
      <p className="mt-4 max-w-[60ch] font-ui text-[15px] font-light leading-relaxed text-ean-text-light">
        Our sales and leasing team has your answers
        {contactMethod ? ` and will contact you by ${METHOD_PHRASES[contactMethod]}` : ' and will be in touch'}.
      </p>
      {leadCode && (
        <p className="mt-3 font-ui text-sm font-light text-ean-slate">
          Your reference is <span className="font-medium text-ean-text-light">{leadCode}</span>.
        </p>
      )}
      <p className="mt-3 max-w-[60ch] font-ui text-sm font-light leading-relaxed text-ean-slate">
        If it can&rsquo;t wait, call us on{' '}
        <a
          href={`tel:${LAGOS_HQ.phone.replace(/[^\d+]/g, '')}`}
          className="text-ean-gold underline underline-offset-2 hover:text-ean-gold-light"
        >
          {LAGOS_HQ.phone}
        </a>
        .
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ean-border-light pt-6">
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ean-slate transition-colors duration-200 hover:text-ean-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {service.name}
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.16em] text-ean-gold transition-colors duration-200 hover:text-ean-gold-light"
        >
          Start a new enquiry
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// The enquiry
// -----------------------------------------------------------------------------

/**
 * The Aircraft Sales & Leasing enquiry — one question per screen, from the
 * guide in `lib/sales-leasing-enquiry.ts`, ending on the contact screen.
 *
 * Every screen is a small form, so Enter moves on from a text answer the same
 * way Continue does, and a keyboard user gets native radio behaviour (arrow
 * keys within a question) without any of it being rebuilt here.
 *
 * Answers are kept when the visitor goes back and changes a fork. The path is
 * rebuilt from the answers on every render, and only answers that are valid
 * for a question on the current path are ever shown or counted — so an answer
 * left behind by a path no longer taken simply stops mattering, while the
 * shared final questions (role, funding, timing) survive the switch.
 */
export default function SalesLeasingEnquiry({ service }: SalesLeasingEnquiryProps) {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [hasTriedEmpty, setHasTriedEmpty] = useState(false);
  const [contact, setContact] = useState<ContactDetails>(EMPTY_CONTACT_DETAILS);
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [leadCode, setLeadCode] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Focus and scroll follow the visitor only once they have started — never on
  // page load, where stealing focus would jump a screen reader past the header.
  const hasStartedRef = useRef(false);

  const path = useMemo(() => buildEnquiryPath(answers), [answers]);
  // +1 for the contact screen that ends every path.
  const totalSteps = path.length + 1;
  const question: EnquiryQuestion | undefined = path[stepIndex];
  const isContactStep = !question && !hasSubmitted;
  const value = question ? answers[question.id] : undefined;
  const canContinue = question ? question.isOptional || isAnswerValid(question, value) : false;
  const percent = hasSubmitted ? 100 : Math.round((stepIndex / totalSteps) * 100);
  const screenKey = hasSubmitted ? 'submitted' : String(stepIndex);

  useEffect(() => {
    if (!hasStartedRef.current) return;

    // Stop any scroll still running from the last tap. A card that sits half
    // below the fold makes the browser start a smooth scroll to it (the root
    // layout sets `scroll-smooth`), and once that card is swapped out for the
    // next question the scroll carries on — measured at over 300px, which
    // parked the progress bar under the navbar.
    window.scrollTo({ top: window.scrollY, behavior: 'instant' });
    headingRef.current?.focus({ preventScroll: true });

    // On a phone, Continue sits at the bottom of a tall screen; without this the
    // next question would open already scrolled past its own title. The fixed
    // navbar is about 70px once collapsed, so anything above that line is hidden.
    const container = containerRef.current;
    if (container && container.getBoundingClientRect().top < NAVBAR_CLEARANCE) {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      container.scrollIntoView({ block: 'start', behavior: isReduced ? 'auto' : 'smooth' });
    }
  }, [screenKey]);

  const setAnswer = (questionId: string, next: EnquiryAnswerValue) => {
    setHasTriedEmpty(false);
    setAnswers((current) => ({ ...current, [questionId]: next }));
  };

  const goTo = (index: number) => {
    hasStartedRef.current = true;
    setHasTriedEmpty(false);
    setStepIndex(index);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) {
      setHasTriedEmpty(true);
      return;
    }
    goTo(stepIndex + 1);
  };

  /** Clears a field's message as soon as the visitor starts fixing it. */
  const clearContactError = (id: ContactFieldId | 'contactMethod') => {
    if (!contactErrors[id]) return;
    setContactErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const handleContactSubmit = async () => {
    if (isSubmitting) return;

    const errors = validateContactDetails(contact);
    setContactErrors(errors);
    setSubmitError('');

    const firstInvalid = CONTACT_ERROR_ORDER.find((id) => errors[id]);
    if (firstInvalid) {
      // The method is a group of radios; focus its first option rather than the fieldset.
      const target =
        firstInvalid === 'contactMethod'
          ? document.querySelector<HTMLInputElement>(`#${contactInputId('contactMethod')} input`)
          : document.getElementById(contactInputId(firstInvalid));
      target?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      // Only answers to questions on this visitor's path. Answers left behind
      // by a fork they went back and changed stay on this screen, not in the lead.
      const pathAnswers = Object.fromEntries(
        answeredPath(answers).map(({ question, value: answer }) => [question.id, answer]),
      );

      const submission: SalesLeasingSubmission = {
        answers: pathAnswers,
        contact,
        tracking: getTrackingContext(SALES_LEASING_FORM_ID),
        website: honeypot,
      };

      const response = await fetch('/api/sales-leasing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      const data = await response.json().catch(() => null);

      // Only the server saying the lead was saved counts as sent. Answers and
      // details stay as they are, so a retry is one tap.
      if (!response.ok || !data?.success) {
        setSubmitError(typeof data?.error === 'string' ? data.error : SEND_FAILED_MESSAGE);
        setIsSubmitting(false);
        return;
      }

      sendGAEvent('event', 'generate_lead', {
        category: 'Sales & Leasing',
        service: resolveBranch(answers) ?? 'sales-leasing',
        value: 1,
      });

      setLeadCode(typeof data.leadCode === 'string' ? data.leadCode : '');
      setIsSubmitting(false);
      hasStartedRef.current = true;
      setHasSubmitted(true);
    } catch {
      setSubmitError(NETWORK_FAILED_MESSAGE);
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setContact(EMPTY_CONTACT_DETAILS);
    setContactErrors({});
    setSubmitError('');
    setLeadCode('');
    setHasSubmitted(false);
    goTo(0);
  };

  const progressLabel = question
    ? `Question ${stepIndex + 1} of ${totalSteps}`
    : hasSubmitted
      ? 'Complete'
      : `Last step · ${totalSteps} of ${totalSteps}`;

  return (
    // The scroll margin is the page section's top padding plus the collapsed
    // navbar, so the section's edge — not a sliver of the header photo above
    // it — meets the bar.
    <div ref={containerRef} className="scroll-mt-24 sm:scroll-mt-26">
      {/* Progress */}
      <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-ean-gold">
        <span>{progressLabel}</span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="Enquiry progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="relative mt-3 h-0.5 bg-ean-surface"
      >
        <div
          className="absolute inset-y-0 left-0 bg-ean-gold transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {question ? (
        <form
          key={`${stepIndex}-${question.id}`}
          onSubmit={handleContinue}
          noValidate
          className="ean-enter-up mt-8 sm:mt-9"
        >
          <Eyebrow as="p">{stageLabel(question, answers)}</Eyebrow>
          <h2
            ref={headingRef}
            id={`enquiry-q-${question.id}`}
            tabIndex={-1}
            className="mt-3 font-display text-[28px] sm:text-[36px] leading-[1.15] text-ean-text-light outline-none"
          >
            {question.title}
          </h2>
          {(question.helper || question.isOptional) && (
            <p
              id={`enquiry-help-${question.id}`}
              className="mt-2.5 font-ui text-sm font-light text-ean-slate"
            >
              {[question.helper, question.isOptional ? 'Optional.' : null].filter(Boolean).join(' ')}
            </p>
          )}

          <div className="mt-6">
            {question.kind === 'text' ? (
              <TextAnswer
                question={question}
                value={typeof value === 'string' ? value : ''}
                onChange={(next) => setAnswer(question.id, next)}
              />
            ) : question.kind === 'month' ? (
              <MonthAnswer
                question={question}
                value={typeof value === 'string' ? value : ''}
                onChange={(next) => setAnswer(question.id, next)}
              />
            ) : (
              <ChoiceAnswer
                question={question}
                value={value}
                onChange={(next) => setAnswer(question.id, next)}
              />
            )}
          </div>

          {hasTriedEmpty && (
            <p role="alert" className="mt-4 font-ui text-sm text-ean-error">
              Pick an answer to continue.
            </p>
          )}

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-ean-border-light pt-6">
            {stepIndex > 0 ? (
              <BackButton onClick={() => goTo(stepIndex - 1)} />
            ) : (
              <span />
            )}
            <GoldButton
              type="submit"
              aria-disabled={!canContinue}
              className={canContinue ? '' : 'opacity-50'}
            >
              <span>{continueLabel(question, value)}</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </GoldButton>
          </div>
        </form>
      ) : isContactStep ? (
        <ContactStep
          details={contact}
          errors={contactErrors}
          honeypot={honeypot}
          isSubmitting={isSubmitting}
          submitError={submitError}
          headingRef={headingRef}
          onFieldChange={(id, next) => {
            setContact((current) => ({ ...current, [id]: next }));
            clearContactError(id);
          }}
          onMethodChange={(method) => {
            setContact((current) => ({ ...current, contactMethod: method }));
            clearContactError('contactMethod');
          }}
          onProofChange={(hasAccepted) =>
            setContact((current) => ({ ...current, hasAcceptedProofOfFunds: hasAccepted }))
          }
          onHoneypotChange={setHoneypot}
          onSubmit={handleContactSubmit}
          onBack={() => goTo(path.length - 1)}
        />
      ) : (
        <ThankYou
          fullName={contact.fullName}
          contactMethod={contact.contactMethod}
          leadCode={leadCode}
          service={service}
          headingRef={headingRef}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
