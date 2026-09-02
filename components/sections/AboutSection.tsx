import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OutlineButton from '@/components/shared/OutlineButton';
import SectionReveal from '@/components/shared/SectionReveal';

// One hover treatment for the whole row. The Credentials button used to fall
// through to OutlineButton's navy fill while History overrode it to gold, so the
// two buttons sitting side by side behaved differently on the same hover.
const LINK_HOVER =
  'hover:bg-ean-gold hover:border-ean-gold hover:text-ean-text-dark';

const SECTION_LINKS = [
  { label: 'Our Credentials', href: '/about' },
  { label: 'Our History', href: '/history' },
  { label: 'Our Team', href: '/team' },
];

export default function AboutSection() {
  return (
    <section className="bg-ean-white text-ean-text-light py-20 sm:py-24 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-ean mx-auto px-6 md:px-8">
        {/*
          Editorial pacing: further and slower than a card grid, because the eye
          is being asked to start reading rather than to scan a set. The grid
          itself is not marked — only the four blocks inside it — so the columns
          hold their position and nothing reflows as the copy arrives.
        */}
        <SectionReveal stagger={0.12} distance={40} duration={1}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Text Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <div data-reveal className="space-y-3">
                <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                  Who We Are
                </span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-ean-text-light leading-[1.15]">
                  Pioneering Business Aviation in West Africa
                </h2>
              </div>

              <div data-reveal className="space-y-4 font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed max-w-2xl">
                <p>
                  Founded in Lagos in 2011, EAN Aviation is {"West Africa's "}
                  leading integrated business aviation company. We operate the {"region's "}
                  first fully integrated Fixed Base Operator hangar at Murtala Muhammed
                  International Airport, Lagos.
                </p>
                <p>
                  With a dedicated team of professionals, we are committed to safety,
                  quality and precision. We serve principals, flight departments and
                  international operators, and we are known by the standard we keep: the
                  EAN Way.
                </p>
              </div>

              <div data-reveal className="pt-2 flex flex-wrap items-center gap-4">
                {SECTION_LINKS.map(({ label, href }) => (
                  <Link key={href} href={href}>
                    <OutlineButton variant="light" className={LINK_HOVER}>
                      {label}
                    </OutlineButton>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column: Visual Hangar / Jet Image */}
            <div data-reveal className="lg:col-span-5 relative w-full h-80 sm:h-100 lg:h-125 overflow-hidden border border-ean-border-light group">
              {/* about-jet.jpg rather than hero/slide-1.jpg: the hero above already
                  opens on slide-1, and it is also DEFAULT_OG_IMAGE, so reusing it
                  here left one photograph carrying the entire homepage. */}
              <Image
                src="/images/about-jet.jpg"
                alt="Passengers boarding a Bombardier business jet on the EAN Aviation ramp at sunset"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                quality={80}
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
