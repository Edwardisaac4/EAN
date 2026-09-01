import React from 'react';

interface OutlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'dark' | 'light' | 'photo';
}

/**
 * The secondary call to action — the same geometry and type as GoldButton, but
 * a 1px blue hairline instead of a fill, resolving to the fill on hover.
 *
 * `variant` distinguishes the surface it sits on, not the colour it draws in.
 * On paper there is only one ground, so both variants now draw in the brand
 * blue and differ only in hairline weight — `light` sits on a busier surface
 * and takes the softer 40% rule.
 *
 * The light variant used to invert to an ink fill carrying ivory type. That
 * only worked while ivory was the light colour: with the paper ramp it is
 * white-on-white at rest and ink-on-ink on hover, so it was rewritten to the
 * same blue button as `dark` rather than repointed.
 *
 * `photo` is the third ground: a full-bleed photograph under a black scrim,
 * where blue-on-near-black left the label unreadable until the hover fill
 * arrived. There is no token for type on a photograph, so it draws in a literal
 * white and inverts to a white fill carrying blue type on hover.
 */
export default function OutlineButton({
  children,
  variant = 'dark',
  className = '',
  ...props
}: OutlineButtonProps) {
  const baseStyles =
    'font-ui font-medium text-[12.5px] uppercase tracking-[0.08em] px-7 py-3.5 transition-colors duration-300 inline-flex items-center justify-center gap-2 rounded-none border cursor-pointer';

  const variantStyles =
    variant === 'photo'
      ? 'border-white/50 text-white hover:bg-white hover:text-ean-gold hover:border-white'
      : variant === 'dark'
        ? 'border-ean-gold text-ean-gold hover:bg-ean-gold hover:text-ean-text-dark'
        : 'border-ean-gold/40 text-ean-gold hover:bg-ean-gold hover:text-ean-text-dark hover:border-ean-gold';

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
