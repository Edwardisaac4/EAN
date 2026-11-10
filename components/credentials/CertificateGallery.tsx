'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Maximize2 } from 'lucide-react';

import CertificateViewer from '@/components/credentials/CertificateViewer';
import { VIEW_ONLY_PROPS } from '@/components/credentials/view-only';
import SectionReveal from '@/components/shared/SectionReveal';
import { getIssuer, type Certificate } from '@/lib/credentials-constants';

interface CertificateGalleryProps {
  /** Already filtered to the certificates in force — see currentCertificates. */
  certificates: Certificate[];
}

/**
 * The certificates as a grid of whole sheets, title only. Each opens the
 * viewer (CertificateViewer) with its issuer, number, holder and dates. It is
 * the body of /credentials, with every issuing body's certificates in one list.
 */
export default function CertificateGallery({ certificates }: CertificateGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (certificates.length === 0) {
    return (
      <p className="font-ui text-base text-ean-muted-light">
        Our certificates are being added to this page.
      </p>
    );
  }

  return (
    <>
      <SectionReveal grid stagger={0.05}>
        {/* Three across, so the six certificates sit in two full rows. */}
        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
          {certificates.map((certificate, index) => (
            <li key={certificate.id} data-reveal>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`View certificate: ${certificate.title}`}
                className="group block w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ean-blue"
              >
                {/* The whole sheet, fitted rather than cropped, so a landscape
                    certificate sits in the same tile as a portrait one instead
                    of losing its sides. */}
                <span className="relative block aspect-3/4 w-full overflow-hidden border border-ean-border-dark bg-ean-navy transition-[border-color,box-shadow,transform] duration-300 group-hover:-translate-y-1.5 group-hover:border-ean-blue/60 group-hover:shadow-[0_18px_40px_rgba(43,0,152,0.14)]">
                  <Image
                    src={certificate.scan.src}
                    alt={`${certificate.title}, issued by ${getIssuer(certificate.issuer).name}`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 360px"
                    quality={80}
                    className="object-contain p-3 sm:p-4 select-none [-webkit-touch-callout:none] drop-shadow-[0_6px_14px_rgba(0,0,0,0.16)]"
                    {...VIEW_ONLY_PROPS}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute right-2.5 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-ean-border-dark bg-ean-black/90 text-ean-gold opacity-0 transition-[opacity,background-color,color,border-color] group-hover:opacity-100 group-hover:border-ean-blue group-hover:bg-ean-blue group-hover:text-white group-focus-visible:opacity-100"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </span>
                </span>
                <span className="mt-3 block text-balance font-ui text-sm font-medium leading-snug text-ean-text-light">
                  {certificate.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </SectionReveal>

      <CertificateViewer
        certificates={certificates}
        openIndex={openIndex}
        onOpenIndexChange={setOpenIndex}
      />
    </>
  );
}
