'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';

import type { ServiceRichData } from '@/lib/constants';

/*
 * The service card — the /about principle card, carrying a whole service line.
 *
 * The About cards (app/about/page.tsx) established the pattern: a full-bleed
 * photograph, a hairline that grows edge to edge, and a write-up that slides
 * open on hover or on tap. This is that card with four things the About version
 * does not have, each of which it needs because a service line is not a
 * one-sentence principle.
 *
 * 1. It is reachable from a keyboard. The About card is a `div` carrying an
 *    `onClick`: not focusable, no role, no key handler, unusable by anything
 *    that is not a mouse. Here the whole card is a real `<button>` laid over the
 *    photograph with `aria-expanded`/`aria-controls`, and the panel also opens
 *    on `group-focus-within`, so tabbing to the card reveals the content that
 *    the next tab stops live inside.
 * 2. It reveals everything — description, stat chips, all four features, and
 *    both calls to action. This is the point of the rebuild. The bento grid that
 *    preceded the feature rows `truncate`d its feature lists, and that is the
 *    failure the rows were built to fix; a card that reopened that wound would
 *    be a regression wearing a redesign. Nothing here is clipped.
 * 3. The features stagger in rather than fading as one block, on a per-item
 *    `transitionDelay`. Four lines arriving together read as a wall of text;
 *    arriving 70ms apart they read as a list being written.
 * 4. A pointer-tracked glow. The card writes `--ean-mx`/`--ean-my` on itself
 *    from `pointermove` and a radial-gradient layer reads them, so the light
 *    follows the cursor across the photograph instead of sitting in a fixed
 *    corner. One style write per animation frame, no React state, so it never
 *    re-renders the tree.
 *
 * Colour: this is a photograph carrying white type, which is the one place
 * AGENTS.md §5 asks for literal `text-white` and `black/…` scrims rather than
 * surface tokens. The hover wash is the brand blue itself (`ean-gold`, #2b0098)
 * at 85% rather than the raw `#080d28` the About card reaches for — the same
 * depth, and it is the token the page's own blue bands already use.
 */

/** Matches GoldButton / OutlineButton geometry. Those two draw in `ean-gold`,
 *  which is the wash this button sits on, so they would render invisible here. */
const BUTTON_BASE =
  'font-ui font-semibold text-[11.5px] uppercase tracking-[0.08em] px-6 py-3 transition-colors duration-300 inline-flex items-center justify-center gap-2 rounded-none border cursor-pointer';

/** Written on the card element by `pointermove`, read by the spotlight layer.
 *  The gradient is an inline style because Tailwind cannot compose a colour stop
 *  around a custom property that is only written at runtime. */
const SPOTLIGHT: React.CSSProperties = {
  background:
    'radial-gradient(320px circle at var(--ean-mx, 50%) var(--ean-my, 0%), color-mix(in srgb, var(--color-ean-gold-light) 55%, transparent), transparent 68%)',
};

interface ServiceCardProps {
  service: ServiceRichData;
  /** Passed in: the page owns the grid, so it owns the width these resolve to. */
  sizes: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ServiceCard({
  service,
  sizes,
  isExpanded,
  onToggle,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const isReducedRef = useRef(false);

  const panelId = `service-detail-${service.slug}`;
  const detailHref = `/services/${service.slug}`;
  const primaryHref = service.primaryButtonHref ?? `/contact?service=${service.slug}`;
  const primaryText = service.primaryButtonText ?? 'Make an Inquiry';
  const secondaryHref = service.secondaryButtonHref ?? detailHref;
  const secondaryText = service.secondaryButtonText ?? 'View Details';

  useEffect(() => {
    isReducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (isReducedRef.current) return;
    // Coalesce to one write per frame. `pointermove` fires far faster than the
    // compositor paints, and every write invalidates the gradient.
    if (frameRef.current !== null) return;
    const { clientX, clientY } = event;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--ean-mx', `${clientX - rect.left}px`);
      el.style.setProperty('--ean-my', `${clientY - rect.top}px`);
    });
  }, []);

