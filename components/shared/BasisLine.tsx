import React from 'react';

interface BasisLineProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * The evidence line under a statistic — "Basis: …".
 *
 * This is the argument the revised homepage makes: every published number
 * carries the thing it was derived from, immediately under it. That makes the
 * legibility of this line load-bearing rather than incidental, which is why it
 * is set at 11px and not the prototype's 9.5px, and why `ean-slate-deep` is
 * #767F8A rather than the prototype's #5B6670 — the original pairing measured
 * 3.2:1, so the evidence was being published below the threshold at which the
 * readers most likely to check it could read it.
 *
 * slate-deep clears 4.5:1 on `ean-black` only. Keep this on ink; on ean-navy it
 * measures 4.24:1 and the guarantee is gone. See globals.css.
 */
export default function BasisLine({ children, className = '' }: BasisLineProps) {
  return (
    <p className={`font-mono text-[11px] leading-relaxed text-ean-slate-deep ${className}`}>
      <span className="text-ean-slate">Basis:</span> {children}
    </p>
  );
}
