import Link from 'next/link';
import DsReveal from '@/components/future/DsReveal';
import { FUTURE_INDEX } from '@/lib/future-constants';

/**
 * "One campus, ten lines" — the strip every deck closes with.
 *
 * Each page prints all ten and marks its own, which is the decks' own device
 * and worth keeping: the argument every one of these pages makes is that the
 * line is worth more for sitting on the same campus as the other nine, and the
 * strip is where that argument is visible rather than asserted.
 *
 * The current line renders as text, not a link — a link to the page you are on
 * is a dead control, and `aria-current` alone does not stop a pointer.
 */
export default function ProgrammeIndex({
  currentSlug,
  heading,
}: {
  currentSlug: string;
  heading: string;
}) {
  return (
    <section className="bg-ds-canvas py-20 md:py-28">
      <div className="mx-auto max-w-ean px-6 md:px-12">
        <DsReveal>
          <p className="font-ds-display text-[13px] font-semibold uppercase tracking-[0.10em] text-ds-blue">
            One campus, ten lines
          </p>
          <h2 className="mt-4 max-w-[26ch] font-ds-display text-[26px] leading-[1.15] font-bold tracking-[-0.02em] text-ds-afterburn md:text-[32px]">
            {heading}
          </h2>
        </DsReveal>

        <DsReveal stagger className="mt-10 border-t border-ds-hairline md:mt-14">
          {FUTURE_INDEX.map((line) => {
            const isCurrent = line.slug === currentSlug;

            const inner = (
              <>
                <span
                  className={`font-ds-mono text-[13px] ${isCurrent ? 'text-ds-blue' : 'text-ds-text-muted'}`}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {line.number}
                </span>
                <span
                  className={`font-ds-display text-[17px] tracking-[-0.02em] md:text-[19px] ${
                    isCurrent
                      ? 'font-bold text-ds-afterburn'
                      : 'font-semibold text-ds-text-secondary'
                  }`}
                >
                  {line.name}
                </span>
                {isCurrent && (
                  <span className="font-ds-display text-[11px] font-semibold uppercase tracking-[0.10em] text-ds-blue">
                    This page
                  </span>
                )}
              </>
            );

            return (
              <div key={line.slug} data-reveal className="border-b border-ds-hairline">
                {isCurrent ? (
                  <p aria-current="page" className="flex items-center gap-5 py-4">
                    {inner}
                  </p>
                ) : (
                  <Link
                    href={`/airborne/${line.slug}`}
                    className="group flex items-center gap-5 py-4 transition-colors duration-[400ms] ease-ds-default hover:bg-ds-white"
                  >
                    {inner}
                  </Link>
                )}
              </div>
            );
          })}
        </DsReveal>
      </div>
    </section>
  );
}
