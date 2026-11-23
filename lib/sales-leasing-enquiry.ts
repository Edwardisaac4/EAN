// =============================================================================
// Aircraft Sales & Leasing enquiry — every question the step-by-step flow asks
// =============================================================================
// Transcribed from "EAN Aviation - Website Inquiry Flow & Brochure Guide"
// (2 November 2026). The guide is an internal brief and is kept out of the repo
// (.gitignore), so this file is the copy the site works from.
//
// One list, read by the flow on /services/aircraft-sales-leasing and by the
// scoring that tags each lead Hot, Warm or Cold, so the wording a visitor sees
// and the answers the score counts cannot drift apart. Client-safe: nothing in
// here may import a server module.
//
// Option `id`s are what gets stored and scored. Labels can be reworded freely;
// an `id` should not change once leads carrying it exist.

import type { LeadTrackingData } from '@/lib/lead-tracking';

export interface EnquiryOption {
  id: string;
  label: string;
  /** Second, smaller line under the label — example routes, aircraft families. */
  detail?: string;
  /** On a multi-select, picking this clears every other choice ("None"). */
  isExclusive?: boolean;
}

interface QuestionBase {
  id: string;
  title: string;
  /** Small line under the title. */
  helper?: string;
  /** Continue is allowed without an answer. */
  isOptional?: boolean;
  /**
   * Asked only when an earlier answer in the same path matches. Without it the
   * existing-airline path would put a lease-term question to someone who just
   * said they need cover for a grounded aircraft for a month.
   */
  showIf?: { questionId: string; anyOf: readonly string[] };
}

export interface ChoiceQuestion extends QuestionBase {
  kind: 'single' | 'multi';
  options: readonly EnquiryOption[];
}

export interface TextQuestion extends QuestionBase {
  kind: 'text';
  placeholder: string;
  maxLength: number;
}

/** A month picker with a one-tap alternative, for "when do you need it?". */
export interface MonthQuestion extends QuestionBase {
  kind: 'month';
  asapLabel: string;
}

export type EnquiryQuestion = ChoiceQuestion | TextQuestion | MonthQuestion;

// -----------------------------------------------------------------------------
// The two forks before any path starts
// -----------------------------------------------------------------------------

export type SalesBranch = 'business-jet' | 'commercial' | 'helicopter';
export type LeasingBranch = 'startup-airline' | 'existing-airline';
export type EnquiryBranch = SalesBranch | LeasingBranch;

export const BRANCH_LABELS: Record<EnquiryBranch, string> = {
  'business-jet': 'Sales · Business jet',
  commercial: 'Sales · Commercial aircraft',
  helicopter: 'Sales · Helicopter',
  'startup-airline': 'Leasing · Startup airline',
  'existing-airline': 'Leasing · Existing airline',
};

export const INTENT_QUESTION = {
  id: 'intent',
  kind: 'single',
  title: 'Are you looking to buy or lease an aircraft?',
  options: [
    {
      id: 'buy',
      label: 'Buy an aircraft',
      detail: 'Business jets, commercial aircraft and helicopters, new or pre-owned',
    },
    {
      id: 'lease',
      label: 'Lease an aircraft',
      detail: 'Wet, damp and dry leases, short-term cover and fleet growth',
    },
  ],
} as const satisfies ChoiceQuestion;

export const SALES_TYPE_QUESTION = {
  id: 'aircraft-type',
  kind: 'single',
  title: 'What type of aircraft are you looking to buy?',
  options: [
    { id: 'business-jet', label: 'Business jet' },
    { id: 'commercial', label: 'Commercial aircraft' },
    { id: 'helicopter', label: 'Helicopter' },
  ],
} as const satisfies ChoiceQuestion;

/**
 * The guide's first leasing question. A startup needs a path to launch and an
 * existing airline needs capacity on a date, so those two get different
 * questions.
 */
