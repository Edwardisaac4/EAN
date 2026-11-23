// =============================================================================
// Sales & Leasing enquiry score — Hot, Warm or Cold
// =============================================================================
// The guide's scoring table, applied to the answers from
// `lib/sales-leasing-enquiry.ts`. It tells the sales team who to call first; the
// visitor never sees it.
//
// Pure and client-safe. The route recomputes the score from the submitted
// answers rather than trusting a number sent by the browser, so this is the one
// place the rules live.
//
// An email address never moves the score. The guide is explicit that a Gmail
// or Yahoo address is neutral: many genuine West African principals use one.

import {
  EXISTING_AIRLINE_QUESTIONS,
  FUNDING_QUESTION,
  ROLE_QUESTION,
  STARTUP_AIRLINE_QUESTIONS,
  TIMELINE_QUESTION,
  type ChoiceQuestion,
  type EnquiryAnswers,
  type EnquiryBranch,
} from '@/lib/sales-leasing-enquiry';

type OptionId<Q extends ChoiceQuestion> = Q['options'][number]['id'];
type QuestionIn<Qs extends readonly unknown[], Id extends string> = Extract<Qs[number], { id: Id }>;

type CertificationQuestion = QuestionIn<typeof STARTUP_AIRLINE_QUESTIONS, 'certification'>;
type LeaseTypeQuestion = QuestionIn<typeof EXISTING_AIRLINE_QUESTIONS, 'lease-type'>;
type DepositQuestion = QuestionIn<typeof EXISTING_AIRLINE_QUESTIONS, 'deposit'>;

const CERTIFICATION_QUESTION = STARTUP_AIRLINE_QUESTIONS.find(
  (q): q is CertificationQuestion => q.id === 'certification',
);
const LEASE_TYPE_QUESTION = EXISTING_AIRLINE_QUESTIONS.find(
  (q): q is LeaseTypeQuestion => q.id === 'lease-type',
);
const DEPOSIT_QUESTION = EXISTING_AIRLINE_QUESTIONS.find(
  (q): q is DepositQuestion => q.id === 'deposit',
);

// -----------------------------------------------------------------------------
// The points — typed against the questions, so a renamed or added answer that
// is not given a value here fails the build instead of silently scoring 0.
// -----------------------------------------------------------------------------

const ROLE_POINTS: Record<OptionId<typeof ROLE_QUESTION>, number> = {
  owner: 3,
  manager: 2,
  advisor: 1,
  researching: 0,
};

const TIMELINE_POINTS: Record<OptionId<typeof TIMELINE_QUESTION>, number> = {
  'within-3': 3,
  '3-6': 2,
  '6-12': 1,
  exploring: 0,
};

const FUNDING_POINTS: Record<OptionId<typeof FUNDING_QUESTION>, number> = {
  cash: 3,
  arranged: 3,
  'needs-financing': 1,
  undecided: 0,
};

/** "The single best seriousness signal for a startup." */
const CERTIFICATION_POINTS: Record<OptionId<CertificationQuestion>, number> = {
  'business-plan': 0,
  'atl-applied': 0,
  'aoc-underway': 2,
  'aoc-issued': 2,
};

/** Dry-lease lessors usually require both; a "yes" is a strong signal. */
const DRY_LEASE_DEPOSIT_POINTS = 2;
const COMPANY_AND_WEBSITE_POINTS = 1;
const PROOF_OF_FUNDS_POINTS = 1;

// The guide also gives +1 for "budget band consistent with aircraft chosen".
// It is left out until the sales team says what consistent means per type —
// guessing would quietly push leads across a threshold.

export const HOT_MIN_POINTS = 9;
export const WARM_MIN_POINTS = 5;

export type LeadTemperature = 'hot' | 'warm' | 'cold';

export const TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
};

