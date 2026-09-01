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
 * is set at 11px and not the prototype's 9.5px, and why the neutrals it uses
 * are pinned above the AA floor rather than picked for tone.
 *
 * On the paper ramp these are no longer surface-constrained. slate-deep
 * (#4A4A4A) measures 8.86:1 on paper and slate (#6B6B6B) 5.33:1, and both clear
 * 4.5:1 on all three surfaces — so this line may sit on any of them. Under the
 * ink ramp it was pinned to `ean-black`; that restriction is gone.
 */
export default function BasisLine({ children, className = '' }: BasisLineProps) {
  return (
    <p className={`font-mono text-[11px] leading-relaxed text-ean-slate-deep ${className}`}>
      <span className="text-ean-slate">Basis:</span> {children}
    </p>
  );
}
