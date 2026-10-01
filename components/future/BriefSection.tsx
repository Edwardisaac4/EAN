import Image from 'next/image';
import DsReveal from '@/components/future/DsReveal';
import BriefSources from '@/components/future/BriefSources';
import MaskedLines from '@/components/future/MaskedLines';
import WipeFigure from '@/components/future/WipeFigure';
import {
  BRIEF_H2,
  BRIEF_H4,
  BRIEF_HAIRLINE_GRID,
  BRIEF_LABEL,
  BRIEF_LEDE,
  BRIEF_RULE,
  BRIEF_SECTION,
  BRIEF_WRAP,
} from '@/components/future/brief-styles';
import type { FutureImage, FutureSection, FutureStat } from '@/lib/future-constants';

/**
 * One section of a brief, laid out the way the brief lays it out.
 *
 * The layout falls out of what the record carries rather than a per-section
 * flag, because the brief's own rule is that simple: a section with
 * photography and no timeline is two columns, prose left and pictures right at
 * their own aspect ratio; a timeline's photographs run under it as a captioned
 * gallery; everything else is one column.
 *
 * Beside photography only the prose and the figure rows share the left column.
 * Cards, steps and logos need the full measure, so when a two-column section carries
 * them they run underneath it, and its sources follow them there.
 *
 * Cards with a kicker are the brief's hairline card grid; cards without one are
 * its two-column service list.
 *
 * `cinematic` changes two things and nothing else: the heading slides up from a
 * line mask (MaskedLines) instead of rising with its paragraphs, and every
 * photograph opens and closes like a shutter (WipeFigure) instead of fading in.
 */
