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
      className="scroll-mt-24 bg-ean-black text-white py-20 sm:py-24"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <SectionReveal className="max-w-3xl space-y-4 mb-12">
          <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
            {SITE_GALLERY_INTRO.eyebrow}
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-light leading-tight">
            {SITE_GALLERY_INTRO.title}
          </h2>
          <p className="font-ui text-base sm:text-lg text-ean-muted-light leading-relaxed">
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
                className={`group relative h-60 sm:h-64 lg:h-80 overflow-hidden rounded-xs border border-ean-border-dark hover:border-ean-gold/50 focus-visible:border-ean-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ean-gold transition-colors duration-300 cursor-pointer text-left ${SPAN_CLASSES[item.span]}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 60vw"
                  quality={80}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ean-black via-ean-black/25 to-transparent opacity-90" />

                <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ean-gold border border-ean-gold/40 bg-ean-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                  {item.tag}
                </span>

                <span className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ean-black/70 border border-white/15 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-4 h-4" />
                </span>

                <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5 block font-ui text-xs sm:text-sm text-white/90 leading-relaxed">
                  {item.caption}
                </span>
              </button>
            ))}
          </div>
        </SectionReveal>
      </div>

      <Presence show={isOpen} durationMs={EXIT_MS}>
        {(state) => (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <div
              onClick={close}
              className={`fixed inset-0 bg-ean-black-pure/90 backdrop-blur-lg cursor-pointer ${
                state === 'open' ? 'ean-enter-fade' : 'ean-exit-fade'
              }`}
            />

            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className={`${
                state === 'open' ? 'ean-enter-modal' : 'ean-exit-modal'
              } relative z-10 w-full max-w-5xl bg-ean-black border border-ean-gold/30 rounded-xs shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden focus:outline-none`}
            >
              <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-ean-border-dark bg-ean-navy-mid">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ean-gold shrink-0">
                    {activeItem.tag}
                  </span>
                  <span className="font-mono text-[10px] text-ean-muted-light shrink-0">
                    {activeIndex + 1} / {SITE_GALLERY.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close image viewer"
                  className="p-2 -mr-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative bg-ean-black-pure">
                {/* object-contain, not cover: these frames have different aspect
                    ratios and the viewer is where the whole photograph should be
                    visible. */}
                <div className="relative w-full aspect-4/3 sm:aspect-video">
                  <Image
                    src={activeItem.src}
                    alt={activeItem.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    quality={80}
                    className="object-contain"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ean-black/70 border border-white/15 hover:border-ean-gold/60 hover:text-ean-gold text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ean-black/70 border border-white/15 hover:border-ean-gold/60 hover:text-ean-gold text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <p
                id={titleId}
                className="px-5 py-4 border-t border-ean-border-dark font-ui text-sm text-ean-muted-light leading-relaxed"
              >
                {activeItem.caption}
              </p>
            </div>
          </div>
        )}
      </Presence>
    </section>
  );
}