export const LEASING_PROFILE_QUESTION = {
  id: 'profile',
  kind: 'single',
  title: 'Which best describes you?',
  options: [
    { id: 'startup-airline', label: 'Startup airline', detail: 'Not yet flying' },
    { id: 'existing-airline', label: 'Existing airline' },
    { id: 'charter-operator', label: 'Charter / private operator' },
    { id: 'government', label: 'Government / state agency' },
  ],
} as const satisfies ChoiceQuestion;

type LeasingProfile = (typeof LEASING_PROFILE_QUESTION)['options'][number]['id'];

/**
 * The guide gives charter operators and government agencies no questions of
 * their own. Both already fly or contract aircraft, so they take the existing-
 * airline path rather than the startup one, which asks about getting an AOC.
 */
export const LEASING_PROFILE_BRANCH: Record<LeasingProfile, LeasingBranch> = {
  'startup-airline': 'startup-airline',
  'existing-airline': 'existing-airline',
  'charter-operator': 'existing-airline',
  government: 'existing-airline',
};

// -----------------------------------------------------------------------------
// Shared answer sets — the guide uses the same bands in several paths
// -----------------------------------------------------------------------------

/** Each band carries the aircraft families it implies, from the guide. */
const SEAT_BAND_OPTIONS = [
  { id: 'under-80', label: 'Under 80 seats', detail: 'e.g. ATR, Dash 8' },
  { id: '80-150', label: '80–150 seats', detail: 'e.g. Embraer E-Jets' },
  { id: '150-220', label: '150–220 seats', detail: 'e.g. A320, 737' },
  { id: '220-plus', label: '220+ seats', detail: 'e.g. A330, 787' },
  { id: 'not-sure', label: 'Not sure yet' },
] as const satisfies readonly EnquiryOption[];

const NEW_OR_PRE_OWNED_OPTIONS = [
  { id: 'new', label: 'Brand new only' },
  { id: 'pre-owned', label: 'Pre-owned only' },
  { id: 'either', label: 'Open to both' },
] as const satisfies readonly EnquiryOption[];

// -----------------------------------------------------------------------------
// Sales paths
// -----------------------------------------------------------------------------

export const BUSINESS_JET_QUESTIONS = [
  {
    id: 'passengers',
    kind: 'single',
    title: 'How many passengers do you usually fly with?',
    options: [
      { id: '1-4', label: '1–4' },
      { id: '5-8', label: '5–8' },
      { id: '9-13', label: '9–13' },
      { id: '14-plus', label: '14+' },
      { id: 'not-sure', label: 'Not sure yet' },
    ],
  },
  {
    id: 'range',
    kind: 'single',
    title: 'What is the longest trip you take at least 2–3 times a year?',
    // City pairs, because buyers know their routes, not their nautical miles.
    options: [
      { id: 'west-africa', label: 'Within Nigeria / West Africa', detail: 'e.g. Lagos–Abuja, Lagos–Accra' },
      { id: 'across-africa', label: 'Across Africa', detail: 'e.g. Lagos–Johannesburg, Lagos–Nairobi' },
      { id: 'europe-middle-east', label: 'Africa to Europe or the Middle East', detail: 'e.g. Lagos–London, Abuja–Dubai' },
      { id: 'intercontinental', label: 'Intercontinental', detail: 'e.g. Lagos–New York, Lagos–Asia' },
    ],
  },
  {
    id: 'condition',
    kind: 'single',
    title: 'Are you open to a pre-owned aircraft?',
    options: NEW_OR_PRE_OWNED_OPTIONS,
  },
  {
    id: 'use',
    kind: 'single',
    title: 'Who will the aircraft mainly serve?',
    options: [
      { id: 'personal', label: 'Personal / family' },
      { id: 'executives', label: 'Company executives' },
      { id: 'charter', label: 'Charter (under an AOC)' },
      { id: 'government', label: 'Government / VIP' },
    ],
  },
  {
    id: 'ownership',
    kind: 'single',
    title: 'Do you currently own or operate an aircraft?',
    options: [
      { id: 'upgrade', label: 'Yes, looking to upgrade or trade in' },
      { id: 'adding', label: 'Yes, adding to my fleet' },
      { id: 'first', label: 'No, this would be my first' },
    ],
  },
  {
    id: 'model',
    kind: 'text',
    title: 'Any model in mind?',
    isOptional: true,
    placeholder: 'e.g. Challenger 350, or “No preference”',
    maxLength: 120,
  },
] as const satisfies readonly EnquiryQuestion[];

