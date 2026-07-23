import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OutlineButton from '@/components/shared/OutlineButton';
import SectionReveal from '@/components/shared/SectionReveal';

export default function AboutSection() {
  return (
    <section className="bg-ean-white dark:bg-ean-navy-mid text-ean-text-dark dark:text-ean-text-light py-20 sm:py-24 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Text Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <div className="space-y-3">
                <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                  Who We Are
                </span>
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium text-ean-navy dark:text-white leading-[1.15]">
                  Pioneering Business Aviation in West Africa
                </h2>
              </div>

              <div className="space-y-4 font-ui text-base sm:text-lg text-ean-muted-dark dark:text-ean-muted-light leading-relaxed max-w-2xl">
                <p>
                  Established over a decade ago, EAN Aviation has grown to become {"West Africa's "} 
                  premier comprehensive business aviation conglomerate. We operate the {"region's "}
                  first fully integrated Fixed Base Operator (FBO) hangar at Murtala Mohammed
                  International Airport in Lagos, Nigeria.
                </p>
                <p>
                  With dedicated team of professionals, we are
                  committed to safety, quality, and exclusivity. We cater to high-net-worth individuals,
                  corporate executives, and international operators, delivering an unparalleled
                  standard of service.
                </p>
              </div>

              <div className="pt-2">
                <Link href="/about">
                  <OutlineButton
                    variant="light"
                    className="dark:border-white dark:text-white dark:hover:bg-ean-gold dark:hover:border-ean-gold dark:hover:text-ean-navy"
                  >
                    Our Credentials & History
                  </OutlineButton>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Hangar / Jet Image */}
            <div className="lg:col-span-5 relative w-full h-80 sm:h-100 lg:h-125 rounded-xs overflow-hidden shadow-xl border border-ean-border-light dark:border-ean-border-dark group">
              <Image
                src="/images/about-jet.png"
                alt="EAN Aviation premium private jet on tarmac at sunset"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                quality={90}
              />
              {/* Subtle luxury glow overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
