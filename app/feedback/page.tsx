import React from 'react';
import Image from 'next/image';

import Navbar from '@/components/layout/Navbar';
import Eyebrow from '@/components/shared/Eyebrow';
import FeedbackForm from '@/components/feedback/FeedbackForm';

/**
 * /feedback — compliments, suggestions and complaints from customers.
 *
 * Built the way /charter is: a Server Component, so the page prerenders and
 * only the form ships as client code, with no GSAP entrance gating the heading.
 *
 * Metadata and the breadcrumb schema live in the sibling `layout.tsx`.
 */
export default function FeedbackPage() {
  return (
    <>
      <Navbar hasPhotoHero />

      <main className="flex-1 flex flex-col bg-ean-black text-ean-text-light">
        <section className="relative min-h-100 flex items-end overflow-hidden bg-ean-black">
          <Image
            src="/images/vip-lounge.jpg"
            alt="The EAN Aviation VIP lounge at Murtala Muhammed International Airport, Lagos"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/70 to-black/70" />

          <div className="relative z-10 w-full max-w-ean mx-auto px-6.5 pt-32 pb-14">
            {/* White, not the inherited tokens — see the note on /charter's hero. */}
            <Eyebrow as="p" className="text-white/70">
              Customer feedback
            </Eyebrow>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-[52px] text-white">
              Share your feedback.
            </h1>
            <p className="mt-5 max-w-[56ch] font-ui text-base sm:text-[17px] font-light text-white/70 leading-relaxed">
              Compliments, suggestions and complaints from clients and operators go directly to
              the teams responsible for the service.
            </p>
          </div>
        </section>

        <section className="border-t border-ean-border-dark py-16 sm:py-20">
          <div className="max-w-ean mx-auto px-6.5">
            <FeedbackForm />
          </div>
        </section>
      </main>
    </>
  );
}