export const COMMERCIAL_QUESTIONS = [
  {
    id: 'buyer',
    kind: 'single',
    title: 'Who is the aircraft for?',
    options: [
      { id: 'existing-airline', label: 'Existing airline' },
      { id: 'startup-airline', label: 'Startup airline' },
      { id: 'investor', label: 'Investor / lessor' },
      { id: 'government', label: 'Government / state carrier' },
    ],
  },
  {
    id: 'mission',
    kind: 'single',
    title: 'What missions will it fly?',
    options: [
      { id: 'domestic', label: 'Domestic' },
      { id: 'regional', label: 'Regional', detail: 'West and Central Africa' },
      { id: 'continental', label: 'Continental', detail: 'Across Africa' },
      { id: 'long-haul', label: 'Long-haul intercontinental' },
    ],
  },
  {
    id: 'seats',
    kind: 'single',
    title: 'How many seats do you need per aircraft?',
    options: SEAT_BAND_OPTIONS,
  },
  {
    id: 'payload',
    kind: 'single',
    title: 'What will it carry?',
    options: [
      { id: 'passengers', label: 'Passengers' },
      { id: 'cargo', label: 'Cargo (freighter)' },
      { id: 'combi', label: 'Mixed / combi' },
      { id: 'vip', label: 'VIP / government' },
    ],
  },
  {
    id: 'quantity',
    kind: 'single',
    title: 'How many aircraft?',
    options: [
      { id: '1', label: '1' },
      { id: '2-5', label: '2–5' },
      { id: '6-plus', label: '6+' },
    ],
  },
  {
    id: 'age',
    kind: 'single',
    title: 'What age of aircraft do you prefer?',
    options: [
      { id: 'new', label: 'New delivery' },
      { id: 'under-10', label: 'Under 10 years old' },
      { id: '10-20', label: '10–20 years old' },
      { id: 'no-preference', label: 'No preference' },
    ],
  },
  {
    id: 'current-types',
    kind: 'text',
    title: 'Which aircraft types do you already operate?',
    helper: 'Flying the same type means shared crews, spares and maintenance.',
    isOptional: true,
    placeholder: 'e.g. Boeing 737-800, or “None yet”',
    maxLength: 160,
  },
] as const satisfies readonly EnquiryQuestion[];

export const HELICOPTER_QUESTIONS = [
  {
    id: 'mission',
    kind: 'single',
    title: 'What is the main mission?',
    options: [
      { id: 'offshore', label: 'Offshore oil & gas' },
      { id: 'vip', label: 'VIP / corporate transport' },
      { id: 'ems', label: 'Medical evacuation (EMS)' },
      { id: 'government', label: 'Government / security' },
      { id: 'utility', label: 'Utility, survey or agriculture' },
      { id: 'training', label: 'Training' },
    ],
  },
  {
    id: 'passengers',
    kind: 'single',
    title: 'How many passengers per flight?',
    options: [
      { id: '1-4', label: '1–4' },
      { id: '5-8', label: '5–8' },
      { id: '9-12', label: '9–12' },
      { id: '13-plus', label: '13+' },
    ],
  },
  {
    id: 'engines',
    kind: 'single',
    title: 'Single or twin engine?',
    options: [
      { id: 'single', label: 'Single engine' },
      { id: 'twin', label: 'Twin engine' },
      { id: 'not-sure', label: 'Not sure, please advise' },
    ],
  },
  {
    id: 'distance',
    kind: 'single',
    title: 'What is your typical one-way distance?',
    options: [
      { id: 'under-150', label: 'Under 150 km' },
      { id: '150-300', label: '150–300 km' },
      { id: 'over-300', label: 'Over 300 km' },
    ],
  },
  {
    id: 'condition',
    kind: 'single',
    title: 'New or pre-owned?',
    options: NEW_OR_PRE_OWNED_OPTIONS,
  },
  {
    id: 'equipment',
    kind: 'multi',
    title: 'Any special equipment needed?',
    helper: 'Pick any that apply.',
    isOptional: true,
    options: [
      { id: 'hoist', label: 'Rescue hoist' },
      { id: 'floats', label: 'Emergency floats' },
      { id: 'medical', label: 'Medical interior' },
      { id: 'vip', label: 'VIP interior' },
      { id: 'none', label: 'None', isExclusive: true },
    ],
  },
] as const satisfies readonly EnquiryQuestion[];

