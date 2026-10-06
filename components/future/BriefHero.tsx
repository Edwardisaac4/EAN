import Image from 'next/image';
import DsReveal from '@/components/future/DsReveal';
import BriefSources from '@/components/future/BriefSources';
import CinematicHero from '@/components/future/CinematicHero';
import { BRIEF_H4, BRIEF_HAIRLINE_GRID, BRIEF_WRAP } from '@/components/future/brief-styles';
import type { FutureProgramme } from '@/lib/future-constants';

/**
 * The brief's masthead: the photograph with the title on its bottom edge, the
 * four figures in a hairline strip riding 56px up into it, and the three claims
 * under that.
 *
 * The scrim is black, darkening to 96% at the foot so the title reads over any
 * photograph. Below 560px the brief drops the strip's overlap, and so does this.
 *
 * `cinematic` swaps the header for CinematicHero — the same photograph and
 * copy, with a masked headline entrance and a scrubbed exit. The strip and the
 * claims below keep their DsReveal either way.
 */
export default function BriefHero({ programme, cinematic = false }: { programme: FutureProgramme; cinematic?: boolean }) {
  const { title, eyebrow, headline, lede, heroStats, heroSources, chips, hero, sections } = programme;

  const firstSection = sections[0]?.id;

  const headerClass =
    'relative flex min-h-[560px] items-end overflow-hidden bg-ds-afterburn min-[561px]:min-h-[640px]';
  const wrapClass = `${BRIEF_WRAP} relative pt-24 pb-14 min-[561px]:pt-[120px] min-[561px]:pb-[72px]`;

  const media = (
    <>
      <Image
        src={hero.image}
        alt={hero.alt}
        fill
        sizes="100vw"
        priority
        style={hero.imagePosition ? { objectPosition: hero.imagePosition } : undefined}
        className="object-cover"
      />

      {/* The brief's three stops, in neutral black rather than a tinted ramp. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.62) 55%, rgba(0,0,0,0.96) 100%)',
        }}
      />
    </>
  );

  // The data- attributes are CinematicHero's hooks; without it they do nothing.
  const copy = (
    <>
      <div
        data-rise
        className="mb-[26px] border-l-2 border-ds-aurum pl-3.5 font-ds-display text-[14px] leading-[1.5] font-semibold tracking-[0.08em] text-ds-aurum uppercase"
      >
        {eyebrow}
        <b className={`${BRIEF_H4} block normal-case`}>{title}</b>
      </div>

      <h1
        data-mask-lines
        className="mb-[22px] max-w-[28ch] font-ds-display text-[36px] leading-[1.1] font-bold tracking-[-0.02em] text-balance text-ds-skyway min-[561px]:text-[48px]"
      >
        {headline}
      </h1>

      <p data-rise className="mb-[34px] max-w-[64ch] font-ds-body text-[20px] leading-[1.5] text-pretty text-ds-skyway/90">
        {lede}
      </p>

      {firstSection && (
        <a
          data-rise
          href={`#${firstSection}`}
          className="inline-flex items-center gap-2.5 rounded-full border border-ds-skyway/55 px-[26px] py-3 font-ds-body text-[15px] font-semibold text-ds-skyway transition-colors duration-200 hover:bg-ds-skyway hover:text-ds-blue-deep"
        >
          Read the brief &darr;
        </a>
      )}
    </>
  );

  return (
    <>
      {cinematic ? (
        <CinematicHero id="top" className={headerClass} media={media}>
          <div className={wrapClass}>{copy}</div>
        </CinematicHero>
      ) : (
        <header id="top" className={headerClass}>
          {media}
          <div className={wrapClass}>
            <DsReveal>{copy}</DsReveal>
          </div>
        </header>
      )}

      {/* `z-10` is required: without it the scrim paints over the overlap. */}
      <div className={`${BRIEF_WRAP} relative z-10 min-[561px]:-mt-14`}>
        <DsReveal
          stagger
          grid
          className={`${BRIEF_HAIRLINE_GRID} grid-cols-1 min-[561px]:grid-cols-2 min-[901px]:grid-cols-4`}
        >
          {heroStats.map((stat) => (
            <div key={stat.figure + stat.label.slice(0, 16)} data-reveal className="bg-ds-blue-deep px-[26px] py-7">
              <b
                className="mb-3 block font-ds-display text-[40px] leading-none font-medium tracking-[-0.02em] text-ds-skyway"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {stat.figure}
              </b>
              <span className="font-ds-body text-[14.5px] leading-[1.5] text-ds-skyway/68">{stat.label}</span>
            </div>
          ))}
        </DsReveal>

        <BriefSources>{heroSources}</BriefSources>
      </div>

      <div className={BRIEF_WRAP}>
        <DsReveal stagger className="mt-[26px] grid grid-cols-1 gap-3.5 min-[901px]:grid-cols-3">
          {chips.map((chip) => (
            <div
              key={chip}
              data-reveal
              className="border border-ds-skyway/14 bg-ds-blue-deep px-5 py-[18px] font-ds-body text-[15.5px] leading-[1.4] font-semibold text-ds-skyway before:mb-3 before:block before:h-0.5 before:w-[22px] before:bg-ds-aurum before:content-['']"
            >
              {chip}
            </div>
          ))}
        </DsReveal>
      </div>
    </>
  );
}
