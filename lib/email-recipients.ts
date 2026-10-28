// =============================================================================
// Who is emailed when a form on the site is submitted
// =============================================================================
// Every recipient list lives here, so changing who hears about what is a
// one-line edit. Mail goes out through Resend from noreply@ean.aero
// (RESEND_API_KEY). Whatever these lists say, every lead is also saved to the
// admin desk at /admin/leads.

/**
 * Every lead except a pricing quote: the /contact form, the /charter request,
 * and the privacy-request and legal-notice forms on /privacy-policy and
 * /terms-of-use. Every submission is sent, whatever its priority.
 */
export const LEAD_RECIPIENTS: readonly string[] = ['marketing@ean.aero', 'josephine.kolawole@ean.aero']

/**
 * Pricing quotes: the /pricing quote builder and the homepage quote
 * calculator. marketing@ and Josephine are deliberately not on it. While it is
 * empty, pricing quotes are saved to the admin desk but email no one.
 */
export const PRICING_RECIPIENTS: readonly string[] = [
  // The six addresses go here.
]

/**
 * The /feedback form. Every submission goes to both, from clients and
 * operators alike. Routing by `feedback.audience` / `type` was deliberately
 * left out when the form shipped (October 2026); if it is wanted, add it in
 * lib/services/feedback-notifications.ts so the route stays unaware of who
 * reads what.
 */
export const FEEDBACK_RECIPIENTS: readonly string[] = ['josephine.kolawole@ean.aero', 'cro@ean.aero']