// -----------------------------------------------------------------------------
// Leasing paths
// -----------------------------------------------------------------------------

export const STARTUP_AIRLINE_QUESTIONS = [
  {
    id: 'certification',
    kind: 'single',
    title: 'Where are you in certification?',
    options: [
      { id: 'business-plan', label: 'Business plan stage' },
      { id: 'atl-applied', label: 'Air Transport Licence applied for' },
      { id: 'aoc-underway', label: 'AOC process underway' },
      { id: 'aoc-issued', label: 'AOC issued' },
    ],
  },
  {
    id: 'mission',
    kind: 'single',
    title: 'What routes will you launch with?',
    options: [
      { id: 'domestic', label: 'Domestic' },
      { id: 'regional', label: 'Regional', detail: 'West and Central Africa' },
      { id: 'international', label: 'International' },
    ],
  },
  {
    id: 'quantity',
    kind: 'single',
    title: 'How many aircraft at launch?',
    options: [
      { id: '1', label: '1' },
      { id: '2-3', label: '2–3' },
      { id: '4-plus', label: '4+' },
    ],
  },
  {
    id: 'seats',
    kind: 'single',
    title: 'How many seats per aircraft?',
    options: SEAT_BAND_OPTIONS,
  },
  {
    id: 'lease-type',
    kind: 'single',
    title: 'What kind of lease?',
    options: [
      { id: 'wet', label: 'Wet lease / ACMI', detail: 'Aircraft with crew, maintenance and insurance' },
      { id: 'dry', label: 'Dry lease', detail: 'Aircraft only' },
      { id: 'not-sure', label: 'Not sure, please advise' },
    ],
  },
  {
    id: 'financing',
    kind: 'single',
    title: 'Do you need financing support to get started?',
    options: [
      { id: 'full', label: 'Yes, full financing' },
      { id: 'partial', label: 'Yes, partial' },
      { id: 'funded', label: 'No, we are funded' },
      { id: 'discuss', label: 'Would like to discuss' },
    ],
  },
  {
    id: 'first-flight',
    kind: 'single',
    title: 'When is your target first flight?',
    options: [
      { id: 'within-6', label: 'Within 6 months' },
      { id: '6-12', label: '6–12 months' },
      { id: '12-plus', label: '12+ months' },
      { id: 'not-set', label: 'Not set yet' },
    ],
  },
] as const satisfies readonly EnquiryQuestion[];

