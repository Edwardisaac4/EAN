import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Script from "next/script";
import PublicShell from "@/components/layout/PublicShell";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://ean.aero"),
  title: "EAN Aviation",
  description: "EAN Aviation is West Africa's most comprehensive aviation services provider.",
  icons: {
    icon: "/images/ean icon.png",
    shortcut: "/images/ean icon.png",
    apple: "/images/ean icon.png",
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
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-ean-navy text-white font-ui select-none">
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
            <Script
              id="ga-src"
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script id="ga-init" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
