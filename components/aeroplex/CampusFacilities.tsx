import React from 'react';
import {
  Fuel,
  Landmark,
  Package,
  Sofa,
  UtensilsCrossed,
  Warehouse,
  Wrench,
} from 'lucide-react';

import SectionReveal from '@/components/shared/SectionReveal';
import {
  AEROPLEX_FACILITIES,
  AEROPLEX_FACILITIES_INTRO,
  type AeroplexIconName,
} from '@/lib/aeroplex-constants';

/** Only the icons the facilities data can name — see AeroplexFacility.iconName. */
const facilityIcons: Partial<
  Record<AeroplexIconName, React.ComponentType<{ className?: string }>>
> = {
  Warehouse,
  Landmark,
  Wrench,
  Fuel,
  UtensilsCrossed,
  Sofa,
  Package,
};

export default function CampusFacilities() {
  return (
    <section className="bg-ean-surface text-ean-text-light py-20 sm:py-24 border-y border-ean-border-light/70">
      <div className="max-w-ean mx-auto px-6 md:px-8">
        <SectionReveal className="max-w-3xl space-y-4 mb-14">
          <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
            {AEROPLEX_FACILITIES_INTRO.eyebrow}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-ean-text-light leading-tight">
            {AEROPLEX_FACILITIES_INTRO.title}
          </h2>
          <p className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
            {AEROPLEX_FACILITIES_INTRO.standfirst}
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {AEROPLEX_FACILITIES.map((facility, index) => {
            const Icon = facilityIcons[facility.iconName];
            return (
              <SectionReveal key={facility.id}>
                <article className="group relative h-full bg-ean-white border border-ean-border-light/70 p-7 sm:p-8 shadow-xs hover:shadow-lg hover:border-ean-blue/60 hover:-translate-y-1.5 transition-[border-color,transform,box-shadow] duration-300 ease-out flex flex-col gap-5">
                  {/* Index in mono, top-right — the programme is a numbered set of
                      elements, not a ranked list of features. */}
                  <span className="absolute top-6 right-7 font-mono text-[10px] tracking-[0.2em] text-ean-muted-light/50">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="w-12 h-12 bg-black/5 border border-black/10 text-ean-text-light flex items-center justify-center group-hover:bg-ean-blue-muted/30 group-hover:border-ean-blue/40 group-hover:text-ean-blue transition-colors duration-300">
                    {Icon && <Icon className="w-5 h-5" />}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-ui text-lg font-semibold text-ean-text-light tracking-wide">
                      {facility.name}
                    </h3>
                    <p className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                      {facility.description}
                    </p>
                  </div>
                </article>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
