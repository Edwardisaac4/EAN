import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import PricingCalculator from '@/components/pricing/PricingCalculator'
import JsonLd from '@/components/shared/JsonLd'
import { buildMetadata, breadcrumbSchema, PAGE_SEO } from '@/lib/seo'

export const metadata: Metadata = buildMetadata(PAGE_SEO.pricingQuote)

// The quote calculator. It lived at /pricing until the published rate sheet
// took that URL in September 2026; every "Build your own quote" link lands here.
export default function PricingQuotePage() {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
          { name: 'Build your quote', path: '/pricing/quote' },
        ])}
      />
      <Navbar hasPhotoHero />
      <main className="flex-1">
        <PricingCalculator />
      </main>
    </>
  )
}
