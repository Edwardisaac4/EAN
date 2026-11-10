import type { Metadata } from 'next'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import CertificateGallery from '@/components/credentials/CertificateGallery'
import JsonLd from '@/components/shared/JsonLd'
import { currentCertificates } from '@/lib/credentials-constants'
import { buildMetadata, breadcrumbSchema, PAGE_SEO } from '@/lib/seo'

export const metadata: Metadata = buildMetadata(PAGE_SEO.credentials)

// Re-rendered once a day, so a lapsed certificate leaves the grid the day after
// its validUntil without anyone having to redeploy. See currentCertificates.
export const revalidate = 86400

// Every certificate in force, in one grid, not grouped by issuing body; each
// one opens in the viewer. Filtered here rather than in the client so the
// expiry check runs on the deploy's clock, not the visitor's.
export default function CredentialsPage() {
  const certificates = currentCertificates()

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
          { name: 'Credentials', path: '/credentials' },
        ])}
      />
      {/* The header is the brand-blue band, so the bar takes its
          white-on-dark palette at rest, as on /pricing. */}
      <Navbar hasPhotoHero />

      <main className="flex-1 bg-ean-navy text-ean-text-light">
        {/* Short on purpose. On a 620px-tall laptop window a full-height hero
            would push the certificates below the fold, and they are the page. */}
        <section className="relative overflow-hidden text-white">
          {/* The /services hero photograph and scrims, in this page's short band.
              Decorative, so empty alt; the only image above the fold, so it is
              the one `priority` here (AGENTS.md §8). */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <Image
              src="/images/pricing-hero-hangar.jpg"
              alt=""
              fill
              sizes="100vw"
              quality={70}
              priority
              /* Lower than /services' 72%: this band is ~250px, not ~540px, and
                 the jet sits at 69–93% of the frame's height. At 72% only its
                 tail made the strip; at 94% the whole aircraft does. */
              className="object-cover object-[50%_94%]"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/15 to-black/40" />
          </div>

          <div className="relative z-10 max-w-ean mx-auto px-6 md:px-8 pt-32 pb-9 md:pt-34 md:pb-11 grid gap-3">
            {/* Literal white over a photograph, per AGENTS.md §5. */}
            <span className="ean-rise font-mono text-[11px] uppercase tracking-[0.2em] text-white/75">
              EAN Aviation · Credentials
            </span>
            <h1 className="ean-rise ean-rise-delay-1 m-0 text-balance font-display font-light text-[clamp(28px,4.4vw,44px)] leading-[1.08] tracking-[-.01em]">
              Our Credentials And Certifications
            </h1>
          </div>
        </section>

        {/* Same container as the grid, so the paragraph spans its full width. */}
        <section className="pt-10 sm:pt-12">
          <div className="max-w-ean mx-auto px-6 md:px-8">
            <p className="m-0 font-ui text-[17px] md:text-[19px] leading-relaxed text-ean-muted-light">
              At EAN Aviation, safety and service excellence are more than commitments; they are
              independently verified. Our certifications confirm that our FBO, ground handling, and
              maintenance operations meet global standards.
            </p>
          </div>
        </section>

        <section aria-label="Certificates" className="pt-6 pb-16 sm:pt-8 sm:pb-20">
          <div className="max-w-ean mx-auto px-6 md:px-8">
            <CertificateGallery certificates={certificates} />
          </div>
        </section>
      </main>
    </>
  )
}
