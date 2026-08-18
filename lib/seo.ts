// =============================================================================
// Centralised SEO — metadata builders and JSON-LD structured data
// =============================================================================
// Before this existed, eight of thirteen public pages shipped no metadata at
// all: they inherited the root layout's single generic title, so search engines
// saw eight identical <title>/description pairs. Nothing declared a canonical
// URL, and only blog posts carried Open Graph tags, which meant every share of
// a service or pricing page rendered as a bare link.
//
// Every public page now routes its metadata through buildMetadata() so the
// canonical, Open Graph and Twitter blocks cannot drift apart.

import type { Metadata } from "next";
import { LAGOS_HQ } from "@/lib/constants";

/**
 * Canonical origin. Overridable so Vercel preview deployments self-reference
 * rather than pointing their canonicals at production.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
  "https://ean.aero";

export const SITE_NAME = "EAN Aviation";
export const SITE_TAGLINE =
  "Nigeria’s first fully integrated FBO at Murtala Muhammed International " +
  "Airport, Lagos — NCAA-approved aircraft maintenance, jet and helicopter " +
  "charter, Wings™ in-flight catering and 24/7 VIP ground handling";

/**
 * Default share image. Points at real EAN photography rather than a synthesised
 * card — social platforms crop to their own ratio, and an actual hangar shot
 * reads better than a generated placeholder.
 */
export const DEFAULT_OG_IMAGE = "/images/hero/slide-1.jpg";

export interface PageSeoInput {
  title: string;
  description: string;
  /** Route path, leading slash, no origin. Used for the canonical URL. */
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  /** Set for pages that must never appear in an index (none currently public). */
  noIndex?: boolean;
}

/**
 * Builds a complete Metadata object: title, description, canonical, Open Graph
 * and Twitter card in one place.
 *
 * `title` is passed through verbatim rather than templated, because several
 * pages want full control of the tail (e.g. "… | EAN Aviation Insights").
 */
export function buildMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  publishedTime,
  noIndex = false,
}: PageSeoInput): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const absoluteImage = image.startsWith("http")
    ? image
    : `${SITE_URL}${image}`;

  return {
    // `absolute` is required, not stylistic: the root layout defines a title
    // template of "%s | EAN Aviation", and every title here is already complete.
    // Without this the rendered <title> reads "About EAN Aviation | Credentials …
    // | EAN Aviation".
    title: { absolute: title },
    description,
    alternates: {
      // Without this, /pricing and /pricing?utm_source=… are competing URLs.
      canonical: url,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_NG",
      type,
      ...(publishedTime ? { publishedTime } : {}),
      images: [{ url: absoluteImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage],
    },
  };
}

/**
 * Per-page copy for the statically prerendered public routes.
 *
 * Descriptions are written to be distinct and specific — duplicated or
 * boilerplate descriptions are the single most common reason a page's snippet
 * gets rewritten by the search engine.
 */
export const PAGE_SEO = {
  home: {
    title:
      "EAN Aviation | Private Jet Charter, FBO & Aircraft Maintenance in Lagos",
    description:
      "Nigeria’s first fully integrated FBO at Murtala Muhammed International Airport, Lagos. Private jet charter, NCAA-approved maintenance, VIP lounge, and 24/7 ground handling.",
    path: "/",
  },
  about: {
    title: "About EAN Aviation | Credentials, Safety Record & Infrastructure",
    description:
      "EAN Aviation operates Nigeria’s first fully integrated private terminal, VIP lounge and maintenance hub at Lagos MMIA, under NCAA and ICAO safety standards.",
    path: "/about",
    image: "/images/about-jet.jpg",
  },
  history: {
    title:
      "Our History | EAN Aviation’s Growth in West African Business Aviation",
    description:
      "From the first integrated FBO hangar at Lagos MMIA to an Airbus Helicopters distributorship — the milestones behind EAN Aviation’s regional footprint.",
    path: "/history",
    image: "/images/runway.jpg",
  },
  team: {
    title: "Leadership & Team | EAN Aviation",
    description:
      "The executives, engineers and ground operations leaders running EAN Aviation’s FBO, maintenance and charter services at Murtala Muhammed International Airport.",
    path: "/team",
  },
  services: {
    title:
      "Aviation Services | FBO, Maintenance, Charter & Catering — EAN Aviation",
    description:
      "Six integrated service lines from one Lagos base: FBO ground support, NCAA-approved aircraft maintenance, sales and charter, Wings™ catering, VIP lounge, and leased offices.",
    path: "/services",
    image: "/images/vip-lounge.jpg",
  },
  pricing: {
    title: "FBO Pricing & Instant Quote Calculator | EAN Aviation Lagos",
    description:
      "Build an indicative handling quote for Lagos MMIA or Abuja NAIA — landing, parking, ground support and add-ons priced by aircraft MTOW.",
    path: "/pricing",
  },
  blog: {
    title: "Insights & Industry News | EAN Aviation",
    description:
      "Analysis on business aviation in West Africa — CIQ and international clearance, FBO operations, regulatory change, and why executives choose private aviation.",
    path: "/blog",
    image: "/images/charter-cabin.jpg",
  },
  contact: {
    title: "Contact EAN Aviation | 24/7 Flight Support, Lagos MMIA",
    description: `Reach EAN Aviation’s operations desk at ${LAGOS_HQ.phone} or ${LAGOS_HQ.email}. Based at Murtala Muhammed International Airport, Ikeja, Lagos — 24/7 flight support.`,
    path: "/contact",
    image: "/images/contact-cta.jpg",
  },
  privacyPolicy: {
    title: "Privacy Policy & Data Subject Rights | EAN Aviation",
    description:
      "How EAN Aviation collects, processes and retains personal data under the Nigeria Data Protection Act 2023, and how to exercise your data subject rights.",
    path: "/privacy-policy",
  },
  termsOfUse: {
    title: "Terms of Use | EAN Aviation",
    description:
      "The terms governing use of ean.aero, including intellectual property, acceptable use, liability limitations and dispute resolution.",
    path: "/terms-of-use",
  },
} as const satisfies Record<string, PageSeoInput>;