export const EXISTING_AIRLINE_QUESTIONS = [
  {
    id: 'need',
    kind: 'single',
    title: 'What do you need the aircraft for?',
    options: [
      { id: 'short-term', label: 'Short-term capacity', detail: 'Seasonal peaks such as Hajj, Umrah or festive travel' },
      { id: 'cover', label: 'Cover for a grounded aircraft', detail: 'Maintenance check or AOG' },
      { id: 'expansion', label: 'Long-term fleet expansion' },
      { id: 'replacement', label: 'Replacing older aircraft' },
    ],
  },
  {
    id: 'duration',
    kind: 'single',
    title: 'For how long?',
    showIf: { questionId: 'need', anyOf: ['short-term', 'cover'] },
    options: [
      { id: 'under-1', label: 'Under 1 month' },
      { id: '1-3', label: '1–3 months' },
      { id: '3-6', label: '3–6 months' },
      { id: '6-12', label: '6–12 months' },
    ],
  },
  {
    id: 'term',
    kind: 'single',
    title: 'What lease term would you prefer?',
    showIf: { questionId: 'need', anyOf: ['expansion', 'replacement'] },
    options: [
      { id: '3-5', label: '3–5 years' },
      { id: '6-8', label: '6–8 years' },
      { id: '8-12', label: '8–12 years' },
      { id: 'open', label: 'Open' },
    ],
  },
  {
    id: 'start',
    kind: 'month',
    title: 'When do you need the first aircraft?',
    asapLabel: 'As soon as possible',
  },
  {
    id: 'lease-type',
    kind: 'single',
    title: 'What type of lease?',
    options: [
      { id: 'wet', label: 'Wet lease / ACMI', detail: 'Aircraft, crew, maintenance and insurance' },
      { id: 'damp', label: 'Damp lease', detail: 'Aircraft and cockpit crew' },
      { id: 'dry', label: 'Dry lease', detail: 'Aircraft only' },
      { id: 'not-sure', label: 'Not sure, please advise' },
    ],
  },
  // The guide asks seat band and count as one question. Split so each screen
  // stays a single tap.
  {
    id: 'seats',
    kind: 'single',
    title: 'How many seats per aircraft?',
    options: SEAT_BAND_OPTIONS,
  },
  {
    id: 'quantity',
    kind: 'single',
    title: 'How many aircraft?',
    options: [
      { id: '1', label: '1' },
      { id: '2-5', label: '2–5' },
      { id: '6-plus', label: '6+' },
    ],
  },
  {
    id: 'fleet-size',
    kind: 'single',
    title: 'How big is your current fleet?',
    // "None yet" is not in the guide. Government agencies take this path too,
    // and some will not own an aircraft today.
    options: [
      { id: 'none', label: 'None yet' },
      { id: '1-3', label: '1–3 aircraft' },
      { id: '4-10', label: '4–10 aircraft' },
      { id: '11-plus', label: '11+ aircraft' },
    ],
  },
  {
    id: 'deposit',
    kind: 'single',
    title: 'Can you provide a security deposit and maintenance reserves?',
    helper: 'Dry-lease lessors usually ask for both.',
    showIf: { questionId: 'lease-type', anyOf: ['dry'] },
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'discuss', label: 'Need to discuss' },
    ],
  },
  {
    id: 'leaseback',
    kind: 'single',
    title: 'Interested in a sale-and-leaseback?',
    helper: 'Sell an aircraft you own and lease it back, freeing up cash.',
    isOptional: true,
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
      { id: 'tell-me-more', label: 'Tell me more' },
    ],
  },
] as const satisfies readonly EnquiryQuestion[];

export const BRANCH_QUESTIONS: Record<EnquiryBranch, readonly EnquiryQuestion[]> = {
  'business-jet': BUSINESS_JET_QUESTIONS,
  commercial: COMMERCIAL_QUESTIONS,
  helicopter: HELICOPTER_QUESTIONS,
  'startup-airline': STARTUP_AIRLINE_QUESTIONS,
  'existing-airline': EXISTING_AIRLINE_QUESTIONS,
};

// -----------------------------------------------------------------------------
// Final step — every path ends here
// -----------------------------------------------------------------------------
// Money and timing come last on purpose: by now the visitor has invested a few
// taps, and these are the answers that separate serious from not.

export const ROLE_QUESTION = {
  id: 'role',
  kind: 'single',
  title: 'What is your role in this decision?',
  options: [
    { id: 'owner', label: 'Owner / CEO / Director' },
    { id: 'manager', label: 'Fleet or procurement manager' },
    { id: 'advisor', label: 'Advisor or broker acting for a client' },
    { id: 'researching', label: 'Just researching' },
  ],
} as const satisfies ChoiceQuestion;

