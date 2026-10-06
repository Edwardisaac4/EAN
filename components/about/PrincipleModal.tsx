'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Presence from '@/components/shared/Presence';
import { X, ShieldCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ValuePillar } from '@/lib/constants';
import GoldButton from '@/components/shared/GoldButton';

interface PrincipleModalProps {
  pillar: ValuePillar | null;
  index: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function PrincipleModal({ pillar, index, isOpen, onClose }: PrincipleModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const [lastPillar, setLastPillar] = useState<ValuePillar | null>(pillar);
  if (pillar && pillar !== lastPillar) {
    setLastPillar(pillar);
  }
  const activePillar = pillar ?? lastPillar;

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

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      const frame = requestAnimationFrame(() => dialogRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }

    previouslyFocusedRef.current?.focus();
    previouslyFocusedRef.current = null;
  }, [isOpen]);

  if (!activePillar) return null;

  return (
    <Presence show={isOpen} durationMs={350}>
      {(state) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
          {/* Backdrop Overlay */}
          <div
            onClick={onClose}
            className={`fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer ${
              state === 'open' ? 'ean-enter-fade' : 'ean-exit-fade'
            }`}
          />

          {/* Modal Card */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`${
              state === 'open' ? 'ean-enter-modal' : 'ean-exit-modal'
            } relative w-full max-w-3xl bg-ean-obsidian border border-ean-border-dark shadow-2xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col focus:outline-none text-white`}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-ean-navy-mid border-b border-ean-border-dark">
              <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>EAN Core Principle 0{index + 1}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Photo Banner */}
              <div className="relative h-56 sm:h-64 w-full overflow-hidden border border-ean-border-dark bg-black">
                <Image
                  src={activePillar.image || '/images/about-jet.jpg'}
                  alt={activePillar.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                  quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="font-ui text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
                      Principle 0{index + 1}
                    </span>
                    <h2 id={titleId} className="font-display text-2xl sm:text-3xl font-light text-white mt-1">
                      {activePillar.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Description Content */}
              <div className="space-y-4">
                <div className="w-12 h-[2px] bg-blue-400" />
                <p className="font-ui text-base text-white/90 leading-relaxed">
                  {activePillar.description}
                </p>
              </div>

              {/* Core Standards Checklist */}
              <div className="p-5 bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs uppercase font-mono tracking-widest text-blue-300 font-semibold">
                  EAN Aviation Quality Benchmark
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-ui text-xs text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>NCAA Approved & Audited</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>24/7 Operations Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Dedicated VIP Handling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>International Flight Dispatch</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-ean-navy-mid border-t border-ean-border-dark flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-white/60 font-ui hidden sm:inline-block">
                EAN Aviation Standard of Excellence
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 border border-white/20 text-white/80 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <Link href="/contact" className="w-full sm:w-auto">
                  <GoldButton className="w-full sm:w-auto px-5 py-2.5 text-xs">
                    <span>Contact Operations</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </GoldButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </Presence>
  );
}
