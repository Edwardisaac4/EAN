import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Script from "next/script";
import PublicShell from "@/components/layout/PublicShell";
import JsonLd from "@/components/shared/JsonLd";
import {
  SITE_NAME,
  SITE_URL,
  buildMetadata,
  localBusinessSchema,
  organizationSchema,
  PAGE_SEO,
} from "@/lib/seo";
import "./globals.css";

// Cormorant Garamond exposes a variable wght axis (300–700). Requesting the
// variable face serves one woff2 covering every weight the design uses instead
// of five separate static files.
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Site-wide defaults. Individual routes override title/description/canonical via
 * their own metadata; what matters here is that the Open Graph and Twitter
 * blocks exist at all — previously nothing outside /blog/[slug] had them, so
 * every share of a service or pricing page rendered as a bare URL.
 *
 * The explicit `icons` block is gone: app/icon.png and app/favicon.ico are
 * picked up by Next's file convention automatically, and the old entry pointed
 * at "/images/ean icon.png", whose space had to survive URL encoding on every
 * platform that fetched it.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata(PAGE_SEO.home),
  title: {
    default: PAGE_SEO.home.title,
    // Child routes supply their own full title, so the template only applies to
    // pages that set a bare string.
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  authors: [{ name: "EAN Aviation Limited", url: SITE_URL }],
  creator: "EAN Aviation Limited",
  publisher: "EAN Aviation Limited",
  formatDetection: {
    // The footer prints a phone number and address; letting mobile Safari
    // restyle them breaks the type treatment.
    telephone: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html
      lang="en-NG"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      {/*
        `select-none` used to sit on <body>, which made every word on the site
        unselectable — including the phone number and email address in the
        footer. On a lead-generation site that actively blocked the visitor from
        copying the contact details. It is now applied only to the specific
        decorative elements that need it.
      */}
      <body className="min-h-full flex flex-col bg-ean-navy text-white font-ui">
        {/*
          Emitted site-wide so every page carries the entity graph. The @id
          values let per-page schemas reference this one organisation instead of
          redeclaring it.
        */}
        <JsonLd schema={[organizationSchema(), localBusinessSchema()]} />

        <PublicShell>
          {children}
        </PublicShell>
        {/*
          Hand-rolled rather than <GoogleAnalytics> from @next/third-parties:
          that component hardcodes the `afterInteractive` strategy, which
          preloads ~90KB of gtag.js in the <head> and has it competing with the
          LCP image. `lazyOnload` holds it until after the window load event.
        */}
        {gaId && (
          <>
            {/*
              Init before src, deliberately. Both are `lazyOnload`, and next/script
              injects them in render order — so declaring the queue first guarantees
              `window.dataLayer` and `gtag` exist before gtag.js evaluates, rather
              than relying on gtag.js to drain a queue it may find missing.

              An onLoad callback would express the dependency more directly, but
              this layout is a Server Component and cannot pass an event handler to
              next/script. Ordering achieves the same guarantee without making the
              root layout a client component.

              googletagmanager.com is already allowed by `script-src` in
              next.config.ts, and 'unsafe-inline' there covers this inline block.
            */}
            <Script id="ga-init" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
            <Script
              id="ga-src"
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
          </>
        )}
      </body>
    </html>
  );
}
