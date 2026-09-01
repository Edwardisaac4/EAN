'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plane,
  Wrench,
  BadgeCheck,
  UtensilsCrossed,
  Star,
  Building2,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

import type { ServiceRichData } from '@/lib/constants';
import SectionReveal from '@/components/shared/SectionReveal';

const iconMap = {
  Plane,
  Wrench,
  BadgeCheck,
  UtensilsCrossed,
  Star,
  Building2,
} as const;

export type ServiceRowGround = 'paper' | 'recessed' | 'blue';

/*
 * Three grounds, one row template.
 *
 * This replaces the bento grid's `bentoConfigs` map, which keyed three
 * near-duplicate 120-line card bodies off the service slug — so a seventh
 * service meant editing a lookup table before it would render. Here the row is
 * one component and the only thing that varies is which of the three surfaces
 * in spec §9.2 it sits on. The page picks that by index, not by slug.
 *
 * `bg-ean-white` rather than `bg-ean-black` for the paper step. Both resolve to
 * #ffffff and the codebase leans on the latter, but the surface names are four
 * swaps stale (see the @theme note in globals.css) and `ean-white` is the one
 * that does not read as its own opposite. Nothing behaves differently.
 *
 * The blue ground is the part with no precedent on the public site — §9.2 says
 * the accent is a dark *surface* and is the only value in the palette that can
 * carry the section rhythm the ink bands used to, but until now it has only
 * ever been a link and a button colour. Type on it is the on-accent pair:
 * white 13.50:1, `ean-muted-dark` 8.33:1, both AAA.
 *
 * Its 1px rule is a literal `white/25` and not a token. That is the same
 * exception AGENTS.md already grants type over photography — `ean-border-dark`
 * is the brand grey at 45%, which was tinted for a rule on paper and goes muddy
 * against #2b0098. A rule inside the blue fill is a fourth ground the border
 * tokens were never cut for; naming a token for two call sites was not worth it.
 */
const GROUND: Record<
  ServiceRowGround,
  {
    section: string;
    rule: string;
    eyebrow: string;
    heading: string;
    body: string;
    check: string;
    iconBox: string;
    chip: string;
    primary: string;
    secondary: string;
    frame: string;
  }
> = {
  paper: {
    section: 'bg-ean-white',
    rule: 'border-ean-border-light',
    eyebrow: 'text-ean-gold',
    heading: 'text-ean-text-light group-hover/title:text-ean-gold',
    body: 'text-ean-muted-light',
    check: 'text-ean-gold',
    iconBox: 'border-ean-border-light text-ean-gold',
    chip: 'border-ean-gold/25 bg-ean-gold-muted text-ean-gold',
    primary:
      'bg-ean-gold border-ean-gold text-ean-text-dark hover:bg-ean-gold-light hover:border-ean-gold-light',
    secondary:
      'border-ean-gold text-ean-gold hover:bg-ean-gold hover:text-ean-text-dark',
    frame: 'border-ean-border-light',
  },
  recessed: {
    section: 'bg-ean-surface',
    rule: 'border-ean-border-dark',
    eyebrow: 'text-ean-gold',
    heading: 'text-ean-text-light group-hover/title:text-ean-gold',
    body: 'text-ean-muted-light',
    check: 'text-ean-gold',
    iconBox: 'border-ean-border-dark text-ean-gold',
    chip: 'border-ean-gold/25 bg-ean-gold-muted text-ean-gold',
    primary:
      'bg-ean-gold border-ean-gold text-ean-text-dark hover:bg-ean-gold-light hover:border-ean-gold-light',
    secondary:
      'border-ean-gold text-ean-gold hover:bg-ean-gold hover:text-ean-text-dark',
    frame: 'border-ean-border-dark',
  },
  blue: {
    section: 'bg-ean-gold',
    rule: 'border-white/25',
    eyebrow: 'text-ean-muted-dark',
    heading: 'text-ean-text-dark group-hover/title:text-ean-muted-dark',
    body: 'text-ean-muted-dark',
    check: 'text-ean-muted-dark',
    iconBox: 'border-white/30 text-ean-text-dark',
    chip: 'border-white/25 bg-white/10 text-ean-text-dark',
    primary:
      'bg-ean-white border-ean-white text-ean-gold hover:bg-ean-muted-dark hover:border-ean-muted-dark',
    secondary:
      'border-white/50 text-ean-text-dark hover:bg-ean-white hover:text-ean-gold hover:border-ean-white',
    frame: 'border-white/25',
  },
};

