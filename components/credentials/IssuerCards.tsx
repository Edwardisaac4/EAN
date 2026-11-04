'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import SectionReveal from '@/components/shared/SectionReveal';
import { ISSUERS, type Issuer, type IssuerId } from '@/lib/credentials-constants';

interface IssuerCardsProps {
  /** Certificates in force per issuer, counted on the server. */
  counts: Record<IssuerId, number>;
}

/** The ServiceCard button geometry, in the blue that paper calls for. */
const BUTTON_CLASS =
  'font-ui font-semibold text-[11.5px] uppercase tracking-[0.08em] px-6 py-3 w-full transition-colors duration-300 inline-flex items-center justify-center gap-2 rounded-none border';

/** Read from `--ean-mx`/`--ean-my`, which the card writes on `pointermove`, as
 *  on ServiceCard. Inline because Tailwind cannot compose a colour stop around
 *  a custom property written only at runtime. */
const SPOTLIGHT: React.CSSProperties = {
  background:
    'radial-gradient(260px circle at var(--ean-mx, 50%) var(--ean-my, 0%), color-mix(in srgb, var(--color-ean-blue) 9%, transparent), transparent 70%)',
};

/** Columns follow the issuer count, so the row always spans the container in
 *  equal widths rather than leaving empty tracks beside two cards. Spelled out
 *  per count because Tailwind only emits classes it can find as literals. */
const GRID_COLUMNS: Record<number, string> = {
  1: '',
  2: 'min-[480px]:grid-cols-2',
  3: 'min-[480px]:grid-cols-2 lg:grid-cols-3',
  4: 'min-[480px]:grid-cols-2 lg:grid-cols-4',
};

const BRACKET =
  'absolute h-4 w-4 border-ean-blue/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100';

interface IssuerCardProps {
  issuer: Issuer;
  certificateCount: number;
}

/**
 * The services card carried onto paper: a hairline that grows edge to edge,
 * corner brackets and a pointer-tracked glow on hover, here around a logo
 * rather than a photograph, with the one action pinned to the bottom.
 */
function IssuerCard({ issuer, certificateCount }: IssuerCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const isReducedRef = useRef(false);

  useEffect(() => {
    isReducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    // One write per frame, as on ServiceCard: pointermove outpaces paint.
    if (isReducedRef.current || frameRef.current !== null) return;
    const { clientX, clientY } = event;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--ean-mx', `${clientX - rect.left}px`);
      el.style.setProperty('--ean-my', `${clientY - rect.top}px`);
    });
  }, []);

  return (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className="group relative isolate flex h-full flex-col overflow-hidden border border-ean-border-light bg-ean-black transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-ean-blue/60 hover:shadow-[0_24px_60px_-24px_rgba(43,0,152,0.35)] focus-within:border-ean-blue/60"
    >
      <div
        aria-hidden="true"
        style={SPOTLIGHT}
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-3 z-20">
        <span className={`${BRACKET} left-0 top-0 border-l border-t`} />
        <span className={`${BRACKET} right-0 top-0 border-r border-t`} />
        <span className={`${BRACKET} bottom-0 left-0 border-b border-l`} />
        <span className={`${BRACKET} bottom-0 right-0 border-b border-r`} />
      </div>

      {/* A fixed height, not an aspect ratio: at two across a 16:9 panel would
          stand ~300px tall and push the button off a 620px-tall window. */}
      <div className="relative z-10 flex h-36 items-center justify-center border-b border-ean-border-light px-8 py-5">
        <span className="relative block h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]">
          <Image
            src={issuer.logo.src}
            alt={`${issuer.name} logo`}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 240px"
            quality={80}
            className="object-contain"
          />
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="grid gap-1">
          <h2 className="m-0 font-display text-2xl font-light leading-tight text-ean-text-light">
            {issuer.shortName}
          </h2>
          <p className="m-0 font-ui text-[13px] leading-snug text-ean-muted-light">{issuer.name}</p>
        </div>

        <div className="h-[2px] w-10 bg-ean-blue transition-all duration-500 ease-out group-hover:w-full group-focus-within:w-full" />

        <div className="mt-auto pt-2">
          {certificateCount > 0 ? (
            <Link
              href={`/credentials/${issuer.id}`}
              className={`${BUTTON_CLASS} border-ean-blue bg-ean-blue text-white hover:border-ean-blue-light hover:bg-ean-blue-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ean-blue`}
            >
              {/* The issuer goes in a hidden suffix rather than an aria-label,
                  so the spoken name starts with the words on the button and a
                  voice-control user can say what they see. */}
              View certificate{certificateCount > 1 ? 's' : ''}
              <span className="sr-only"> issued by {issuer.shortName}</span>
            </Link>
          ) : (
            // Not a link: there is no page to go to until a certificate lands.
            <span aria-disabled="true" className={`${BUTTON_CLASS} border-ean-border-dark text-ean-slate`}>
              Coming soon
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * One card per issuing body in ISSUERS. "View certificate(s)" goes to
 * /credentials/[issuer], which shows that body's certificates as a grid.
 */
export default function IssuerCards({ counts }: IssuerCardsProps) {
  const columns = GRID_COLUMNS[ISSUERS.length] ?? GRID_COLUMNS[4];

  return (
    <SectionReveal grid stagger={0.06}>
      <ul className={`grid grid-cols-1 gap-5 sm:gap-6 ${columns}`}>
        {ISSUERS.map((issuer) => (
          <li key={issuer.id} data-reveal>
            <IssuerCard issuer={issuer} certificateCount={counts[issuer.id]} />
          </li>
        ))}
      </ul>
    </SectionReveal>
  );
}
