import React from 'react';

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  as?: 'span' | 'p' | 'div';
}

/**
 * The mono label that opens nearly every section.
 *
 * Mono is doing real work here rather than decorating: it is the site's
 * signal for machine-ish text — eyebrows, basis lines, the ops strip, stat
 * labels, department tags — and now that headings and body copy are both
 * Archivo it is the only family contrast left in the system.
 */
export default function Eyebrow({ children, className = '', as: Tag = 'span' }: EyebrowProps) {
  return (
    <Tag
      className={`font-mono text-[11px] uppercase tracking-[0.2em] text-ean-gold ${className}`}
    >
      {children}
    </Tag>
  );
}