export default function BriefSection({
  section,
  first,
  cinematic = false,
}: {
  section: FutureSection;
  first?: boolean;
  cinematic?: boolean;
}) {
  const {
    id,
    label,
    heading,
    body = [],
    pullStat,
    pullStatAt,
    stats,
    secondaryStats,
    cards,
    steps,
    milestones,
    images,
    logos,
    notes,
    sources,
  } = section;

  const columnImages = images?.filter((image) => !image.fullWidth) ?? [];
  const fullWidthImages = images?.filter((image) => image.fullWidth) ?? [];

  const hasColumnImages = columnImages.length > 0;
  const hasFullWidthImages = fullWidthImages.length > 0;
  const twoColumn = hasColumnImages && !milestones?.length;
  const fullMeasureBelow =
    twoColumn &&
    (hasFullWidthImages || !!cards?.length || !!steps?.length || !!logos?.length);
  const cardGrid = !!cards?.some((card) => card.kicker);

  const pullAfterBlocks = pullStatAt === 'after-blocks';
  const split = typeof pullStatAt === 'number' ? pullStatAt : body.length;
  const paragraphs = (list: string[]) =>
    list.map((paragraph) => (
      <p key={paragraph.slice(0, 40)} className={BRIEF_LEDE}>
        {paragraph}
      </p>
    ));

  const pull = pullStat && (
    <DsReveal className="mt-[34px] flex flex-col gap-2 border-y border-ds-skyway/14 py-[22px] min-[561px]:flex-row min-[561px]:items-baseline min-[561px]:gap-[22px]">
      <b className="font-ds-display text-[44px] leading-none font-medium whitespace-nowrap text-ds-skyway">
        {pullStat.figure}
      </b>
      <span className="max-w-[52ch] font-ds-body text-[15.5px] text-ds-skyway/68">{pullStat.label}</span>
    </DsReveal>
  );

  const lead = (
    <>
      {cinematic ? (
        <>
          <DsReveal>
            <p className={BRIEF_LABEL}>{label}</p>
          </DsReveal>
          <MaskedLines className={BRIEF_H2}>{heading}</MaskedLines>
          {split > 0 && <DsReveal>{paragraphs(body.slice(0, split))}</DsReveal>}
        </>
      ) : (
        <DsReveal>
          <p className={BRIEF_LABEL}>{label}</p>
          <h2 className={BRIEF_H2}>{heading}</h2>
          {paragraphs(body.slice(0, split))}
        </DsReveal>
      )}

      {!pullAfterBlocks && pull}

      {/* The brief sets these flush under the figure's rule; 24px keeps them off it. */}
      {split < body.length && <DsReveal className="mt-6">{paragraphs(body.slice(split))}</DsReveal>}

      {stats && stats.length > 0 && <Kpis stats={stats} narrow={twoColumn} />}
      {secondaryStats && secondaryStats.length > 0 && <Kpis stats={secondaryStats} narrow={twoColumn} />}
    </>
  );

  const rest = (
    <>
      {hasFullWidthImages && (
        <div className={twoColumn ? 'mt-12' : 'mt-[34px]'}>
          {cinematic ? (
            fullWidthImages.map((image, index) => (
              <WipeFigure
                key={image.src}
                className={index > 0 ? 'mt-6' : undefined}
                frameClassName="border border-ds-skyway/14"
                caption={image.caption}
                captionClassName="mt-2.5 font-ds-mono text-[11.5px] tracking-[0.08em] text-ds-skyway/55"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width ?? 1600}
                  height={image.height ?? 1000}
                  sizes="(min-width: 1160px) 1072px, 100vw"
                  className="block h-auto w-full"
                />
              </WipeFigure>
            ))
          ) : (
            <DsReveal stagger>
              {fullWidthImages.map((image, index) => (
                <figure key={image.src} data-reveal className={index > 0 ? 'mt-6' : undefined}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width ?? 1600}
                    height={image.height ?? 1000}
                    sizes="(min-width: 1160px) 1072px, 100vw"
                    className="block h-auto w-full border border-ds-skyway/14"
                  />
                  <figcaption className="mt-2.5 font-ds-mono text-[11.5px] tracking-[0.08em] text-ds-skyway/55">
                    {image.caption}
                  </figcaption>
                </figure>
              ))}
            </DsReveal>
          )}
        </div>
      )}

      {cards && cards.length > 0 && cardGrid && (
        <DsReveal
          stagger
          grid
          className={`${BRIEF_HAIRLINE_GRID} mt-[34px] grid-cols-1 min-[561px]:grid-cols-2 min-[901px]:grid-cols-3`}
        >
          {cards.map((card, index) => (
            <article
              key={card.title}
              data-reveal
              className={`bg-ds-blue-deep px-[26px] pt-[26px] pb-7 ${fillLastRow(index, cards.length, {
                sm: 2,
                lg: 3,
              })}`}
            >
              {card.kicker && (
                <em className="mb-3.5 block font-ds-mono text-[11.5px] tracking-[0.08em] text-ds-aurum uppercase not-italic">
                  {card.kicker}
                </em>
              )}
              <h3 className={`${BRIEF_H4} mb-1.5`}>{card.title}</h3>
              <p className="font-ds-body text-[15px] leading-[1.55] text-ds-skyway/68">{card.body}</p>
            </article>
          ))}
        </DsReveal>
      )}

      {cards && cards.length > 0 && !cardGrid && (
        <DsReveal stagger>
          <ul className="mt-[26px] list-none columns-1 gap-x-10 p-0 min-[901px]:columns-2">
            {cards.map((card) => (
              <li
                key={card.title}
                data-reveal
                className="break-inside-avoid border-b border-ds-skyway/14 py-2.5 font-ds-body text-[16px] text-ds-skyway/90"
              >
                <b className="font-semibold text-ds-skyway">{card.title}</b>
                <span className="block text-[13.5px] text-ds-skyway/68">{card.body}</span>
              </li>
            ))}
          </ul>
        </DsReveal>
      )}

      {steps && steps.length > 0 && (
        <DsReveal
          stagger
          grid
          className={`${BRIEF_HAIRLINE_GRID} mt-[34px] grid-cols-1 min-[561px]:grid-cols-2 min-[901px]:grid-cols-6`}
        >
          {steps.map((step, index) => (
            <div
              key={step.number}
              data-reveal
              className={`bg-ds-blue-deep px-4 py-5 ${fillLastRow(index, steps.length, { sm: 2, lg: 6 })}`}
            >
              <em className="mb-2 block font-ds-mono text-[11px] tracking-[0.1em] text-ds-aurum uppercase not-italic">
                {step.number}
              </em>
              <h3 className={`${BRIEF_H4} mb-1`}>{step.title}</h3>
              <p className="font-ds-body text-[13.5px] leading-[1.45] text-ds-skyway/68">{step.body}</p>
            </div>
          ))}
        </DsReveal>
      )}

      {milestones && milestones.length > 0 && (
        <DsReveal stagger>
          <ol className="mt-[34px] ml-2 grid list-none gap-[26px] border-l border-ds-skyway/14 pl-[34px]">
            {milestones.map((milestone) => (
              <li key={milestone.period + milestone.title} data-reveal className="relative">
                {/* A point on the rule; the present is the one lit marker. */}
                <span
                  aria-hidden
                  className={`absolute top-2 -left-[40px] size-[11px] rounded-full ${
                    milestone.current ? 'bg-ds-skyway ring-[5px] ring-ds-skyway/18' : 'bg-ds-aurum'
                  }`}
                />
                <em className="mb-1 block font-ds-mono text-[11.5px] tracking-[0.1em] text-ds-aurum uppercase not-italic">
                  {milestone.period}
                </em>
                <h3 className={`${BRIEF_H4} mb-1`}>{milestone.title}</h3>
                <p className="font-ds-body text-[15px] text-ds-skyway/68">{milestone.body}</p>
              </li>
            ))}
          </ol>
        </DsReveal>
      )}

      {pullAfterBlocks && pull}

      {hasColumnImages && !twoColumn && <Gallery images={columnImages} cinematic={cinematic} />}

      {logos && logos.length > 0 && (
        <DsReveal
          stagger
          grid
          className="mt-[34px] grid grid-cols-1 gap-3.5 min-[561px]:grid-cols-2 min-[901px]:grid-cols-5"
        >
          {logos.map((logo) => (
            <div
              key={logo.src}
              data-reveal
              className="relative flex h-[92px] items-center justify-center rounded-[4px] bg-ds-skyway-light p-3.5"
            >
              <div className="relative h-14 w-4/5">
                <Image src={logo.src} alt={logo.alt} fill sizes="180px" className="object-contain" />
              </div>
            </div>
          ))}
        </DsReveal>
      )}

      {notes?.map((note) => (
        <DsReveal key={note.label} className="mt-[22px] border border-ds-skyway/14 bg-ds-blue-deep px-7 py-6">
          <em className="mb-2.5 block font-ds-mono text-[11.5px] tracking-[0.1em] text-ds-skyway uppercase not-italic">
            {note.label}
          </em>
          <p className="font-ds-display text-[22px] leading-[1.35] text-ds-skyway italic">{note.body}</p>
        </DsReveal>
      ))}

      {sources && <BriefSources>{sources}</BriefSources>}
    </>
  );

  return (
    <section id={id} className={first ? BRIEF_SECTION : `${BRIEF_SECTION} ${BRIEF_RULE}`}>
      <div className={BRIEF_WRAP}>
        {twoColumn ? (
          <>
            <div className="grid grid-cols-1 items-start gap-12 min-[901px]:grid-cols-[1.05fr_0.95fr]">
              <div>
                {lead}
                {!fullMeasureBelow && rest}
              </div>
              {cinematic ? (
                <div>
                  {columnImages.map((image, index) => (
                    <WipeFigure
                      key={image.src}
                      className={index > 0 ? 'mt-4' : undefined}
                      // The border moves to the frame, so it is not scaled with the picture.
                      frameClassName="border border-ds-skyway/14"
                      caption={image.caption}
                      captionClassName="mt-2.5 font-ds-mono text-[11.5px] tracking-[0.08em] text-ds-skyway/55"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={image.width ?? 1400}
                        height={image.height ?? 900}
                        sizes="(min-width: 901px) 520px, 100vw"
                        className="block h-auto w-full"
                      />
                    </WipeFigure>
                  ))}
                </div>
              ) : (
                <DsReveal stagger>
                  {columnImages.map((image, index) => (
                    <figure key={image.src} data-reveal className={index > 0 ? 'mt-4' : undefined}>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={image.width ?? 1400}
                        height={image.height ?? 900}
                        sizes="(min-width: 901px) 520px, 100vw"
                        className="block h-auto w-full border border-ds-skyway/14"
                      />
                      <figcaption className="mt-2.5 font-ds-mono text-[11.5px] tracking-[0.08em] text-ds-skyway/55">
                        {image.caption}
                      </figcaption>
                    </figure>
                  ))}
                </DsReveal>
              )}
            </div>
            {fullMeasureBelow && rest}
          </>
        ) : (
          <>
            {lead}
            {rest}
          </>
        )}
      </div>
    </section>
  );
}

