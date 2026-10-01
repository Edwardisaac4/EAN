import Image from 'next/image';
import DsReveal from '@/components/future/DsReveal';
import type { FutureSection } from '@/lib/future-constants';

/**
 * One section of a programme page, in the design system's vocabulary.
 *
 * Every deck is built from the same seven blocks — prose, a stat row, a pulled
 * figure, a card grid, a numbered sequence, a timeline, photography — in
 * whatever combination the line needs, so this renders whichever of them the
 * record carries and skips the rest. One component, not seven: the ten pages
 * differ in content, never in vocabulary.
 *
 * Grounds alternate Canvas Linen and Canvas Deep. The two are 1.03 apart, which
 * is nowhere near enough to separate sections on its own and is not asked to —
 * the separation comes from the cards, which are white with a hairline, and
 * from the pulled figure, which is a full-bleed blue band. The alternation only
 * groups.
 */
export default function ProgrammeSection({
  section,
  index,
}: {
  section: FutureSection;
  index: number;
}) {
  const { id, label, heading, body, pullStat, stats, cards, steps, milestones, images, logos, notes, sources } =
    section;

  const deep = index % 2 === 1;

  // Split once, here, rather than filtering twice in the markup below.
  const peopleImages = images?.filter((image) => image.people || image.fullWidth) ?? [];
  const placeImages = images?.filter((image) => !image.people && !image.fullWidth) ?? [];

  return (
    <section
      id={id}
      // scroll-mt clears the fixed bar and the sticky section nav.
      className={`scroll-mt-[124px] py-20 md:py-28 ${deep ? 'bg-ds-canvas-deep' : 'bg-ds-canvas'}`}
    >
      <div className="mx-auto max-w-ean px-6 md:px-12">
        <DsReveal>
          <p className="font-ds-display text-[13px] font-semibold uppercase tracking-[0.10em] text-ds-blue">
            {label}
          </p>
          <h2 className="mt-4 max-w-[26ch] font-ds-display text-[26px] leading-[1.15] font-bold tracking-[-0.02em] text-ds-afterburn md:text-[32px]">
            {heading}
          </h2>
        </DsReveal>

        {body && body.length > 0 && (
          <DsReveal stagger className="mt-8 max-w-[68ch] space-y-5 md:mt-10">
            {body.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                data-reveal
                className="font-ds-body text-[16px] leading-[1.7] text-ds-text-secondary"
              >
                {paragraph}
              </p>
            ))}
          </DsReveal>
        )}

        {stats && stats.length > 0 && (
          <DsReveal
            stagger
            grid
            className="mt-12 grid grid-cols-1 gap-x-10 gap-y-9 border-t border-ds-hairline pt-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-3"
          >
            {stats.map((stat) => (
              <div key={stat.figure + stat.label.slice(0, 16)} data-reveal>
                <p
                  className="font-ds-display text-[30px] leading-none font-bold tracking-[-0.02em] text-ds-blue md:text-[36px]"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {stat.figure}
                </p>
                <p className="mt-3 font-ds-body text-[14px] leading-[1.6] text-ds-text-secondary">
                  {stat.label}
                </p>
              </div>
            ))}
          </DsReveal>
        )}

        {cards && cards.length > 0 && (
          <DsReveal
            stagger
            grid
            className="mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-2 lg:grid-cols-3"
          >
            {cards.map((card) => (
              <article key={card.title} data-reveal className="ds-card ds-card-interactive p-7">
                {card.kicker && (
                  <p className="font-ds-display text-[11px] font-semibold uppercase tracking-[0.10em] text-ds-blue">
                    {card.kicker}
                  </p>
                )}
                <h3 className="mt-3 font-ds-display text-[18px] leading-[1.25] font-semibold tracking-[-0.02em] text-ds-afterburn">
                  {card.title}
                </h3>
                <p className="mt-3 font-ds-body text-[15px] leading-[1.65] text-ds-text-secondary">
                  {card.body}
                </p>
              </article>
            ))}
          </DsReveal>
        )}

        {steps && steps.length > 0 && (
          <DsReveal
            stagger
            grid
            className="mt-12 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2 lg:grid-cols-3"
          >
            {steps.map((step) => (
              <div key={step.number} data-reveal className="border-t border-ds-blue/30 pt-5">
                <p
                  className="font-ds-display text-[30px] leading-none font-bold tracking-[-0.02em] text-ds-blue/35 md:text-[38px]"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {step.number}
                </p>
                <h3 className="mt-4 font-ds-display text-[18px] leading-[1.25] font-semibold tracking-[-0.02em] text-ds-afterburn">
                  {step.title}
                </h3>
                <p className="mt-2.5 font-ds-body text-[15px] leading-[1.65] text-ds-text-secondary">
                  {step.body}
                </p>
              </div>
            ))}
          </DsReveal>
        )}

        {milestones && milestones.length > 0 && (
          <DsReveal stagger className="mt-12 md:mt-16">
            <ol className="relative border-l border-ds-hairline pl-7 md:pl-10">
              {milestones.map((milestone) => (
                <li
                  key={milestone.period + milestone.title}
                  data-reveal
                  className="relative pb-10 last:pb-0"
                >
                  {/*
                    The marker sits on the rule, not beside it: -left is half the
                    dot's width plus the rule, so it reads as a point on the line.
                    The present is the one filled dot on the page.
                  */}
                  <span
                    aria-hidden
                    className={`absolute -left-[33px] top-[7px] size-[9px] rounded-full md:-left-[45px] ${
                      milestone.current
                        ? 'bg-ds-blue ring-4 ring-ds-blue/15'
                        : 'border border-ds-skyway-dark bg-ds-canvas'
                    }`}
                  />
                  <p
                    className={`font-ds-display text-[12px] font-semibold uppercase tracking-[0.10em] ${
                      milestone.current ? 'text-ds-blue' : 'text-ds-text-muted'
                    }`}
                  >
                    {milestone.period}
                  </p>
                  <h3 className="mt-2 font-ds-display text-[18px] leading-[1.3] font-semibold tracking-[-0.02em] text-ds-afterburn">
                    {milestone.title}
                  </h3>
                  <p className="mt-2 max-w-[62ch] font-ds-body text-[15px] leading-[1.65] text-ds-text-secondary">
                    {milestone.body}
                  </p>
                </li>
              ))}
            </ol>
          </DsReveal>
        )}

        {/*
          People photographs are pulled out of the grid entirely.

          Every one EAN has is a full-length posed group — eight Client
          Relations staff under the terminal sign, sixteen ground handlers in a
          line across the apron, the dispatch team at 1400×1450. In a 16:10 cell
          `object-cover` keeps a band across the middle and takes the back row's
          heads with it. So these run full width at their own ratio, with
          `h-auto` and no cover crop: nothing is cut off any edge.
        */}
        {peopleImages.length > 0 && (
          <DsReveal stagger className="mt-12 space-y-10 md:mt-16">
            {peopleImages.map((image) => (
              <figure key={image.src + image.caption.slice(0, 24)} data-reveal>
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width ?? 1400}
                  height={image.height ?? 900}
                  sizes="(min-width: 1160px) 1064px, 100vw"
                  className="h-auto w-full rounded-[14px]"
                />
                <figcaption className="mt-3.5">
                  {image.lede && (
                    <span className="mr-2 font-ds-display text-[14px] font-semibold text-ds-afterburn">
                      {image.lede}
                    </span>
                  )}
                  <span className="font-ds-mono text-[10.5px] leading-[1.6] text-ds-text-muted">
                    {image.caption}
                  </span>
                </figcaption>
              </figure>
            ))}
          </DsReveal>
        )}

        {placeImages.length > 0 && (
          <DsReveal
            stagger
            grid
            className={`mt-12 grid grid-cols-1 gap-6 md:mt-16 md:gap-8 ${
              placeImages.length === 1
                ? ''
                : placeImages.length === 3
                  ? 'md:grid-cols-3'
                  : 'md:grid-cols-2'
            }`}
          >
            {placeImages.map((image) => (
              <figure key={image.src + image.caption.slice(0, 24)} data-reveal>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[14px] bg-ds-canvas-deep">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes={
                      placeImages.length === 1
                        ? '(min-width: 1160px) 1064px, 100vw'
                        : '(min-width: 768px) 50vw, 100vw'
                    }
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3.5">
                  {image.lede && (
                    <span className="mr-2 font-ds-display text-[14px] font-semibold text-ds-afterburn">
                      {image.lede}
                    </span>
                  )}
                  <span className="font-ds-mono text-[10.5px] leading-[1.6] text-ds-text-muted">
                    {image.caption}
                  </span>
                </figcaption>
              </figure>
            ))}
          </DsReveal>
        )}

        {logos && logos.length > 0 && (
          <DsReveal
            stagger
            grid
            className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-7 border-t border-ds-hairline pt-10 md:mt-16"
          >
            {logos.map((logo) => (
              <div key={logo.src} data-reveal className="relative h-8 w-[104px] md:h-9 md:w-[124px]">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  sizes="124px"
                  className="object-contain object-left"
                />
              </div>
            ))}
          </DsReveal>
        )}

        {notes && notes.length > 0 && (
          <DsReveal stagger className="mt-12 space-y-5 md:mt-14">
            {notes.map((note) => (
              <div
                key={note.label}
                data-reveal
                className="rounded-[10px] px-6 py-5"
                style={{ background: 'var(--color-ds-blue-tint)' }}
              >
                <p className="font-ds-display text-[11px] font-semibold uppercase tracking-[0.10em] text-ds-blue">
                  {note.label}
                </p>
                <p className="mt-2.5 max-w-[68ch] font-ds-body text-[15px] leading-[1.65] text-ds-text-secondary">
                  {note.body}
                </p>
              </div>
            ))}
          </DsReveal>
        )}

        {sources && (
          <p className="mt-12 max-w-[92ch] font-ds-mono text-[11px] leading-[1.7] text-ds-text-muted md:mt-14">
            <span className="text-ds-blue">Sources</span> {sources}
          </p>
        )}
      </div>

      {/*
        The pulled figure. Full-bleed blue, breaking out of the container — this
        is what carries the page's rhythm, and it is why the reading sections can
        sit on two nearly identical linens without the page flattening.
      */}
      {pullStat && (
        <DsReveal className="mt-20 bg-ds-blue py-14 md:mt-28 md:py-20">
          <div className="mx-auto max-w-ean px-6 md:px-12">
            <p
              className="font-ds-display text-[40px] leading-none font-bold tracking-[-0.035em] text-ds-skyway md:text-[72px]"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {pullStat.figure}
            </p>
            <p className="mt-5 max-w-[54ch] font-ds-body text-[17px] leading-[1.6] text-ds-skyway/70 md:text-[20px]">
              {pullStat.label}
            </p>
          </div>
        </DsReveal>
      )}
    </section>
  );
}
