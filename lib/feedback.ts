// =============================================================================
// Customer feedback — the options /feedback offers and /api/feedback accepts
// =============================================================================
// Imported by both the form and the route, so the choices a customer can make
// and the values the route will accept cannot drift apart. Client-safe: nothing
// in here may import a server module.

/**
 * Who the feedback is from. The two get different forms because they buy
 * different things: a client experiences the terminal, lounge or cabin; an
 * operator is billed per movement against the rate schedule, and the desk
 * needs the company and aircraft to trace what happened.
 */
export const FEEDBACK_AUDIENCES = ['client', 'operator'] as const;

export type FeedbackAudience = (typeof FEEDBACK_AUDIENCES)[number];

export const FEEDBACK_AUDIENCE_LABELS: Record<FeedbackAudience, string> = {
  client: 'Client',
  operator: 'Operator',
};

export const FEEDBACK_TYPES = ['compliment', 'suggestion', 'complaint'] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  compliment: 'Compliment',
  suggestion: 'Suggestion',
  complaint: 'Complaint',
};

/** Long enough for a detailed complaint, short enough to read in one email. */
export const FEEDBACK_MESSAGE_MAX = 5000;