/*
 * Literal span classes per breakpoint, indexed by span, so Tailwind can see
 * every one of them. Index 0 is unused.
 */
const SPANS = {
  base: ['', 'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6'],
  sm: [
    '',
    'min-[561px]:col-span-1',
    'min-[561px]:col-span-2',
    'min-[561px]:col-span-3',
    'min-[561px]:col-span-4',
    'min-[561px]:col-span-5',
    'min-[561px]:col-span-6',
  ],
  lg: [
    '',
    'min-[901px]:col-span-1',
    'min-[901px]:col-span-2',
    'min-[901px]:col-span-3',
    'min-[901px]:col-span-4',
    'min-[901px]:col-span-5',
    'min-[901px]:col-span-6',
  ],
} as const;

/**
 * Span for the last cell of a hairline grid, so a short last row is filled
 * rather than leaving empty cells beside it — at each breakpoint, from the
 * column count the grid has there.
 */
function lastCellSpan(count: number, cols: { base?: number; sm?: number; lg?: number }): string {
  return (Object.keys(cols) as (keyof typeof SPANS)[])
    .map((bp) => {
      const n = cols[bp]!;
      const rem = count % n;
      return SPANS[bp][rem === 0 ? 1 : n - rem + 1];
    })
    .join(' ');
}

/** Class for cell `index` of `count`: the fill span on the last one, nothing otherwise. */
function fillLastRow(index: number, count: number, cols: { base?: number; sm?: number; lg?: number }) {
  return index === count - 1 ? lastCellSpan(count, cols) : '';
}

