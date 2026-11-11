'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

import { VIEW_ONLY_PROPS } from '@/components/credentials/view-only';
import { formatCertificateDate, getIssuer, type Certificate } from '@/lib/credentials-constants';

interface ServiceCertificateListProps {
  /** This service's certificates in force, top to bottom. */
  certificates: Certificate[];
  className?: string;
}

// Fetched on first tap, or on touch or focus just before it, so none of the
// viewer's code rides along with the service page's first load.
const loadViewer = () => import('@/components/credentials/CertificateViewer');
const CertificateViewer = dynamic(loadViewer, { ssr: false });

/**
 * The phone and tablet form of a /services/[slug] page's certificates: a list
 * inside the "Operational Base & Facilities" box, under the sentence about
 * operating to regulatory guidelines, as the proof of it. On a phone the hero
 * has no free corner, and a sheet laid over the photograph read as a sticker;
 * on the white box it reads as a document. Each row is a thumbnail, the
 * title and its date (no issuer tag above the title, by request), and a tap
 * opens the viewer at that one.
 *
 * Hidden from lg, where the hero corner (HeroCertificates) shows them and
 * display:none keeps these lazy thumbnails from loading.
 */
export default function ServiceCertificateList({ certificates, className = '' }: ServiceCertificateListProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [hasOpenedViewer, setHasOpenedViewer] = useState(false);

  if (certificates.length === 0) return null;

  const openViewer = (index: number) => {
    setHasOpenedViewer(true);
    setViewerIndex(index);
  };

  return (
    <div className={className}>
      <ul className="divide-y divide-ean-border-light border-t border-ean-border-light">
        {certificates.map((certificate, index) => {
          const issuer = getIssuer(certificate.issuer);
          // A credential without an expiry (the 2011 facility approval) is
          // dated by its issue instead.
          const date = certificate.validUntil
            ? `Valid until ${formatCertificateDate(certificate.validUntil)}`
            : certificate.issued
              ? `Issued ${formatCertificateDate(certificate.issued)}`
              : null;

          return (
            <li key={certificate.id}>
              <button
                type="button"
                onClick={() => openViewer(index)}
                onPointerEnter={() => void loadViewer()}
                onFocus={() => void loadViewer()}
                aria-label={`View certificate: ${certificate.title}`}
                className="group flex w-full cursor-pointer items-center gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ean-blue"
              >
                {/* One box for every sheet, fitted rather than cropped, as on
                    /credentials, so a landscape certificate keeps its sides. */}
                <span className="relative h-20 w-16 shrink-0 border border-ean-border-dark bg-ean-navy">
                  <Image
                    src={certificate.scan.src}
                    alt={`${certificate.title}, issued by ${issuer.name}`}
                    fill
                    sizes="64px"
                    quality={80}
                    className="object-contain p-1 select-none [-webkit-touch-callout:none] drop-shadow-[0_2px_4px_rgba(0,0,0,0.16)]"
                    {...VIEW_ONLY_PROPS}
                  />
                </span>

                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block font-ui text-sm font-medium leading-snug text-ean-text-light">
                    {certificate.title}
                  </span>
                  {date && <span className="block font-ui text-xs text-ean-slate">{date}</span>}
                </span>

                <ChevronRight className="h-4 w-4 shrink-0 text-ean-gold transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
              </button>
            </li>
          );
        })}
      </ul>

      {/* Portalled to <body>, clear of the section reveal's transform and the
          page's stacking contexts, so the viewer covers the navbar too. Only
          ever true after a tap, so document exists by then. */}
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
