import React from 'react';
import Image from 'next/image';

import Navbar from '@/components/layout/Navbar';
import Eyebrow from '@/components/shared/Eyebrow';
import CharterRequestForm from '@/components/charter/CharterRequestForm';

/**
 * /charter — the destination four CTAs across the site have pointed at since
 * before it existed (C32/C68).
 *
 * A Server Component on purpose. Only the form needs to be interactive, so the
 * page itself prerenders and the hero image is in the HTML rather than behind
 * the client bundle — the rule in AGENTS.md §8 about content painting without
 * JavaScript. That is also why there is no GSAP entrance here: this page has one
 * job, and gating its heading on a tween would be a cost with no return.
 *
 * Metadata and the breadcrumb schema live in the sibling `layout.tsx`.
 */
export default function CharterPage() {
  return (
    <>
      <Navbar hasPhotoHero />

      <main className="flex-1 flex flex-col bg-ean-black text-ean-text-light">
        {/* `.pagehero` — the prototype's shorter hero: image, scrim, three lines. */}
        <section className="relative min-h-100 flex items-end overflow-hidden bg-ean-black">
          <Image
            src="/images/charter-cabin.jpg"
            alt="Cabin interior of a private jet on charter with EAN Aviation"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/*
           * Deepened at the base so the heading stays legible over whichever
           * photograph replaces this one — the prototype's own note on its hero
           * scrim, and the reason the gradient is not a flat overlay.
           */}
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/70 to-black/70" />

          <div className="relative z-10 w-full max-w-ean mx-auto px-6.5 pt-32 pb-14">
            {/*
             * White at the call site, not the inherited token. `text-ean-text-light`
             * is INK under the v8 paper ramp — correct on a white section, invisible
             * on this photograph. Every other full-bleed hero on the site (/about,
             * /history, /team, /contact, /services/[slug]) already sets white here;
             * this one was missed in the conversion. The eyebrow goes with it: the
             * shared component is brand blue, which is 1.3:1 on the scrim.
             */}
            <Eyebrow as="p" className="text-white/70">
              Charter request
            </Eyebrow>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-[52px] text-white">
              Request a charter.
            </h1>
            {/*
             * No response time. The build's FAQ published 4–6 hours domestic and
             * 24–48 international, and the CAA permit desk runs 0800–1500Z on
             * weekdays — C50 holds every timing claim until Operations confirms
             * it. A service level we miss is an integrity breach in writing.
             */}
            <p className="mt-5 max-w-[56ch] font-ui text-base sm:text-[17px] font-light text-white/70 leading-relaxed">
              Tell us the route and the date. Our charter desk responds with aircraft options and
              an all-in price.
            </p>
          </div>
        </section>

        <section className="border-t border-ean-border-dark py-16 sm:py-20">
          <div className="max-w-ean mx-auto px-6.5">
            <CharterRequestForm />
          </div>
        </section>
      </main>
    </>
  );
}