/*
 * Matches GoldButton / OutlineButton exactly. Those two components cannot be
 * used here: both draw in `ean-gold`, which is the blue row's own background,
 * so on that ground they render as an invisible button. The geometry is lifted
 * verbatim so the three grounds stay one control, not two.
 */
const BUTTON_BASE =
  'font-ui font-semibold text-[12.5px] uppercase tracking-[0.08em] px-7 py-3.5 transition-colors duration-300 inline-flex items-center justify-center gap-2 rounded-none border cursor-pointer';

interface ServiceFeatureRowProps {
  service: ServiceRichData;
  ground: ServiceRowGround;
  /** Image sits left on even rows, right on odd ones. */
  imageRight: boolean;
}

export default function ServiceFeatureRow({
  service,
  ground,
  imageRight,
}: ServiceFeatureRowProps) {
  const Icon = iconMap[service.iconName];
  const g = GROUND[ground];

  const detailHref = `/services/${service.slug}`;
  const secondaryText = service.secondaryButtonText ?? 'View Details';
  const secondaryHref = service.secondaryButtonHref ?? detailHref;

  return (
    <section
      id={service.slug}
      className={`${g.section} scroll-mt-28 border-b ${g.rule}`}
    >
      <div className="max-w-ean mx-auto px-6 md:px-8 py-16 sm:py-20 lg:py-24">
        <SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/*
             * The photograph, at full saturation and with nothing laid over it.
             *
             * Every image on this page used to sit under a gradient written
             * against the old ink ramp — `from-ean-obsidian/75 via-ean-obsidian/90`
             * and friends. Those tokens are #ffffff now, so what was a scrim
             * darkening a photo had become a 90% white wash bleaching it. The
             * row does not need a scrim at all: nothing is set over the image,
             * so there is no type to protect. AGENTS.md's `bg-black/70` rule is
             * for a photo band carrying white type, which this is not.
             */}
            <div className={`lg:col-span-5 ${imageRight ? 'lg:order-2' : 'lg:order-1'}`}>
              <div className={`relative aspect-4/3 overflow-hidden border ${g.frame}`}>
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                  quality={80}
                />
              </div>
            </div>

            <div
              className={`lg:col-span-7 ${imageRight ? 'lg:order-1' : 'lg:order-2'} space-y-6`}
            >
              <div className="flex items-center gap-4">
                <span className={`p-3 border ${g.iconBox} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </span>
                {service.eyebrow && (
                  <span
                    className={`font-mono text-[11px] font-semibold tracking-[0.2em] uppercase ${g.eyebrow}`}
                  >
                    {service.eyebrow}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <Link href={detailHref} className="block group/title">
                  <h2
                    className={`font-display text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide leading-tight transition-colors duration-300 ${g.heading}`}
                  >
                    {service.name}
                  </h2>
                </Link>
                <p className={`font-ui text-base sm:text-lg leading-relaxed ${g.body}`}>
                  {service.extendedDescription || service.short}
                </p>
              </div>

              {service.stats && service.stats.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {service.stats.map((stat) => (
                    <span
                      key={stat}
                      className={`font-ui text-[11px] font-medium px-2.5 py-1 border ${g.chip}`}
                    >
                      {stat}
                    </span>
                  ))}
                </div>
              )}

              {/*
               * The four features are set in full. The bento grid `truncate`d
               * them inside its narrow cells, so "Direct airside terminal
               * customs clearance" reached the visitor as "Direct airside
               * termin…". A full-width row has the measure for all four.
               */}
              <ul
                className={`grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 border-t ${g.rule} pt-6 font-ui text-sm ${g.body}`}
              >
                {service.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 items-start">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${g.check}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <Link
                  href={service.primaryButtonHref ?? `/contact?service=${service.slug}`}
                  className={`${BUTTON_BASE} ${g.primary}`}
                >
                  {service.primaryButtonText ?? 'Make an Inquiry'}
                </Link>
                <Link
                  href={secondaryHref}
                  className={`${BUTTON_BASE} ${g.secondary} group/cta`}
                >
                  <span>{secondaryText}</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
