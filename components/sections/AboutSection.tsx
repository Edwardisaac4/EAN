import React from 'react';
import ImageBlock from '@/components/shared/ImageBlock';
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
            <div className="lg:col-span-6 space-y-6 sm:space-y-8">
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

            {/*
              Right Column: the photograph is a 16:9 panorama, so a portrait box
              cropped away half its width — the tail, both engines and the ground
              crew — and filled the rest of the frame with flat overcast sky.
              (object-position could not rescue it: the image is wider than any
              portrait box, so the height fills exactly and the vertical value has
              no slack to move.) The frame now follows the photograph instead, and
              the columns split evenly to carry it.
            */}
            <div data-reveal className="lg:col-span-6">
              <ImageBlock
                src="/images/about-us.jpg"
                alt="EAN Aviation ground crew towing a Dassault Falcon on the ramp at Murtala Muhammed International Airport, Lagos"
                ratio="16 / 10"
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="border border-ean-border-light"
              />
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
