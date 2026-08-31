'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Last-resort boundary for a failure in the root layout itself — a font load
 * throwing, a bad env var read during render. Because the root layout is what
 * broke, this file has to supply its own <html> and <body>.
 *
 * That also means none of the app's CSS is guaranteed to be available, so the
 * styling here is inline rather than Tailwind. The palette values are copied
 * from the ean-navy / ean-gold tokens deliberately: importing globals.css from a
 * boundary that exists because the layout failed would risk failing the same way.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error boundary caught:', error.message, error.digest);
  }, [error]);

  return (
    <html lang="en-NG">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0e1214',
          color: '#f5f2ea',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <p
            style={{
              margin: '0 0 1rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#a9895a',
            }}
          >
            Service Interruption
          </p>

          <h1
            style={{
              margin: '0 0 1rem',
              fontSize: '2rem',
              fontWeight: 300,
              lineHeight: 1.2,
            }}
          >
            EAN Aviation is temporarily unavailable
          </h1>

          <p
            style={{
              margin: '0 0 2rem',
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'rgba(245,242,234,0.72)',
            }}
          >
            We hit an unexpected fault while loading the site. Our 24/7 operations desk
            is still reachable on{' '}
            <a href="tel:+2348050333410" style={{ color: '#a9895a' }}>
              +234 (0) 805 033 3410
            </a>
            .
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              backgroundColor: '#a9895a',
              color: '#0e1214',
              border: 'none',
              padding: '0.875rem 1.75rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              borderRadius: '2px',
            }}
          >
            Reload the site
          </button>

          {error.digest && (
            <p
              style={{
                margin: '2rem 0 0',
                fontSize: '0.625rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgba(245,242,234,0.4)',
              }}
            >
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
