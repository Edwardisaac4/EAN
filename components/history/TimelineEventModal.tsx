'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Presence from '@/components/shared/Presence';
import { X, CheckCircle2, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { TimelineEvent } from '@/lib/constants';

interface TimelineEventModalProps {
  event: TimelineEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TimelineEventModal({ event, isOpen, onClose }: TimelineEventModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!event) return null;

  return (
    <Presence show={isOpen} durationMs={350}>
      {(state) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
          {/* Dark Backdrop Overlay */}
          <div
            onClick={onClose}
            className={`fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer ${
              state === 'open' ? 'ean-enter-fade' : 'ean-exit-fade'
            }`}
          />

          {/* Modal Card Window */}
          <div
            className={`${state === 'open' ? 'ean-enter-modal' : 'ean-exit-modal'} relative w-full max-w-3xl bg-linear-to-b from-ean-burgundy-deep via-ean-burgundy-dark to-ean-black text-ean-text-light border border-ean-gold/40 shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col`}
          >
            {/* Header Strip */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-linear-to-r from-ean-burgundy-rich via-ean-burgundy-dusk to-ean-burgundy-deep border-b border-ean-border-dark shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 bg-ean-gold/15 border border-ean-gold/30 text-ean-gold font-mono text-xs font-bold">
                  {event.year}
                </span>
                <span className="font-ui text-xs font-semibold tracking-widest text-ean-gold uppercase flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-ean-gold" />
                  <span>{event.category || 'Historical Milestone'}</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-ean-text-light/70 hover:text-ean-text-light hover:bg-black/10 transition-colors cursor-pointer"
                aria-label="Close milestone detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Optional Visual Image Banner */}
              {event.image && (
                <div className="relative w-full h-56 sm:h-72 overflow-hidden border border-ean-border-dark group">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 700px"
                    className="object-cover"
                    quality={80}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-ean-burgundy-dark via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span className="font-mono text-4xl sm:text-5xl font-extrabold text-ean-gold/90 drop-shadow-md">
                      {event.year}
                    </span>
                    <span className="px-3 py-1 bg-ean-black/80 backdrop-blur-xs border border-ean-border-dark text-xs font-ui text-ean-text-light">
                      EAN Aviation Archives
                    </span>
                  </div>
                </div>
              )}

              {/* Title & Concise Summary */}
              <div className="space-y-3">
                <h2 className="font-display text-2xl sm:text-3xl font-light text-ean-text-light leading-tight">
                  {event.title}
                </h2>
                <div className="p-4 bg-ean-navy/80 border-l border-ean-gold font-ui text-sm sm:text-base text-ean-gold-light leading-relaxed">
                  {event.description}
                </div>
              </div>

              {/* Full Narrative Breakdown */}
              {event.story && event.story.length > 0 && (
                <div className="space-y-4 border-t border-ean-border-dark pt-6">
                  <span className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-ean-text-light/50 block">
                    Detailed Narrative & Strategic Impact
                  </span>
                  <div className="space-y-3 font-ui text-sm sm:text-base text-ean-text-light/80 leading-relaxed">
                    {event.story.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Highlights */}
              {event.highlights && event.highlights.length > 0 && (
                <div className="space-y-3 border-t border-ean-border-dark pt-6">
                  <span className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-ean-gold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-ean-gold" />
                    Key Milestone Achievements
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-ui text-xs sm:text-sm text-ean-text-light/90">
                    {event.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5 bg-black/5 border border-ean-border-dark p-3">
                        <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                        <span className="leading-snug">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer Action Strip */}
            <div className="px-6 py-4 bg-ean-burgundy-dark border-t border-ean-border-dark flex items-center justify-between">
              <span className="text-xs text-ean-text-light/40 hidden sm:inline-block font-ui">
                EAN Aviation History & Heritage
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 border border-ean-border-dark text-ean-text-light/80 hover:text-ean-blue-light hover:border-ean-blue/50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Detail
                </button>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-ean-gold text-ean-text-dark hover:bg-ean-gold-light text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <span>Inquire Operations</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </Presence>
  );
}
