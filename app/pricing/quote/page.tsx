import { permanentRedirect } from 'next/navigation'

// The calculator that lived here was folded into the quote builder on /pricing
// in October 2026. Permanent, so search engines move the old URL's standing
// across rather than keeping both.
export default function PricingQuoteRedirect() {
  permanentRedirect('/pricing')
}
