'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import { VIEW_ONLY_PROPS } from '@/components/credentials/view-only';
import { getIssuer, type Certificate } from '@/lib/credentials-constants';

interface HeroCertificatesProps {
  /** This service's certificates in force, in the order they slide through. */
  certificates: Certificate[];
  /** Adds "View certificate" under the sheet (SERVICES_WITH_CERTIFICATE_LABEL). */
  showLabel?: boolean;
}

// Fetched on first open, or on hover or focus just before it, so none of the
// viewer's code rides along with the service page's first load.
const loadViewer = () => import('@/components/credentials/CertificateViewer');
const CertificateViewer = dynamic(loadViewer, { ssr: false });

/** How long the top certificate shows before it is tucked under the pile. */
const SLIDE_MS = 5000;

/** How long the outgoing sheet spends flicked out before it drops to the back. */
const TUCK_MS = 450;

const PILE_MOTION =
  'transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';

/** Where each sheet sits by its depth in the pile (0 is the top), in px and degrees. */
const PILE_SLOTS = [
  { x: 0, y: 0, rotate: 0 },
  { x: 12, y: -8, rotate: 7 },
  { x: -14, y: -4, rotate: -8 },
];

/** The outgoing sheet's flick out to the left, before it slides in behind. */
const TUCK_SLOT = { x: -120, y: -12, rotate: -14 };

/** How far the pile fans out while someone points at or focuses it. */
const FAN_SPREAD = 1.5;

/** The box the sheets sit in, width over height (aspect-3/4 below). */
const BOX_RATIO = 3 / 4;

/**
 * A sheet's own size inside the 3:4 box, so a landscape certificate in the
 * pile is its own shape rather than a portrait box with blank above it.
 */
function sheetSize(certificate: Certificate): { width: string; height: string } {
  const ratio = certificate.scan.width / certificate.scan.height;
  return ratio <= BOX_RATIO
    ? { width: `${(ratio / BOX_RATIO) * 100}%`, height: '100%' }
    : { width: '100%', height: `${(BOX_RATIO / ratio) * 100}%` };
}

/**
 * The bottom-right corner of a /services/[slug] hero: the certificate behind
 * that service, as the bare sheet with no frame or caption. Where there are
 * several, they sit in a loose pile, like Instagram's Instants stack in the
 * DM inbox: every five seconds the top sheet flicks out and tucks under the
 * rest, and the pile fans out a little on hover. Clicking opens the top one
 * in the viewer, which also steps through the rest.
 *
 * Out of flow, pinned to the hero section, so it adds no height to the hero.
 * Desktop only: it is the corner beside the button row from lg. Below lg the
 * copy and buttons take the full width, leaving no corner, so phones and
 * tablets get ServiceCertificateList in the page's "Operational Base &
 * Facilities" box instead.
 *
 * Built to leave the page's load untouched (AGENTS.md §8). The first sheet is
 * in the server HTML; the others get their images once the browser is idle. A
 * sheet is at most 160px wide, far smaller than the hero photograph that is
 * these pages' LCP element, so it cannot take LCP however late it paints.
 * Below lg it is display:none and its images are lazy, so a phone never
 * fetches them.
 */