/** What the guide says the team should do, shown in the lead alert. */
export const TEMPERATURE_ACTIONS: Record<LeadTemperature, string> = {
  hot: 'A senior team member calls or WhatsApps within 24 hours.',
  warm: 'Personal email or WhatsApp within 3 working days.',
  cold: 'Thank-you email. No call needed.',
};

// -----------------------------------------------------------------------------
// Scoring
// -----------------------------------------------------------------------------

export interface ScoreInput {
  branch: EnquiryBranch;
  answers: EnquiryAnswers;
  company?: string;
  companyWebsite?: string;
  hasAcceptedProofOfFunds: boolean;
}

export interface ScoreLine {
  points: number;
  reason: string;
}

export interface EnquiryScore {
  points: number;
  temperature: LeadTemperature;
  /** Only the answers that earned points, in the order the guide lists them. */
  lines: ScoreLine[];
}

function isOptionOf<Q extends ChoiceQuestion>(question: Q, value: unknown): value is OptionId<Q> {
  return typeof value === 'string' && question.options.some((o) => o.id === value);
}

function labelOf(question: ChoiceQuestion, id: string): string {
  return question.options.find((o) => o.id === id)?.label ?? id;
}

function hasText(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim() !== '';
}

export function temperatureFor(points: number): LeadTemperature {
  if (points >= HOT_MIN_POINTS) return 'hot';
  if (points >= WARM_MIN_POINTS) return 'warm';
  return 'cold';
}

/**
 * Anything that is not a known answer to the question is ignored rather than
 * rejected: a stale or tampered value costs the lead its points, never the
 * lead itself.
 */
export function scoreEnquiry({
  branch,
  answers,
  company,
  companyWebsite,
  hasAcceptedProofOfFunds,
}: ScoreInput): EnquiryScore {
  const lines: ScoreLine[] = [];
  const add = (points: number, reason: string) => {
    if (points > 0) lines.push({ points, reason });
  };

  if (isOptionOf(ROLE_QUESTION, answers.role)) {
    add(ROLE_POINTS[answers.role], labelOf(ROLE_QUESTION, answers.role));
  }

  if (isOptionOf(TIMELINE_QUESTION, answers.timeline)) {
    add(TIMELINE_POINTS[answers.timeline], `Signing: ${labelOf(TIMELINE_QUESTION, answers.timeline).toLowerCase()}`);
  }

  if (isOptionOf(FUNDING_QUESTION, answers.funding)) {
    add(FUNDING_POINTS[answers.funding], `Funding: ${labelOf(FUNDING_QUESTION, answers.funding).toLowerCase()}`);
  }

  if (
    branch === 'startup-airline' &&
    CERTIFICATION_QUESTION &&
    isOptionOf(CERTIFICATION_QUESTION, answers.certification)
  ) {
    add(
      CERTIFICATION_POINTS[answers.certification],
      `Startup: ${labelOf(CERTIFICATION_QUESTION, answers.certification)}`,
    );
  }

  // Only on a dry lease: that is the only case where the question is asked, so
  // a "yes" arriving alongside any other lease type was never a real answer.
  if (
    branch === 'existing-airline' &&
    LEASE_TYPE_QUESTION &&
    DEPOSIT_QUESTION &&
    isOptionOf(LEASE_TYPE_QUESTION, answers['lease-type']) &&
    answers['lease-type'] === 'dry' &&
    isOptionOf(DEPOSIT_QUESTION, answers.deposit) &&
    answers.deposit === 'yes'
  ) {
    add(DRY_LEASE_DEPOSIT_POINTS, 'Dry lease: deposit and reserves available');
  }

  if (hasText(company) && hasText(companyWebsite)) {
    add(COMPANY_AND_WEBSITE_POINTS, 'Company and website given');
  }

  if (hasAcceptedProofOfFunds) {
    add(PROOF_OF_FUNDS_POINTS, 'Proof-of-funds box ticked');
  }

  const points = lines.reduce((sum, line) => sum + line.points, 0);
  return { points, temperature: temperatureFor(points), lines };
}
