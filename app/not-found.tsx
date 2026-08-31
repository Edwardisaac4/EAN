import type { Metadata } from 'next';
import Link from 'next/link';
import { Plane, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

/**
 * Previously absent, so a mistyped URL or a retired blog slug rendered Next's
 * unstyled default 404 — no branding, no navigation, and no way back into the
 * funnel.
 */
export const metadata: Metadata = {
  title: 'Page Not Found | EAN Aviation',
  description: 'The page you requested could not be found.',
  // A 404 must never be indexed, or it competes with the real pages.
  robots: { index: false, follow: true },
};

const SUGGESTED_LINKS = [
  { label: 'Our Services', href: '/services', hint: 'FBO, maintenance, charter and catering' },
  { label: 'Get a Quote', href: '/pricing', hint: 'Indicative handling pricing in minutes' },
  { label: 'Insights', href: '/blog', hint: 'Business aviation analysis' },
  { label: 'Contact Operations', href: '/contact', hint: '24/7 flight support desk' },
];

export default function NotFound() {
  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col bg-ean-navy text-ean-text-light">
        <section className="relative flex-1 flex items-center py-24 sm:py-32 overflow-hidden">
          {/* Ambient gold light source, consistent with the CTA sections */}
          <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-ean-gold/10 blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 w-full space-y-10">
            <div className="space-y-6">
              <p className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Error 404
              </p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-ean-text-light leading-[1.1]">
                This route doesn’t exist
              </h1>
              <p className="font-ui text-base sm:text-lg text-ean-muted-light max-w-2xl leading-relaxed">
                The page you requested has moved or never existed. Our operations desk is
                still airborne — pick a destination below, or reach us directly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SUGGESTED_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group border border-ean-border-dark hover:border-ean-gold/40 bg-ean-navy-mid/40 hover:bg-ean-navy-mid/70 p-5 transition-all duration-300 flex items-start gap-4"
                >
                  <Plane className="w-5 h-5 text-ean-gold shrink-0 mt-0.5" />
                  <span className="space-y-1">
                    <span className="block font-ui text-sm font-semibold text-ean-text-light group-hover:text-ean-gold transition-colors">
                      {link.label}
                    </span>
                    <span className="block font-ui text-xs text-ean-muted-light leading-relaxed">
                      {link.hint}
                    </span>
                  </span>
                </Link>
              ))}
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 font-ui text-sm text-ean-gold hover:text-ean-gold-light transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to homepage
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
