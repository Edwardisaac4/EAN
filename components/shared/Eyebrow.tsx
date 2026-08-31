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
 * labels, department tags — and it separates that register from Fraunces
 * headings and Archivo body copy at a glance.
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