export default function HeroCertificates({ certificates, showLabel = false }: HeroCertificatesProps) {
  const count = certificates.length;

  // The sheet on top of the pile; the rest follow it in order beneath.
  const [active, setActive] = useState(0);
  // The sheet that has just left the top, while it is flicked out to the
  // left and still above the pile; it then drops to the back.
  const [tucking, setTucking] = useState<number | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isEngaged, setIsEngaged] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [hasOpenedViewer, setHasOpenedViewer] = useState(false);

  // Held while someone is pointing at it or has it open, or is in another
  // tab, so no one comes back to find it has moved on.
  const isHeld = isEngaged || isTabHidden || viewerIndex !== null;

  // The sheets behind the first sit inside the viewport, so loading="lazy"
  // would not defer them; withholding their images until idle does, as with
  // the homepage hero's later slides.
  useEffect(() => {
    if (count < 2) return;
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(() => setIsReady(true), { timeout: 2500 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsTabHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Under reduced motion it never moves on its own; the viewer's arrows still
  // reach every certificate.
  useEffect(() => {
    if (count < 2 || !isReady || isHeld) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => {
      setTucking(active);
      setActive((active + 1) % count);
    }, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [active, count, isReady, isHeld]);

  // Runs to the end even if the pile is held meanwhile, so a sheet is never
  // left hanging outside it.
  useEffect(() => {
    if (tucking === null) return;
    const timer = setTimeout(() => setTucking(null), TUCK_MS);
    return () => clearTimeout(timer);
  }, [tucking]);

  if (count === 0) return null;

  const current = certificates[active];
  const isPile = count > 1;

  const engage = () => {
    setIsEngaged(true);
    void loadViewer();
  };

  const openViewer = () => {
    setHasOpenedViewer(true);
    setViewerIndex(active);
  };

  // Position, stacking and visibility of one sheet. A lone certificate sits
  // straight, as before. In a pile, sheets deeper than the slots wait hidden
  // under the bottom one (for a fourth certificate), and the ones behind the
  // top stay hidden until their images are let in.
  const sheetStyle = (index: number): React.CSSProperties => {
    const depth = (index - active + count) % count;
    const isTucking = index === tucking;
    const spread = isPile && isEngaged ? FAN_SPREAD : 1;
    const slot = isTucking
      ? TUCK_SLOT
      : isPile
        ? PILE_SLOTS[Math.min(depth, PILE_SLOTS.length - 1)]
        : PILE_SLOTS[0];
    const lift = isPile && isEngaged && depth === 0 ? -6 : 0;
    const isVisible = isTucking || (depth < PILE_SLOTS.length && (index === 0 || isReady));
    const scale = isTucking ? 1 : spread;
    const x = slot.x * scale;
    const y = slot.y * scale + lift;

    return {
      ...sheetSize(certificates[index]),
      transform: `translate(${x}px, ${y}px) rotate(${slot.rotate * scale}deg)`,
      zIndex: isTucking ? count + 1 : count - depth,
      opacity: isVisible ? 1 : 0,
    };
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden lg:block">
      {/* The same container as the hero copy, so the sheet's right edge lines
          up with the page's. pb-16 matches the section's own, which puts its
          foot level with the button row on a laptop-height window. */}
      <div className="mx-auto flex max-w-ean justify-end px-8 pb-16">
        <button
          type="button"
          onClick={openViewer}
          onPointerEnter={engage}
          onPointerLeave={() => setIsEngaged(false)}
          onFocus={engage}
          onBlur={() => setIsEngaged(false)}
          aria-label={`View certificate: ${current.title}`}
          className="group pointer-events-auto relative block aspect-3/4 w-32 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white xl:w-40"
        >
          {certificates.map((certificate, index) => (
            // Sized to the sheet itself and anchored bottom-right, so a
            // landscape certificate sits in the corner rather than floating
            // mid-box, and the shadow follows the paper. White underneath, so
            // a sheet whose image is still arriving reads as blank paper
            // rather than a shadow round a hole.
            <span
              key={certificate.id}
              style={sheetStyle(index)}
              className={`absolute right-0 bottom-0 origin-[50%_60%] bg-white shadow-[0_12px_28px_rgba(0,0,0,0.55)] ${
                isPile ? PILE_MOTION : 'transition-transform duration-500 group-hover:-translate-y-1'
              }`}
            >
              {(index === 0 || isReady) && (
                <Image
                  src={certificate.scan.src}
                  alt={`${certificate.title}, issued by ${getIssuer(certificate.issuer).name}`}
                  fill
                  sizes="(min-width: 1280px) 160px, 128px"
                  quality={80}
                  className="object-contain select-none [-webkit-touch-callout:none]"
                  {...VIEW_ONLY_PROPS}
                />
              )}
            </span>
          ))}

          {/* Hangs below the sheet in the section's bottom padding, so the
              sheet keeps its place level with the buttons and the hero keeps
              its height. Inside the button, so it opens the viewer too; styled
              as the hero's "All Aviation Services" link. */}
          {showLabel && (
            // As wide as the sheet on top and anchored where it is, so the
            // label centres on the paper rather than on the 3:4 box.
            <span
              style={{ width: sheetSize(current).width }}
              className="absolute right-0 top-full mt-3 flex justify-center whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-widest text-white/70 transition-colors group-hover:text-white"
            >
              View certificate
            </span>
          )}
        </button>
      </div>

      {/* Portalled to <body>: this sits inside the hero's stacking context,
          which would hold the viewer's z-50 beneath the fixed navbar. Only
          ever true after a click, so document exists by then. */}
      {hasOpenedViewer &&
        createPortal(
          <CertificateViewer
            certificates={certificates}
            openIndex={viewerIndex}
            onOpenIndexChange={setViewerIndex}
          />,
          document.body,
        )}
    </div>
  );
}
