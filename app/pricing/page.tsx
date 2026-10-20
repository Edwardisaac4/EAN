import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import QuoteBuilder from '@/components/pricing/QuoteBuilder'
import JsonLd from '@/components/shared/JsonLd'
import { buildMetadata, breadcrumbSchema, PAGE_SEO } from '@/lib/seo'

// Routed through buildMetadata so this page gets a canonical URL and Open Graph
// tags. Previously it declared only title + description, so it canonicalised to
// the site root via metadataBase and shared as a bare link.
export const metadata: Metadata = buildMetadata(PAGE_SEO.pricing)

// The quote builder. Since October 2026 it is the whole pricing page, replacing
// the calculator that was here.
export default function PricingPage() {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ])}
      />
      {/* The hero is a photograph under a dark scrim — the bar needs its
          white-on-dark palette at rest. */}
      <Navbar hasPhotoHero />
      <main className="flex-1">
        <QuoteBuilder />
      </main>
    </>
  )
}
