import React from 'react';

interface OutlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'dark' | 'light';
}

/**
 * The secondary call to action — the same geometry and type as GoldButton, but
 * a 1px brass hairline instead of a fill, resolving to the fill on hover.
 *
 * `variant` distinguishes the surface it sits on, not the colour it draws in:
 * brass is the only accent in this system, so both variants are brass. The
 * light variant simply starts from ink type, because on a brass or ivory
 * surface brass-on-brass would vanish.
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
    variant === 'dark'
      ? 'border-ean-gold text-ean-gold hover:bg-ean-gold hover:text-ean-text-dark'
      : 'border-ean-text-dark/30 text-ean-text-dark hover:bg-ean-text-dark hover:text-ean-text-light hover:border-ean-text-dark';

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