/**
 * The brief's figure row. Full width it is five across. Beside photography the
 * brief packs 96px cells into half the page, which wraps every label to two
 * words and pushes six-digit figures out of their cells — so there it is three
 * across (two on a phone) at a smaller figure size, and the last cell fills
 * whatever its row leaves.
 */
function Kpis({ stats, narrow }: { stats: FutureStat[]; narrow: boolean }) {
  const cols = narrow ? { base: 2, sm: 3 } : { sm: 2, lg: 5 };

  return (
    <DsReveal
      stagger
      grid
      className={`${BRIEF_HAIRLINE_GRID} mt-[34px] ${
        narrow ? 'grid-cols-2 min-[561px]:grid-cols-3' : 'grid-cols-1 min-[561px]:grid-cols-2 min-[901px]:grid-cols-5'
      }`}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.figure + stat.label.slice(0, 16)}
          data-reveal
          className={`min-w-0 bg-ds-blue-deep px-[18px] py-5 ${fillLastRow(index, stats.length, cols)}`}
        >
          <b
            className={`mb-2 block font-ds-display leading-none font-medium text-ds-skyway ${
              narrow ? 'text-[26px]' : 'text-[30px]'
            }`}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {stat.figure}
          </b>
          <span className="font-ds-body text-[13.5px] leading-[1.45] text-ds-skyway/68">{stat.label}</span>
        </div>
      ))}
    </DsReveal>
  );
}

function Gallery({ images, cinematic }: { images: FutureImage[]; cinematic: boolean }) {
  const caption = (image: FutureImage) => (
    <>
      {image.lede && (
        <b className="mb-0.5 block font-ds-body text-[15px] font-semibold tracking-normal text-ds-skyway">
          {image.lede}
        </b>
      )}
      {image.caption}
    </>
  );

  if (cinematic) {
    return (
      <div className="mt-[34px] grid grid-cols-1 gap-4 min-[561px]:grid-cols-2 min-[901px]:grid-cols-3">
        {images.map((image, index) => (
          <WipeFigure
            key={image.src}
            fill
            // A row crossing the trigger line together still opens left to right.
            delay={(index % 3) * 0.1}
            frameClassName="relative aspect-[16/10] w-full border border-ds-skyway/14 bg-ds-blue-deep"
            caption={caption(image)}
            captionClassName="mt-2.5 font-ds-mono text-[11.5px] leading-[1.5] tracking-[0.08em] text-ds-skyway/55"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 901px) 360px, (min-width: 561px) 50vw, 100vw"
              className="object-cover"
            />
          </WipeFigure>
        ))}
      </div>
    );
  }

  return (
    <DsReveal
      stagger
      grid
      className="mt-[34px] grid grid-cols-1 gap-4 min-[561px]:grid-cols-2 min-[901px]:grid-cols-3"
    >
      {images.map((image) => (
        <figure key={image.src} data-reveal>
          <div className="relative aspect-[16/10] w-full overflow-hidden border border-ds-skyway/14 bg-ds-blue-deep">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 901px) 360px, (min-width: 561px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2.5 font-ds-mono text-[11.5px] leading-[1.5] tracking-[0.08em] text-ds-skyway/55">
            {caption(image)}
          </figcaption>
        </figure>
      ))}
    </DsReveal>
  );
}
