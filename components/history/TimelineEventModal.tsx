'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto select-none">
          {/* Dark Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl bg-gradient-to-b from-[#1E050B] via-[#140307] to-[#0D0204] text-white border border-ean-gold/40 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
          >
            {/* Header Strip */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3B0913] via-[#2A050D] to-[#1E050B] border-b border-white/10 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 bg-ean-gold/15 border border-ean-gold/30 rounded-xs text-ean-gold font-mono text-xs font-bold">
                  {event.year}
                </span>
                <span className="font-ui text-xs font-semibold tracking-widest text-ean-gold uppercase flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-ean-gold" />
                  <span>{event.category || 'Historical Milestone'}</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close milestone detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Optional Visual Image Banner */}
              {event.image && (
                <div className="relative w-full h-56 sm:h-72 rounded-xs overflow-hidden border border-white/15 shadow-xl group">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 700px"
                    className="object-cover"
                    quality={95}
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140307] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span className="font-mono text-4xl sm:text-5xl font-extrabold text-ean-gold/90 drop-shadow-md">
                      {event.year}
                    </span>
                    <span className="px-3 py-1 bg-black/80 backdrop-blur-xs border border-white/20 text-xs font-ui text-white rounded-xs">
                      EAN Aviation Archives
                    </span>
                  </div>
                </div>
              )}

              {/* Title & Concise Summary */}
              <div className="space-y-3">
                <h2 className="font-display text-3xl sm:text-4xl font-light text-white leading-tight">
                  {event.title}
                </h2>
                <div className="p-4 bg-[#2A050D]/80 border-l-4 border-ean-gold rounded-r-xs font-ui text-sm sm:text-base text-ean-gold-light leading-relaxed">
                  {event.description}
                </div>
              </div>

              {/* Full Narrative Breakdown */}
              {event.story && event.story.length > 0 && (
                <div className="space-y-4 border-t border-white/10 pt-6">
                  <span className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-white/50 block">
                    Detailed Narrative & Strategic Impact
                  </span>
                  <div className="space-y-3 font-ui text-sm sm:text-base text-white/80 leading-relaxed">
                    {event.story.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Highlights */}
              {event.highlights && event.highlights.length > 0 && (
                <div className="space-y-3 border-t border-white/10 pt-6">
                  <span className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-ean-gold block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-ean-gold" />
                    Key Milestone Achievements
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-ui text-xs sm:text-sm text-white/90">
                    {event.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5 bg-white/5 border border-white/10 p-3 rounded-xs">
                        <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                        <span className="leading-snug">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer Action Strip */}
            <div className="px-6 py-4 bg-[#140307] border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/40 font-ui hidden sm:inline-block font-mono">
                EAN Aviation History & Heritage
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 rounded-xs text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Detail
                </button>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-ean-gold text-ean-navy hover:bg-ean-gold-light text-xs font-bold uppercase tracking-wider rounded-xs transition-all"
                >
                  <span>Inquire Operations</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
