'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';

import { VIEW_ONLY_PROPS } from '@/components/credentials/view-only';
import Eyebrow from '@/components/shared/Eyebrow';
import Presence from '@/components/shared/Presence';
import { formatCertificateDate, getIssuer, type Certificate } from '@/lib/credentials-constants';

interface CertificateViewerProps {
  /** The set the arrows step through, in order. */
  certificates: Certificate[];
  /** The certificate on show, or null while the viewer is closed. */
  openIndex: number | null;
  onOpenIndexChange: (index: number | null) => void;
}

/** Matches .ean-enter-modal / .ean-exit-modal in globals.css. */
const EXIT_MS = 350;

const DEFAULT_HOLDER = 'EAN Aviation Limited';

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ean-slate">{label}</dt>
      <dd className="font-ui text-sm text-ean-text-light">{value}</dd>
    </div>
  );
}

/**
 * The full certificate with its issuer, holder, number and dates, over a
 * dimmed page. Shared by the /credentials grid (CertificateGallery) and the
 * service-hero corner (HeroCertificates); each owns which certificate is open.
 */
export default function CertificateViewer({
  certificates,
  openIndex,
  onOpenIndexChange,
}: CertificateViewerProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Retained through the exit animation, as in SiteGallery: clearing openIndex
  // is what closes the viewer, so reading from it directly would blank the
  // certificate mid-fade.
  const [lastIndex, setLastIndex] = useState(0);
  if (openIndex !== null && openIndex !== lastIndex) {
    setLastIndex(openIndex);
  }

  const isOpen = openIndex !== null;
  const activeIndex = openIndex ?? lastIndex;
  const active = certificates[activeIndex];
  const activeIssuer = active ? getIssuer(active.issuer) : null;
  const certificateCount = certificates.length;
  const hasSiblings = certificateCount > 1;

  const close = useCallback(() => onOpenIndexChange(null), [onOpenIndexChange]);

  const step = useCallback(
    (delta: number) => {
      if (openIndex === null || certificateCount === 0) return;
      onOpenIndexChange((openIndex + delta + certificateCount) % certificateCount);
    },
    [openIndex, certificateCount, onOpenIndexChange],
  );

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

  // Focus enters the viewer on open and returns to whatever opened it.
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
    <Presence show={isOpen} durationMs={EXIT_MS}>
      {(state) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <div
            onClick={close}
            className={`fixed inset-0 bg-black/90 backdrop-blur-lg cursor-pointer ${
              state === 'open' ? 'ean-enter-fade' : 'ean-exit-fade'
            }`}
          />

          {/* Full height of the window, capped, so a portrait A4 certificate
              shows whole on a 620px-tall laptop screen without scrolling. On
              large screens the details sit beside the scan rather than under
              it, which is what buys the scan that height. */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`${
              state === 'open' ? 'ean-enter-modal' : 'ean-exit-modal'
            } relative z-10 flex h-dvh w-full max-w-6xl flex-col overflow-y-auto bg-ean-black shadow-[0_30px_70px_rgba(0,0,0,0.6)] focus:outline-none sm:h-[calc(100dvh-2rem)] sm:max-h-240 sm:border sm:border-ean-border-dark lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:overflow-hidden`}
          >
            <div className="relative h-[70dvh] shrink-0 bg-ean-navy lg:h-auto lg:min-h-0">
              {active && activeIssuer && (
                <Image
                  // Keyed so stepping to the next certificate swaps the
                  // image outright instead of briefly stretching the old one
                  // into the new one's box.
                  key={active.id}
                  src={active.scan.src}
                  alt={`${active.title}, issued by ${activeIssuer.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 860px"
                  quality={90}
                  className="object-contain p-3 sm:p-5 select-none [-webkit-touch-callout:none] drop-shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
                  {...VIEW_ONLY_PROPS}
                />
              )}

              {hasSiblings && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous certificate"
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-ean-border-dark bg-ean-black/90 text-ean-text-light transition-colors hover:border-ean-blue hover:text-ean-blue cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next certificate"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-ean-border-dark bg-ean-black/90 text-ean-text-light transition-colors hover:border-ean-blue hover:text-ean-blue cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-col border-t border-ean-border-dark lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-l">
              <div className="flex items-center justify-between gap-4 border-b border-ean-border-dark px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ean-slate">
                  {hasSiblings ? `${activeIndex + 1} / ${certificateCount}` : 'Certificate'}
                </span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close certificate"
                  className="-mr-2 rounded-full p-2 text-ean-text-light/70 transition-colors hover:bg-ean-navy hover:text-ean-text-light cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {active && activeIssuer && (
                <div className="grid gap-5 p-5 sm:p-6">
                  <div className="grid gap-2">
                    <Eyebrow>{activeIssuer.name}</Eyebrow>
                    <h2
                      id={titleId}
                      className="font-display text-2xl font-light leading-tight text-ean-text-light"
                    >
                      {active.title}
                    </h2>
                  </div>

                  <dl className="grid gap-3 border-t border-ean-border-dark pt-5">
                    <MetaRow label="Held by" value={active.holder ?? DEFAULT_HOLDER} />
                    {active.reference && <MetaRow label="Certificate no." value={active.reference} />}
                    {active.issued && (
                      <MetaRow label="Issued" value={formatCertificateDate(active.issued)} />
                    )}
                    {active.validUntil && (
                      <MetaRow label="Valid until" value={formatCertificateDate(active.validUntil)} />
                    )}
                  </dl>

                  {/* Off-site, so a plain <a> with the noopener pairing, as
                      on the History milestones. */}
                  {active.verifyUrl && (
                    <a
                      href={active.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 border border-ean-blue bg-ean-blue px-5 py-3 font-ui text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-ean-blue-light hover:border-ean-blue-light"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span>{active.verifyLabel || `Verify with ${activeIssuer.shortName}`}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Presence>
  );
}
