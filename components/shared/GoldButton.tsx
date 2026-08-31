import React from 'react';

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * The solid call to action: a brass fill carrying ink type.
 *
 * Ink on brass measures 5.75:1. The obvious-looking alternative — ivory or
 * white type on the fill — is about 1.5:1 and unreadable, so the dark
 * foreground is a requirement here, not a stylistic preference.
 *
 * Square by system: this palette carries radius in exactly three places (form
 * inputs, pill chips, the status dot) and a button is none of them.
 */
export default function GoldButton({ children, className = '', ...props }: GoldButtonProps) {
  return (
    <button
      className={`bg-ean-gold text-ean-text-dark border border-ean-gold font-ui font-semibold text-[12.5px] uppercase tracking-[0.08em] px-7 py-3.5 hover:bg-ean-gold-light hover:border-ean-gold-light transition-colors duration-300 inline-flex items-center justify-center gap-2 rounded-none cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