/**
 * Sales only, and only where the sales team has agreed the bands. The guide
 * gives business-jet bands; commercial and helicopter visitors skip the budget
 * question until theirs are set. Add an entry here to switch it on.
 */
export const BUDGET_QUESTIONS: Partial<Record<SalesBranch, ChoiceQuestion>> = {
  'business-jet': {
    id: 'budget',
    kind: 'single',
    title: 'What is your budget range?',
    helper: 'In US dollars.',
    options: [
      { id: 'under-5m', label: 'Under $5m' },
      { id: '5-15m', label: '$5m–$15m' },
      { id: '15-35m', label: '$15m–$35m' },
      { id: '35m-plus', label: '$35m+' },
      { id: 'discuss', label: 'Prefer to discuss' },
    ],
  },
};

export const FUNDING_QUESTION = {
  id: 'funding',
  kind: 'single',
  title: 'How will this be funded?',
  options: [
    { id: 'cash', label: 'Cash / own funds' },
    { id: 'arranged', label: 'Bank or asset finance already arranged' },
    { id: 'needs-financing', label: 'Need financing support' },
    { id: 'undecided', label: 'Not decided yet' },
  ],
} as const satisfies ChoiceQuestion;

export const TIMELINE_QUESTION = {
  id: 'timeline',
  kind: 'single',
  title: 'When do you plan to sign?',
  options: [
    { id: 'within-3', label: 'Within 3 months' },
    { id: '3-6', label: 'In 3–6 months' },
    { id: '6-12', label: 'In 6–12 months' },
    { id: 'exploring', label: 'Just exploring' },
  ],
} as const satisfies ChoiceQuestion;

// -----------------------------------------------------------------------------
// Contact details — the only screen with typing
// -----------------------------------------------------------------------------

