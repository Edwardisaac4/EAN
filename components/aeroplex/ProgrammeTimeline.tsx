import React from 'react';
import { CheckCircle2, CircleDashed, HardHat } from 'lucide-react';

import SectionReveal from '@/components/shared/SectionReveal';
import {
  AEROPLEX_MILESTONES,
  AEROPLEX_PROGRAMME_INTRO,
  AEROPLEX_SECTION_IDS,
  type AeroplexMilestone,
} from '@/lib/aeroplex-constants';

/**
 * Per-state treatment. Held as a lookup rather than nested ternaries in the
 * markup so adding a state is one entry, not four edits.
 */
const STATE_STYLES: Record<
  AeroplexMilestone['state'],
  {
    icon: React.ComponentType<{ className?: string }>;
    marker: string;
    period: string;
    card: string;
    label: string;
  }
> = {
  complete: {
    icon: CheckCircle2,
    marker: 'bg-ean-gold text-ean-text-dark border-ean-gold',
    period: 'text-ean-gold',
    card: 'border-ean-gold/40 bg-ean-navy/50',
    label: 'Complete',
  },
  active: {
    icon: HardHat,
    marker: 'bg-ean-gold/15 text-ean-gold border-ean-gold',
    period: 'text-ean-gold',
    card: 'border-ean-gold/30 bg-ean-navy/40',
    label: 'In progress',
  },
  planned: {
    icon: CircleDashed,
    marker: 'bg-ean-navy-mid text-ean-muted-light border-ean-border-dark',
    period: 'text-ean-muted-light',
    card: 'border-ean-border-dark bg-ean-navy/25',
    label: 'Not started',
  },
};

export default function ProgrammeTimeline() {
  return (
    <section
      id={AEROPLEX_SECTION_IDS.programme}
      className="scroll-mt-24 bg-ean-navy-mid text-ean-text-light py-20 sm:py-24 relative overflow-hidden"
    >
      {/* Same ambient gold source the other dark sections use, kept off-centre so
          it reads as light falling across the band rather than a vignette. */}

      <div className="max-w-ean mx-auto px-6 md:px-8 relative z-10">
        <SectionReveal className="max-w-3xl space-y-4 mb-14">
          <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
            {AEROPLEX_PROGRAMME_INTRO.eyebrow}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-light leading-tight">
            {AEROPLEX_PROGRAMME_INTRO.title}
          </h2>
          <p className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
            {AEROPLEX_PROGRAMME_INTRO.standfirst}
          </p>
        </SectionReveal>

        <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
          {/* The rail. Drawn behind the markers on desktop only — stacked
              vertically the cards already read in sequence. */}
          <span
            aria-hidden="true"
            className="hidden md:block absolute top-6 left-0 right-0 h-px bg-linear-to-r from-ean-gold/60 via-ean-gold/25 to-transparent"
          />

          {AEROPLEX_MILESTONES.map((milestone) => {
            const style = STATE_STYLES[milestone.state];
            const Icon = style.icon;

            return (
              <li key={milestone.id} className="relative">
                <SectionReveal className="space-y-5">
                  <div className="flex items-center gap-4">
                    <span
                      className={`relative z-10 w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${style.marker}`}
                    >
                      <Icon className="w-5 h-5" />
                      {/* `motion-safe:` because the reduced-motion block in
                          globals.css only reaches the ean-* utilities, and an
                          indefinite ping is exactly what that setting is for. */}
                      {milestone.state === 'active' && (
                        <span className="absolute inset-0 rounded-full border border-ean-gold opacity-40 motion-safe:animate-ping" />
                      )}
                    </span>
                    <span
                      className={`font-mono text-xs uppercase tracking-[0.25em] ${style.period}`}
                    >
                      {milestone.period}
                    </span>
                  </div>

                  <div className={` border p-6 space-y-3 h-full ${style.card}`}>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-ui text-lg font-semibold text-ean-text-light">
                        {milestone.title}
                      </h3>
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ean-muted-light border border-ean-border-dark rounded-full px-2 py-0.5 shrink-0">
                        {style.label}
                      </span>
                    </div>
                    <p className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </SectionReveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
