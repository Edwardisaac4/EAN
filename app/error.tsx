'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Phone } from 'lucide-react';
import { LAGOS_HQ } from '@/lib/constants';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level error boundary. Without this file, any thrown render error — a
 * Supabase outage during a blog fetch, a malformed row — showed Next's default
 * error screen with no branding and no recovery path.
 *
 * Must be a client component: `reset` is a callback that re-renders the segment.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // console.error survives the production build (next.config.ts keeps `error`
    // and `warn`), so this is what reaches Vercel's function logs. `digest` is
    // the only handle correlating a user report to a specific server stack.
    console.error('Route error boundary caught:', error.message, error.digest);
  }, [error]);

  return (
    <main className="flex-1 flex items-center bg-ean-navy text-white">
      <section className="relative w-full py-24 sm:py-32 overflow-hidden">
        <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-ean-gold/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8 space-y-8">
          <div className="w-12 h-12 rounded-xs bg-ean-gold/10 border border-ean-gold/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-ean-gold" />
          </div>

          <div className="space-y-5">
            <p className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
              Unexpected Error
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-light text-white leading-tight">
              Something went wrong on our side
            </h1>
            <p className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
              This is a fault in our system, not in anything you did. Our team has been
              notified. You can retry, or reach our operations desk directly — it is
              staffed 24/7.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              type="button"
              onClick={reset}
              className="bg-ean-gold text-ean-navy font-ui font-semibold text-sm px-7 py-3.5 tracking-wider hover:bg-ean-gold-light transition-all duration-300 inline-flex items-center justify-center gap-2 rounded-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Try again
            </button>

            <a
              href={`tel:${LAGOS_HQ.phone.replace(/[^\d+]/g, '')}`}
              className="border border-white/20 hover:border-ean-gold/50 text-white font-ui font-semibold text-sm px-7 py-3.5 tracking-wider transition-all duration-300 inline-flex items-center justify-center gap-2 rounded-xs"
            >
              <Phone className="w-4 h-4 text-ean-gold" />
              {LAGOS_HQ.phone}
            </a>
          </div>

          <Link
            href="/"
            className="inline-block font-ui text-sm text-ean-gold hover:text-ean-gold-light transition-colors"
          >
            Return to homepage
          </Link>

          {/*
            Surfaced because it is the only stable identifier a visitor can quote
            back to support. The message itself is deliberately not rendered —
            it can carry internal detail.
          */}
          {error.digest && (
            <p className="font-ui text-[10px] uppercase tracking-widest text-ean-muted-light/60 pt-4 border-t border-white/10">
              Reference: {error.digest}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
