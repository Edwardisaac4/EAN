import Navbar from '@/components/layout/Navbar';
import JsonLd from '@/components/shared/JsonLd';
import ProgrammeBand from '@/components/future/ProgrammeBand';
import { FUTURE_PROGRAMMES } from '@/lib/future-constants';
import { breadcrumbSchema } from '@/lib/seo';

/**
 * /airborne — the ten programmes, as a run of full-bleed photo bands.
 *
 * Built the way the homepage runs Services → VIP → Charter: each programme is
 * one parallax photograph carrying a single statement, and the bands sit flush
 * against each other with no gutter, so the page scrolls as one continuous
 * sequence rather than a grid of cards.
 *
 * A Server Component. Each band is its own client island for the parallax, so
 * every image and every line of copy is still in the server-rendered HTML.
 */
export default function TheFuturePage() {
  return (
    <>
      {/* The first band runs up under the bar, so it takes the photo palette. */}
      <Navbar hasPhotoHero />

      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Airborne', path: '/airborne' },
        ])}
      />

      <main className="flex-1 flex flex-col">
        {FUTURE_PROGRAMMES.map((programme, index) => (
          <ProgrammeBand
            key={programme.number}
            programme={programme}
            // Only the first band is above the fold. Every other image stays lazy.
            priority={index === 0}
          />
        ))}
      </main>
    </>
  );
}
