import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowDown } from 'lucide-react';
import DsReveal from '@/components/future/DsReveal';
import type { FutureProgramme } from '@/lib/future-constants';

/**
 * The top of a programme page, as every deck builds it: a full-bleed
 * photograph at least 640px tall with the title sitting on its bottom edge,
 * then the four figures on a panel that rides up over it.
 *
 * Two details carry most of the effect and are easy to lose:
 *
 * 1. **The title sits on the bottom edge of the photograph, not its centre.**
 *    The scrim is weighted the same way — 55% at the top, 96% at the foot — so
 *    the picture is legible above the type and the type is legible over the
 *    picture. Centring the block would need a flat scrim and would flatten the
 *    photograph with it.
 * 2. **The stat strip overlaps by 56px.** That negative margin is what ties the
 *    two bands into one masthead instead of a picture with a table under it.
 *
 * The strip is also this page's one elevated dark surface — §21 allows one per
 * screen, and one travelling light, and both are spent here. The photograph
 * above it is a photograph, not an elevated surface, so the rule holds.
 */
export default function ProgrammeHero({ programme }: { programme: FutureProgramme }) {
  const { number, title, eyebrow, headline, lede, heroStats, heroSources, chips, hero, sections } =
    programme;

  const firstSection = sections[0]?.id;

  return (
    <header>
      <div className="relative flex min-h-[560px] items-end overflow-hidden bg-ds-afterburn md:min-h-[640px]">
        <Image
          src={hero.image}
          alt={hero.alt}
          fill
          sizes="100vw"
          priority
          style={hero.imagePosition ? { objectPosition: hero.imagePosition } : undefined}
          className="object-cover"
        />

        {/*
          The scrim, at the deck's own three stops. Rewritten from burgundy to
          the blue ramp: it darkens through `blue-deep` at the midpoint rather
          than through Cabernet, so the photograph cools towards the brand
          colour instead of towards wine.
        */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,0,0,0.55) 0%, rgba(18,0,63,0.62) 55%, rgba(8,0,0,0.96) 100%)',
          }}
        />

        <div className="relative mx-auto w-full max-w-ean px-6 pt-[140px] pb-[72px] md:px-12 md:pt-[160px]">
          <Link
            href="/airborne"
            className="group mb-10 inline-flex items-center gap-2 font-ds-display text-[13px] font-semibold tracking-[0.04em] text-ds-skyway/70 transition-colors duration-[400ms] ease-ds-default hover:text-ds-skyway"
          >
            <ArrowLeft
              aria-hidden
              className="size-3.5 transition-transform duration-[400ms] ease-ds-default group-hover:-translate-x-1"
            />
            All ten programmes
          </Link>

          <DsReveal>
            {/* The deck's eyebrow: a gold rule on the left, the edition above
                the line's own name. Gold clears AA here at 7.42:1. */}
            <div className="border-l-2 border-ds-aurum pl-3.5">
              <p className="font-ds-mono text-[12px] leading-[1.5] tracking-[0.12em] text-ds-aurum">
                {eyebrow}
              </p>
              <p className="font-ds-display text-[20px] font-medium tracking-[0.02em] text-ds-skyway">
                {title}
              </p>
            </div>

            <h1
              className="mt-6 max-w-[16ch] font-ds-display font-bold text-ds-skyway md:mt-7"
              style={{
                fontSize: 'clamp(34px, 5.4vw, 62px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                textWrap: 'balance',
              }}
            >
              {headline}
            </h1>

            <p className="mt-6 max-w-[56ch] font-ds-body text-[17px] leading-[1.6] text-ds-skyway/75 md:text-[19px]">
              {lede}
            </p>

            {firstSection && (
              <a
                href={`#${firstSection}`}
                className="mt-9 inline-flex items-center gap-2.5 rounded-full border border-ds-skyway/55 px-6 py-3 font-ds-display text-[15px] font-semibold text-ds-skyway transition-all duration-[400ms] ease-ds-default hover:bg-ds-skyway hover:text-ds-blue-deep"
              >
                Read the brief
                <ArrowDown aria-hidden className="size-4" />
              </a>
            )}
          </DsReveal>
        </div>
      </div>

      {/*
        The strip rides 56px up into the photograph. `z-10` is required, not
        decorative — without it the hero's scrim paints over the overlap.
      */}
      <div className="relative z-10 -mt-14 px-6 md:px-12">
        <div className="mx-auto max-w-ean">
          <DsReveal className="ds-elevated p-8 md:p-12">
            {/* The travelling light: one ring of arcs, drifting at 26s. */}
            <svg
              aria-hidden
              className="ds-arcs"
              viewBox="0 0 280 280"
              fill="none"
              stroke="var(--color-ds-aurum)"
              strokeWidth="1"
            >
              {[132, 106, 80].map((r) => (
                <circle key={r} cx="140" cy="140" r={r} strokeDasharray="3 9" />
              ))}
            </svg>
            <div className="ds-sheen" />

            <div className="relative">
              <div className="flex items-center gap-2.5">
                <span aria-hidden className="ds-glow size-[7px] rounded-full bg-ds-aurum" />
                <span
                  className="font-ds-display text-[12px] font-semibold uppercase tracking-[0.14em] text-ds-aurum"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  Line {number}
                </span>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 md:grid-cols-4">
                {heroStats.map((stat) => (
                  <div key={stat.figure + stat.label.slice(0, 16)}>
                    <p
                      className="font-ds-display text-[28px] leading-none font-bold tracking-[-0.02em] text-ds-skyway md:text-[34px]"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {stat.figure}
                    </p>
                    <p className="mt-3 font-ds-body text-[14px] leading-[1.6] text-ds-skyway/55">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-10 max-w-[92ch] font-ds-mono text-[11px] leading-[1.7] text-ds-skyway/40">
                <span className="text-ds-aurum">Sources</span> {heroSources}
              </p>
            </div>
          </DsReveal>

          <DsReveal stagger className="mt-8 flex flex-wrap gap-2.5 md:mt-10">
            {chips.map((chip) => (
              <span
                key={chip}
                data-reveal
                className="rounded-full border border-ds-hairline bg-ds-white px-4 py-2.5 font-ds-display text-[13px] font-semibold text-ds-blue"
              >
                {chip}
              </span>
            ))}
          </DsReveal>
        </div>
      </div>
    </header>
  );
}
