import React from 'react';
import Image from 'next/image';

import Navbar from '@/components/layout/Navbar';
import Eyebrow from '@/components/shared/Eyebrow';
import SalesLeasingEnquiry from '@/components/sales-leasing/SalesLeasingEnquiry';
import { SERVICES_DATA } from '@/lib/constants';

/**
 * /find-aircraft — the Aircraft Sales & Leasing enquiry, one question per
 * screen. Its own page rather than a section of the service page, so the
 * questions get the whole of a phone screen and the brochure's QR code can land
 * on the first one directly.
 *
 * A Server Component, like /charter: only the enquiry is interactive, so the
 * header and the first question are in the prerendered HTML.
 *
 * The header is deliberately shorter than /charter's 400px. On a 1280×720
 * laptop at 150% (about 620px of window) a taller one would push the first
 * question's answers below the fold, and answering is the whole point here.
 *
 * Metadata and the breadcrumb schema live in the sibling `layout.tsx`.
 */
export default function FindAircraftPage() {
  // Named from the services record, like the breadcrumb in layout.tsx, so the
  // eyebrow and the thank-you screen's link back stay in step with the service page.
  const service = SERVICES_DATA.find((s) => s.slug === 'aircraft-sales-leasing');
  if (!service) throw new Error('find-aircraft: no aircraft-sales-leasing entry in SERVICES_DATA');

  return (
    <>
      <Navbar hasPhotoHero />

      <main className="flex-1 flex flex-col bg-ean-black text-ean-text-light">
        <section className="relative overflow-hidden bg-ean-black">
          <Image
            src="/images/tarmac-soft-web.jpg"
            alt="A business jet on the apron, seen from the hangar past a helicopter and a turboprop"
            fill
            priority
            quality={70}
            sizes="100vw"
            className="object-cover"
          />
          {/* Deepened at the base, as on /charter, so the heading holds over any photograph. */}
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/70 to-black/70" />

          <div className="relative z-10 w-full max-w-ean mx-auto px-6.5 pt-28 pb-8 sm:pt-30 sm:pb-9">
            {/* White at the call site: the shared Eyebrow is brand blue, unreadable on the scrim. */}
            <Eyebrow as="p" className="text-white/70">
              {service.name}
            </Eyebrow>
            {/* One line from a laptop up, so the header stays short (see above). */}
            <h1 className="mt-3.5 max-w-[22ch] lg:max-w-none font-display text-[34px] sm:text-[42px] lg:text-[44px] leading-[1.1] text-white">
              Tell us your mission. We&rsquo;ll find the aircraft.
            </h1>
            <p className="mt-3.5 max-w-[62ch] font-ui text-base sm:text-[17px] font-light text-white/70 leading-relaxed">
              A few quick questions, most of them a single tap. Our sales and leasing team uses
              your answers to come back with aircraft and terms that fit.
            </p>
          </div>
        </section>

        <section className="border-t border-ean-border-dark pt-8 pb-14 sm:pt-10 sm:pb-16">
          <div className="max-w-190 mx-auto px-6.5">
            {/* Only the two fields it needs, not the whole record, into the client bundle. */}
            <SalesLeasingEnquiry service={{ slug: service.slug, name: service.name }} />
          </div>
        </section>
      </main>
    </>
  );
}
