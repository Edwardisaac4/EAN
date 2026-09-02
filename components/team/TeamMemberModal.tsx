'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Presence from '@/components/shared/Presence';
import { X, ShieldCheck, Quote, Mail } from 'lucide-react';
import { TeamMember } from '@/lib/constants';

interface TeamMemberModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamMemberModal({ member, isOpen, onClose }: TeamMemberModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // The parent clears `member` at the same moment it flips `isOpen` false. An
  // early `return null` on a null member therefore unmounted the whole subtree
  // before Presence could hold it for its 350ms exit, so the closing animation
  // never played. Retaining the last non-null member lets the card animate out
  // with its content intact. Adjusted during render rather than in an effect —
  // see "You Might Not Need an Effect".
  const [lastMember, setLastMember] = useState<TeamMember | null>(member);
  if (member && member !== lastMember) {
    setLastMember(member);
  }
  const activeMember = member ?? lastMember;

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

  // Focus moves into the dialog on open and returns to the trigger on close, so
  // a keyboard user is not left tabbing the page behind an open modal, or
  // dumped at the top of the document once it closes.
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      // One frame later: Presence has mounted the card by then.
      const frame = requestAnimationFrame(() => dialogRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }

    previouslyFocusedRef.current?.focus();
    previouslyFocusedRef.current = null;
  }, [isOpen]);

  if (!activeMember) return null;

  return (
    <Presence show={isOpen} durationMs={350}>
      {(state) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={onClose}
            className={`fixed inset-0 bg-black/75 backdrop-blur-xl backdrop-saturate-150 cursor-pointer ${
              state === 'open' ? 'ean-enter-fade' : 'ean-exit-fade'
            }`}
          />

          {/* Modal Card Window */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`${state === 'open' ? 'ean-enter-modal' : 'ean-exit-modal'} relative w-full max-w-4xl bg-linear-to-b from-white via-ean-surface to-ean-surface border border-ean-gold/40 md: shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col focus:outline-none`}
          >
            {/* Executive Close Button Header */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4.5 bg-linear-to-r from-ean-burgundy via-ean-burgundy-accent to-ean-burgundy-rich border-b border-ean-gold/30 shadow-md">
              <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-ean-gold">
                <ShieldCheck className="w-4 h-4 text-ean-gold" />
                <span>Executive Bio Profile</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-ean-text-light/80 hover:text-ean-text-light hover:bg-black/20 transition-all cursor-pointer"
                aria-label="Close bio profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Member Portrait Column */}
                <div className="md:col-span-4 space-y-4">
                  <div className="relative aspect-4/5 overflow-hidden border border-ean-gold/30 shadow-lg bg-ean-navy">
                    <Image
                      src={activeMember.image}
                      alt={activeMember.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover object-top"
                      quality={80}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="p-4 bg-white border border-ean-gold/25 shadow-xs space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-ean-gold font-bold">
                      Department
                    </div>
                    <div className="text-sm font-bold text-ean-text-light font-ui">
                      {activeMember.departmentLabel}
                    </div>
                  </div>
                </div>

                {/* Member Bio Information */}
                <div className="md:col-span-8 space-y-6">
                  <div>
                    <span className="font-ui text-xs font-bold uppercase tracking-[0.25em] text-ean-gold">
                      {activeMember.departmentLabel}
                    </span>
                    <h2 id={titleId} className="font-display text-2xl sm:text-3xl font-light text-ean-text-light mt-1">
                      {activeMember.name}
                    </h2>
                    <p className="font-ui text-base text-ean-text-light font-semibold mt-1">
                      {activeMember.role}
                    </p>
                  </div>

                  {/* Signature Quote */}
                  {activeMember.quote && (
                    <div className="p-5 bg-linear-to-r from-ean-gold/15 via-white to-white border-l border-ean-gold shadow-xs font-display italic text-sm sm:text-base text-ean-text-light relative overflow-hidden">
                      <Quote className="w-6 h-6 text-ean-gold/30 absolute top-3 right-3" />
                      &ldquo;{activeMember.quote}&rdquo;
                    </div>
                  )}

                  {/* Bio Paragraphs */}
                  <div className="space-y-4 font-ui text-sm sm:text-base text-slate-700 leading-relaxed">
                    {activeMember.bio.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Credentials & Qualifications Tags */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs uppercase font-mono tracking-widest text-ean-gold font-bold">
                      Qualifications & Credentials
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeMember.credentials.map((cred, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-full font-ui text-xs font-medium shadow-xs hover:border-ean-blue/60 transition-colors"
                        >
                          {cred}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metric Highlights Grid */}
                  {activeMember.highlights && activeMember.highlights.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      {activeMember.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="bg-linear-to-br from-white to-ean-surface p-4 border border-ean-gold/30 shadow-xs">
                          <div className="font-display text-2xl font-bold text-ean-text-light">{h.value}</div>
                          <div className="font-ui text-[10px] uppercase tracking-wider text-slate-600 font-semibold">{h.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action Strip */}
            <div className="px-6 py-4 bg-white border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-ui hidden sm:inline-block font-medium">
                EAN Aviation Executive Leadership
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-ean-navy hover:bg-ean-navy-mid text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Presence>
  );
}