// =============================================================================
// JSON-LD structured data
// =============================================================================
// Emitted as <script type="application/ld+json">. For a business with a
// physical location this is the highest-leverage remaining SEO surface: it is
// what lets a search engine render an address, phone number and opening hours
// directly in results.
//
// Deliberately omitted:
//   - `foundingDate`. TIMELINE_EVENTS dates the founding to 2009 — and gives
//     2011 to the NCAA AMO approval — while TRUST_STATS publishes "2011 ·
//     Founded in Lagos" on both the homepage and /about. Asserting either in
//     machine-readable form would publish a claim the site itself contradicts.
//     Resolve the copy first, then add it here.
//   - `sameAs`. No social profile URLs exist anywhere in the codebase, and
//     guessing handles would point crawlers at accounts EAN may not control.
//   - `aggregateRating`. There is no review corpus; fabricating one is a
//     structured-data policy violation and can earn a manual penalty.

/** Minimal shape for a JSON-LD document. */
type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "EAN Aviation Limited",
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/EAN-Logo.png`,
    },
    description: SITE_TAGLINE,
    email: LAGOS_HQ.email,
    telephone: LAGOS_HQ.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "EAN Aviation Hangar, Murtala Muhammed International Airport (MMIA)",
      addressLocality: "Ikeja",
      addressRegion: "Lagos",
      addressCountry: "NG",
    },
    areaServed: [
      { "@type": "Country", name: "Nigeria" },
      { "@type": "Place", name: "West Africa" },
    ],
  };
}

/**
 * LocalBusiness is what surfaces the address/hours panel in search results.
 *
 * Emitted as plain `LocalBusiness` on purpose. The narrower aviation types in
 * schema.org describe the airport itself (`Airport`, a `CivicStructure`), not a
 * tenant operating from it — claiming one would assert that this entity *is*
 * MMIA. No subtype covers "FBO / ground handler", so the generic business type
 * is the most specific accurate option, and `parentOrganization` plus the
 * address carry the rest.
 */
export function localBusinessSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: "EAN Aviation — Lagos FBO & Hangar",
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    url: SITE_URL,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    telephone: LAGOS_HQ.phone,
    email: LAGOS_HQ.email,
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "EAN Aviation Hangar, Murtala Muhammed International Airport (MMIA)",
      addressLocality: "Ikeja",
      addressRegion: "Lagos",
      addressCountry: "NG",
    },
    // 24/7, matching LAGOS_HQ.hours.
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
  };
}

/**
 * Breadcrumb trail. Improves how the URL line renders in results and gives
 * crawlers an explicit hierarchy for nested routes like /services/[slug].
 */
export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  slug: string;
  image: string;
  publishedAt: string;
  category: string;
}

export function articleSchema({
  title,
  description,
  slug,
  image,
  publishedAt,
  category,
}: ArticleSchemaInput): JsonLd {
  const absoluteImage = image.startsWith("http")
    ? image
    : `${SITE_URL}${image}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${slug}#article`,
    headline: title,
    description,
    image: absoluteImage,
    articleSection: category,
    // Publisher, not a fabricated personal byline — the live posts are credited
    // to the organisation, not to a named author.
    publisher: { "@id": `${SITE_URL}/#organization` },
    author: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
    ...(publishedAt ? { datePublished: publishedAt } : {}),
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  slug: string;
  image: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: `${SITE_URL}/services/${input.slug}`,
    image: `${SITE_URL}${input.image}`,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "Country", name: "Nigeria" },
      { "@type": "Place", name: "West Africa" },
    ],
  };
}
