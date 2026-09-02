'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

import Presence from '@/components/shared/Presence';
import SectionReveal from '@/components/shared/SectionReveal';
import {
  SITE_GALLERY,
  SITE_GALLERY_INTRO,
  AEROPLEX_SECTION_IDS,
  type AeroplexGalleryItem,
} from '@/lib/aeroplex-constants';

/**
 * Column spans, written out rather than interpolated. `lg:col-span-${span}` would
 * never reach the stylesheet — Tailwind scans source text, so a class that only
 * exists once a template literal is evaluated is not generated.
 */
const SPAN_CLASSES: Record<AeroplexGalleryItem['span'], string> = {
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
};

/** Matches .ean-enter-modal / .ean-exit-modal in globals.css. */
const EXIT_MS = 350;

export default function SiteGallery() {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Retained through the exit animation: clearing openIndex is what closes the
  // viewer, so reading the item from it directly would blank the card mid-fade.
  // Adjusted during render rather than in an effect, the same way
  // TeamMemberModal holds its last member — see "You Might Not Need an Effect".
  const [lastIndex, setLastIndex] = useState(0);
  if (openIndex !== null && openIndex !== lastIndex) {
    setLastIndex(openIndex);
  }

  const isOpen = openIndex !== null;
  const activeIndex = openIndex ?? lastIndex;
  const activeItem = SITE_GALLERY[activeIndex];

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback((delta: number) => {
    setOpenIndex((current) => {
      if (current === null) return current;
      // Wraps in both directions, so the arrow keys never dead-end.
      return (current + delta + SITE_GALLERY.length) % SITE_GALLERY.length;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close, step]);

  // Focus enters the dialog on open and returns to the tile that opened it, so a
  // keyboard visitor is neither left tabbing the page behind the viewer nor
  // dumped at the top of the document on close.
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      const frame = requestAnimationFrame(() => dialogRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }

    previouslyFocusedRef.current?.focus();
    previouslyFocusedRef.current = null;
  }, [isOpen]);

  return (
    <section
      id={AEROPLEX_SECTION_IDS.gallery}
      className="scroll-mt-24 bg-ean-black text-ean-text-light py-20 sm:py-24"
    >
      <div className="max-w-ean mx-auto px-6 md:px-8">
        <SectionReveal className="max-w-3xl space-y-4 mb-12" stagger={0.1} distance={40} duration={1}>
          <span data-reveal className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
            {SITE_GALLERY_INTRO.eyebrow}
          </span>
          <h2 data-reveal className="font-display text-3xl sm:text-4xl font-light leading-tight">
            {SITE_GALLERY_INTRO.title}
          </h2>
          <p data-reveal className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
            {SITE_GALLERY_INTRO.standfirst}
          </p>
        </SectionReveal>

        <SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
            {SITE_GALLERY.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`Open larger view: ${item.caption}`}
                className={`group relative h-60 sm:h-64 lg:h-80 overflow-hidden border border-ean-border-dark hover:border-ean-blue/60 focus-visible:border-ean-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ean-blue transition-colors duration-300 cursor-pointer text-left ${SPAN_CLASSES[item.span]}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 60vw"
                  quality={80}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/25 to-transparent opacity-90" />

                <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ean-gold border border-ean-gold/40 bg-ean-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                  {item.tag}
                </span>

                <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between gap-4">
                  <p className="font-ui text-sm text-white font-medium leading-snug line-clamp-2 max-w-[85%]">
                    {item.caption}
                  </p>
                  <span
                    aria-hidden="true"
                    className="w-8 h-8 rounded-full border border-ean-border-dark bg-ean-black/70 flex items-center justify-center text-ean-gold group-hover:border-ean-blue group-hover:text-ean-blue-light transition-colors shrink-0"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </SectionReveal>
      </div>

      <Presence show={openIndex !== null} durationMs={EXIT_MS}>
        {(state) => (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <div
              onClick={() => setOpenIndex(null)}
              className={`fixed inset-0 bg-black/90 backdrop-blur-lg cursor-pointer ${state === 'open' ? 'ean-enter-fade' : 'ean-exit-fade'
                }`}
            />

            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className={`${state === 'open' ? 'ean-enter-modal' : 'ean-exit-modal'
                } relative z-10 w-full max-w-5xl bg-ean-black border border-ean-border-dark hover:border-ean-blue/40 shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden focus:outline-none`}
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-ean-border-dark bg-ean-navy-mid">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-ean-gold">
                  {activeItem ? `${activeIndex + 1} / ${SITE_GALLERY.length} — ${activeItem.tag}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenIndex(null)}
                  aria-label="Close modal"
                  className="p-2 -mr-2 rounded-full text-ean-text-light/80 hover:text-ean-text-light hover:border-ean-blue/50 hover:bg-black/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-16/10 w-full bg-ean-black">
                {activeItem && (
                  <Image
                    src={activeItem.src}
                    alt={activeItem.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 896px"
                    quality={90}
                    className="object-contain"
                  />
                )}

                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ean-black/70 border border-ean-border-dark hover:border-ean-blue/60 hover:text-ean-blue-light text-ean-text-light flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ean-black/70 border border-ean-border-dark hover:border-ean-blue/60 hover:text-ean-blue-light text-ean-text-light flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <p
                id={titleId}
                className="px-5 py-4 border-t border-ean-border-dark font-ui text-sm text-ean-muted-light leading-relaxed"
              >
                {activeItem?.caption}
              </p>
            </div>
          </div>
        )}
      </Presence>
    </section>
  );
}