export const CONTACT_METHODS = [
  { id: 'phone', label: 'Phone call' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Email' },
] as const satisfies readonly EnquiryOption[];

export type ContactMethod = (typeof CONTACT_METHODS)[number]['id'];

/**
 * Company and website are optional: a business-jet buyer flying family has
 * neither to give. Supplying both earns a point in the score instead.
 * Website is not in the guide's field list; it is added so that point can be
 * earned at all.
 *
 * The website is `companyWebsite`, never `website`: `website` is the honeypot
 * (components/shared/HoneypotField.tsx), and /api/leads discards any lead that
 * arrives with it filled in.
 */
export const CONTACT_FIELDS = [
  { id: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name', isRequired: true, maxLength: 120, placeholder: '' },
  { id: 'company', label: 'Company', type: 'text', autoComplete: 'organization', isRequired: false, maxLength: 160, placeholder: '' },
  { id: 'companyWebsite', label: 'Company website', type: 'url', autoComplete: 'url', isRequired: false, maxLength: 200, placeholder: 'e.g. yourcompany.com' },
  { id: 'country', label: 'Country', type: 'text', autoComplete: 'country-name', isRequired: true, maxLength: 80, placeholder: '' },
  { id: 'email', label: 'Email', type: 'email', autoComplete: 'email', isRequired: true, maxLength: 254, placeholder: '' },
  { id: 'phone', label: 'Phone / WhatsApp', type: 'tel', autoComplete: 'tel', isRequired: true, maxLength: 40, placeholder: 'With country code, e.g. +234' },
] as const;

export type ContactFieldId = (typeof CONTACT_FIELDS)[number]['id'];

export type ContactDetails = Record<ContactFieldId, string> & {
  contactMethod: ContactMethod | '';
  hasAcceptedProofOfFunds: boolean;
};

export type ContactErrors = Partial<Record<ContactFieldId | 'contactMethod', string>>;

export const EMPTY_CONTACT_DETAILS: ContactDetails = {
  fullName: '',
  company: '',
  companyWebsite: '',
  country: '',
  email: '',
  phone: '',
  contactMethod: '',
  hasAcceptedProofOfFunds: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** A bare domain is fine; most people type "company.com", not a full URL. */
const WEBSITE_PATTERN = /^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)*\.[a-z]{2,}(\/\S*)?$/i;
/** E.164 allows at most 15 digits; fewer than 7 cannot be a reachable number. */
const PHONE_DIGITS_MIN = 7;
const PHONE_DIGITS_MAX = 15;

function isContactMethod(value: unknown): value is ContactMethod {
  return CONTACT_METHODS.some((m) => m.id === value);
}

/**
 * One message per field that needs fixing, in plain words. Shared by the
 * screen and the route, so a lead the browser would refuse is refused there too.
 */
export function validateContactDetails(details: ContactDetails): ContactErrors {
  const errors: ContactErrors = {};
  const value = (id: ContactFieldId) => details[id].trim();

  for (const field of CONTACT_FIELDS) {
    if (value(field.id).length > field.maxLength) {
      errors[field.id] = `Please keep this under ${field.maxLength} characters.`;
    }
  }

  if (!value('fullName')) errors.fullName = 'Please enter your name.';
  if (!value('country')) errors.country = 'Please enter your country.';

  if (!value('email')) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(value('email'))) {
    errors.email = 'That email address does not look right.';
  }

  const phoneDigits = value('phone').replace(/\D/g, '');
  if (!value('phone')) {
    errors.phone = 'Please enter a phone or WhatsApp number.';
  } else if (phoneDigits.length < PHONE_DIGITS_MIN || phoneDigits.length > PHONE_DIGITS_MAX) {
    errors.phone = 'That number does not look right. Include the country code, e.g. +234.';
  }

  if (value('companyWebsite') && !WEBSITE_PATTERN.test(value('companyWebsite'))) {
    errors.companyWebsite = 'That web address does not look right, e.g. yourcompany.com.';
  }

  if (!isContactMethod(details.contactMethod)) {
    errors.contactMethod = 'Please choose how we should contact you.';
  }

  return errors;
}

/**
 * Serious buyers expect to be asked for proof of funds; the guide notes that
 * people who are not tend to stop here, which is the point of asking.
 */
export const PROOF_OF_FUNDS_TEXT =
  'I understand EAN may request proof of funds or company documents before sharing specific aircraft offers.';

/**
 * Recorded with the lead's tracking. These leads are filed under the `charter`
 * service (see lib/services/sales-leasing-lead.ts), so this id is what tells
 * them apart from charter requests in the admin desk.
 */
export const SALES_LEASING_FORM_ID = 'sales-leasing-enquiry';

/**
 * The body the flow posts to /api/sales-leasing. The route trusts none of it:
 * every field is checked again there (lib/services/sales-leasing-lead.ts).
 */
export interface SalesLeasingSubmission {
  /** Only answers to questions on the visitor's own path. */
  answers: EnquiryAnswers;
  contact: ContactDetails;
  tracking: LeadTrackingData;
  /** The honeypot. A person never sees it, so from a person it is always empty. */
  website: string;
}

// -----------------------------------------------------------------------------
// The path — which questions this visitor is asked, in order
// -----------------------------------------------------------------------------
// Shared by the flow (what to show next, and the progress total) and by the
// route (which answers to keep), so both agree on what was actually asked.

export type EnquiryAnswerValue = string | readonly string[];

/** Answers keyed by question id. A multi-select answer is a list. */
export type EnquiryAnswers = Readonly<Record<string, EnquiryAnswerValue | undefined>>;

export interface AnsweredQuestion {
  question: EnquiryQuestion;
  value: EnquiryAnswerValue;
}

/** `YYYY-MM`, the value a month question stores when a month is picked. */
const MONTH_VALUE = /^\d{4}-(0[1-9]|1[0-2])$/;
const ASAP_VALUE = 'asap';

function isSalesBranch(value: unknown): value is SalesBranch {
  return SALES_TYPE_QUESTION.options.some((o) => o.id === value);
}

function isLeasingProfile(value: unknown): value is LeasingProfile {
  return LEASING_PROFILE_QUESTION.options.some((o) => o.id === value);
}

/** Where the two forks lead, or undefined until both are answered. */
export function resolveBranch(answers: EnquiryAnswers): EnquiryBranch | undefined {
  if (answers.intent === 'buy') {
    const type = answers[SALES_TYPE_QUESTION.id];
    return isSalesBranch(type) ? type : undefined;
  }
  if (answers.intent === 'lease') {
    const profile = answers[LEASING_PROFILE_QUESTION.id];
    return isLeasingProfile(profile) ? LEASING_PROFILE_BRANCH[profile] : undefined;
  }
  return undefined;
}

function matchesShowIf(
  showIf: NonNullable<QuestionBase['showIf']>,
  answers: EnquiryAnswers,
): boolean {
  const answer = answers[showIf.questionId];
  if (typeof answer === 'string') return showIf.anyOf.includes(answer);
  return Array.isArray(answer) && answer.some((a) => showIf.anyOf.includes(a));
}

/**
 * The questions this visitor will be asked, given what they have answered so
 * far. An unanswered fork is followed down its first option, so the progress
 * bar has a total from the very first screen; the total settles once the forks
 * are answered.
 */
export function buildEnquiryPath(answers: EnquiryAnswers): EnquiryQuestion[] {
  const isLease = answers.intent === 'lease';
  const path: EnquiryQuestion[] = [
    INTENT_QUESTION,
    isLease ? LEASING_PROFILE_QUESTION : SALES_TYPE_QUESTION,
  ];

  const branch = resolveBranch(answers) ?? (isLease ? 'startup-airline' : 'business-jet');
  for (const question of BRANCH_QUESTIONS[branch]) {
    if (question.showIf && !matchesShowIf(question.showIf, answers)) continue;
    path.push(question);
  }

  path.push(ROLE_QUESTION);
  const budget = isSalesBranch(branch) ? BUDGET_QUESTIONS[branch] : undefined;
  if (budget) path.push(budget);
  path.push(FUNDING_QUESTION, TIMELINE_QUESTION);

  return path;
}

/** A value the question could genuinely have produced. */
export function isAnswerValid(
  question: EnquiryQuestion,
  value: EnquiryAnswerValue | undefined,
): value is EnquiryAnswerValue {
  switch (question.kind) {
    case 'single':
      return typeof value === 'string' && question.options.some((o) => o.id === value);
    case 'multi': {
      if (!Array.isArray(value) || value.length === 0) return false;
      const picked = question.options.filter((o) => value.includes(o.id));
      if (picked.length !== value.length) return false;
      // An exclusive answer ("None") stands alone.
      return value.length === 1 || !picked.some((o) => o.isExclusive);
    }
    case 'text':
      return (
        typeof value === 'string' &&
        value.trim() !== '' &&
        value.trim().length <= question.maxLength
      );
    case 'month':
      return value === ASAP_VALUE || (typeof value === 'string' && MONTH_VALUE.test(value));
  }
}

/** Only the questions on this visitor's path, and only answers that are valid. */
export function answeredPath(answers: EnquiryAnswers): AnsweredQuestion[] {
  return buildEnquiryPath(answers).flatMap((question) => {
    const value = answers[question.id];
    return isAnswerValid(question, value) ? [{ question, value }] : [];
  });
}

export const MONTH_ASAP = ASAP_VALUE;

/** "2027-03" → "March 2027". UTC, so no visitor's time zone shifts the month. */
export function formatMonth(value: string): string {
  const [year, month] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/** The answer in words, as the visitor saw it — for the summary and the lead alert. */
export function describeAnswer(question: EnquiryQuestion, value: EnquiryAnswerValue): string {
  switch (question.kind) {
    case 'single':
    case 'multi': {
      const ids = typeof value === 'string' ? [value] : value;
      return question.options
        .filter((o) => ids.includes(o.id))
        .map((o) => o.label)
        .join(', ');
    }
    case 'text':
      return typeof value === 'string' ? value.trim() : value.join(', ');
    case 'month':
      if (value === ASAP_VALUE) return question.asapLabel;
      return typeof value === 'string' ? formatMonth(value) : '';
  }
}
