import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import Navbar from '@/components/layout/Navbar'
import CertificateGallery from '@/components/credentials/CertificateGallery'
import JsonLd from '@/components/shared/JsonLd'
import { ISSUERS, currentCertificates, findIssuer } from '@/lib/credentials-constants'
import { buildMetadata, breadcrumbSchema } from '@/lib/seo'

interface IssuerCredentialsPageProps {
  params: Promise<{ issuer: string }>
}

// Re-rendered once a day, as /credentials is, so a lapsed certificate leaves
// the grid the day after its validUntil. See currentCertificates.
export const revalidate = 86400

export function generateStaticParams() {
  return ISSUERS.map((issuer) => ({ issuer: issuer.id }))
}

export async function generateMetadata({ params }: IssuerCredentialsPageProps): Promise<Metadata> {
  const issuer = findIssuer((await params).issuer)

  if (!issuer) {
    return {
      title: 'Credentials Not Found | EAN Aviation',
      robots: { index: false, follow: true },
    }
  }

  return buildMetadata({
    title: `${issuer.shortName} Certificates | EAN Aviation`,
    description: `The ${issuer.name} certificates EAN holds, each shown as issued with its certificate number and validity.`,
    path: `/credentials/${issuer.id}`,
  })
}

export default async function IssuerCredentialsPage({ params }: IssuerCredentialsPageProps) {
  const issuer = findIssuer((await params).issuer)
  if (!issuer) notFound()

  const certificates = currentCertificates().filter(
    (certificate) => certificate.issuer === issuer.id,
  )
  // /credentials shows this body as "Coming soon" with no link, so an empty
  // grid is only reachable by typing the URL. A 404 is the honest answer then.
  if (certificates.length === 0) notFound()

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
          { name: 'Credentials', path: '/credentials' },
          { name: issuer.shortName, path: `/credentials/${issuer.id}` },
        ])}
      />
      <Navbar hasPhotoHero />

      <main className="flex-1 bg-ean-navy text-ean-text-light">
        {/* The same short band as /credentials, so the certificates start
            inside a 620px-tall laptop window. */}
        <section className="bg-ean-blue text-white">
          <div className="max-w-ean mx-auto px-6 md:px-8 pt-30 pb-9 md:pt-32 md:pb-11 grid gap-3">
            <Link
              href="/credentials"
              className="ean-rise group inline-flex w-fit items-center gap-2 font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-ean-muted-dark transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              All credentials
            </Link>
            <span className="ean-rise font-mono text-[11px] uppercase tracking-[0.2em] text-ean-muted-dark">
              Credentials · {issuer.shortName}
            </span>
            <h1 className="ean-rise ean-rise-delay-1 m-0 text-balance font-display font-light text-[clamp(28px,4.4vw,44px)] leading-[1.08] tracking-[-.01em]">
              {issuer.name}
            </h1>
          </div>
        </section>

        <section aria-label={`${issuer.shortName} certificates`} className="pt-8 pb-16 sm:pt-10 sm:pb-20">
          <div className="max-w-ean mx-auto px-6 md:px-8">
            <CertificateGallery certificates={certificates} />
          </div>
        </section>
      </main>
    </>
  )
}