  return (
    <article
      ref={cardRef}
      id={service.slug}
      onPointerMove={handlePointerMove}
      // Height is fixed, and set by the tightest case rather than the average:
      // the open panel grows upward from `mt-auto`, so anything it cannot fit
      // clips against the top edge. The base step is the tallest because it is
      // the narrowest — one column at ~327px wraps the features to two lines
      // each and stacks the two calls to action. By `sm` the card is ~590px
      // wide and the same content needs ~60px less.
      className={`group relative isolate flex h-[660px] w-full flex-col overflow-hidden border scroll-mt-28 transition-[border-color,box-shadow] duration-500 sm:h-[620px] lg:h-[640px] ${
        isExpanded
          ? 'border-ean-gold-light shadow-[0_24px_60px_-20px_rgba(43,0,152,0.55)]'
          : 'border-ean-border-light hover:border-ean-gold-light hover:shadow-[0_24px_60px_-20px_rgba(43,0,152,0.55)] focus-within:border-ean-gold-light'
      }`}
    >
      {/* Decorative — the card's own <h3> names the service two elements below. */}
      <Image
        src={service.image}
        alt=""
        fill
        sizes={sizes}
        quality={80}
        // The same low anchoring the homepage showcase uses. Three of these
        // frames are 400x560 portraits whose subject sits in the lower half, so
        // a centred crop of a tall card keeps mostly ceiling and sky.
        style={service.imagePosition ? { objectPosition: service.imagePosition } : undefined}
        className={`object-cover transition-transform duration-[900ms] ease-out ${
          isExpanded ? 'scale-[1.06]' : 'group-hover:scale-[1.08]'
        }`}
      />

      {/* Resting scrim — holds the title legible before any interaction. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-linear-to-t from-black/85 via-black/35 to-black/10"
      />

      {/*
       * The three reveal layers, and every reveal below, follow one rule:
       * pinned (`isExpanded`) wins outright, otherwise `sm:group-hover` drives
       * it on pointer devices and `group-focus-within` on the keyboard. The
       * hover variant is held at `sm:` because on a touch device hover latches
       * on tap and would fight the pinned state the button owns.
       */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 z-10 bg-ean-gold/85 backdrop-blur-[2px] transition-opacity duration-500 ${
          isExpanded
            ? 'opacity-100'
            : 'opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100'
        }`}
      />

      <div
        aria-hidden="true"
        style={SPOTLIGHT}
        className={`absolute inset-0 z-10 transition-opacity duration-500 ${
          isExpanded
            ? 'opacity-100'
            : 'opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100'
        }`}
      />

      {/* Technical corner brackets — the mono/aviation register the eyebrows,
          basis lines and ops strips elsewhere on the site are set in. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-4 z-20">
        <span
          className={`absolute left-0 top-0 h-5 w-5 border-l border-t border-white/70 transition-opacity duration-500 ${
            isExpanded
              ? 'opacity-100'
              : 'opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100'
          }`}
        />
        <span
          className={`absolute right-0 top-0 h-5 w-5 border-r border-t border-white/70 transition-opacity duration-500 ${
            isExpanded
              ? 'opacity-100'
              : 'opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100'
          }`}
        />
        <span
          className={`absolute bottom-0 left-0 h-5 w-5 border-b border-l border-white/70 transition-opacity duration-500 ${
            isExpanded
              ? 'opacity-100'
              : 'opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100'
          }`}
        />
        <span
          className={`absolute bottom-0 right-0 h-5 w-5 border-b border-r border-white/70 transition-opacity duration-500 ${
            isExpanded
              ? 'opacity-100'
              : 'opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100'
          }`}
        />
      </div>

      {/*
       * The whole card is the disclosure control. It sits under the content
       * layer, which is `pointer-events-none` apart from the links inside it, so
       * a tap anywhere on the photograph pins the panel open while the title and
       * the two calls to action still receive their own clicks.
       */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="absolute inset-0 z-20 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
      >
        <span className="sr-only">
          {isExpanded ? `Hide details for ${service.name}` : `Show details for ${service.name}`}
        </span>
      </button>

      <div className="pointer-events-none relative z-30 flex h-full flex-col p-6 sm:p-7">
        <div className="mt-auto space-y-3.5">
          {service.stats && service.stats.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {service.stats.map((stat) => (
                <span
                  key={stat}
                  className="border border-white/25 bg-white/10 px-2.5 py-1 font-ui text-[10.5px] font-medium text-white"
                >
                  {stat}
                </span>
              ))}
            </div>
          )}

          <Link href={detailHref} className="pointer-events-auto group/title block w-fit">
            <h3 className="font-display text-2xl font-light leading-tight tracking-tight text-white transition-colors duration-300 group-hover/title:text-ean-muted-dark lg:text-[26px]">
              {service.name}
            </h3>
          </Link>

          <div
            className={`h-[2px] bg-white transition-all duration-500 ease-out ${
              isExpanded ? 'w-full' : 'w-10 sm:group-hover:w-full group-focus-within:w-full'
            }`}
          />

          <div
            id={panelId}
            className={`grid transition-[grid-template-rows] duration-500 ease-out ${
              isExpanded
                ? 'grid-rows-[1fr]'
                : 'grid-rows-[0fr] sm:group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`space-y-4 pt-3 transition-opacity delay-100 duration-500 ${
                  isExpanded
                    ? 'opacity-100'
                    : 'opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100'
                }`}
              >
                {/*
                 * `short`, not `extendedDescription`, on every card including
                 * the wide ones. This is a choice between two complete,
                 * purpose-written sentences, not a truncation — the extended
                 * copy is what `/services/[slug]` opens with.
                 *
                 * It is `short` because the wide cards are only wide at `lg`.
                 * At `md` the grid is two columns and the same card is ~340px,
                 * where the ~250-character extended text runs six lines; six
                 * lines plus four features plus two buttons overruns the card by
                 * about 25px and clips at the top edge. A responsive swap would
                 * mean rendering both strings and hiding one, which reads the
                 * description twice to a screen reader.
                 */}
                <p className="font-ui text-[13px] leading-relaxed text-white/90">
                  {service.short}
                </p>

                <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 border-t border-white/20 pt-3.5 font-ui text-xs text-white/90">
                  {service.features.map((feature, featureIndex) => (
                    <li
                      key={feature}
                      style={{ transitionDelay: `${140 + featureIndex * 70}ms` }}
                      className={`flex items-start gap-2 transition-[opacity,transform] duration-500 ${
                        isExpanded
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-1.5 opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'
                      }`}
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-3 pt-0.5 sm:flex-row sm:items-center">
                  <Link
                    href={primaryHref}
                    className={`${BUTTON_BASE} pointer-events-auto border-ean-white bg-ean-white text-ean-gold hover:border-ean-muted-dark hover:bg-ean-muted-dark`}
                  >
                    {primaryText}
                  </Link>
                  <Link
                    href={secondaryHref}
                    className="pointer-events-auto group/cta inline-flex items-center gap-1.5 font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:text-ean-muted-dark"
                  >
                    <span>{secondaryText}</span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Visual affordance only. The accessible name and the click target
              both belong to the full-card button above. */}
          <div
            aria-hidden="true"
            className="border-t border-white/20 pt-3 font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
          >
            {isExpanded ? 'Close' : 'Explore Service'}
          </div>
        </div>
      </div>
    </article>
  );
}
