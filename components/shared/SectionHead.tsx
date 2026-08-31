import React from 'react';
import Eyebrow from './Eyebrow';

interface SectionHeadProps {
  eyebrow?: string;
  title: React.ReactNode;
  /** Right-aligned note — a count, a date range, a qualifier. */
  note?: React.ReactNode;
  className?: string;
  /** h2 by default; the page's single h1 should pass 'h1'. */
  as?: 'h1' | 'h2';
}

/**
 * The `.shead` block: eyebrow, heading, and an optional note pushed to the
 * right of the heading on wide viewports.
 *
 * The note drops below the heading rather than beside it under `sm`, because
 * at 40px the heading and a mono note cannot share a line without one of them
 * wrapping badly.
 *
 * Sizes come from the h1/h2/h3 rule in globals.css — weight 300, tight leading,
 * slight negative tracking — so this sets only the scale.
 */
export default function SectionHead({
  eyebrow,
  title,
  note,
  className = '',
  as: Tag = 'h2',
}: SectionHeadProps) {
  return (
    <div className={`mb-10 ${className}`}>
      {eyebrow && <Eyebrow className="block mb-3">{eyebrow}</Eyebrow>}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <Tag className="font-display text-[clamp(26px,3.4vw,40px)] text-ean-text-light">
          {title}
        </Tag>
        {note && (
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ean-slate shrink-0 sm:text-right">
            {note}
          </span>
        )}
      </div>
    </div>
  );
}
