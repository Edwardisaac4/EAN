import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OutlineButton from '@/components/shared/OutlineButton';
import SectionReveal from '@/components/shared/SectionReveal';

export default function VIPSection() {
  return (
    <section className="bg-ean-white text-ean-text-light py-20 sm:py-24 transition-colors duration-500 overflow-hidden relative">
      <div className="max-w-ean mx-auto px-6 md:px-8">
        <SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Large Lounge Visual */}
            <div className="lg:col-span-5 relative w-full h-80 sm:h-100 lg:h-125 overflow-hidden border border-ean-border-light group lg:order-1">
              <Image
                src="/images/vip-lounge.jpg"
                alt="EAN Aviation premium airport terminal VIP lounge"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                quality={80}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Right Column: Copy & Highlights */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 lg:order-2">
              <div className="space-y-3">
                <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                  VIP Terminal Experience
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-medium text-ean-text-light leading-[1.15]">
                  {"Lagos Airport's"} Premier Dedicated VIP Terminal
                </h2>
              </div>

              <p className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
                Step away from the bustle of Lagos Murtala Mohammed International Airport. {"EAN's"} VIP Lounge
                offers direct check-in, quiet comfort, and dedicated passenger assistance clear of the
                commercial terminal.
              </p>

              {/* Highlights Bullet List */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-ui text-sm sm:text-base text-ean-text-light font-medium">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-ean-gold" />
                  Private VIP Terminal Access
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-ean-gold" />
                  Wings™ In-Flight Catering
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-ean-gold" />
                  Customs & Immigration Assistance
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-ean-gold" />
                  Secure Tarmac Transfer
                </li>
              </ul>

              <div className="pt-2">
                <Link href="/services/vip-lounge">
                  <OutlineButton
                    variant="light"
                  >
                    Explore VIP Experience
                  </OutlineButton>
                </Link>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
