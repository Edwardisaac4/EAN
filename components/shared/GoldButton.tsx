import React from 'react';

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function GoldButton({ children, className = '', ...props }: GoldButtonProps) {
  return (
    <button
      className={`bg-ean-gold text-ean-navy font-ui font-semibold text-sm px-7 py-3.5 tracking-wider hover:bg-ean-gold-light transition-all duration-300 inline-flex items-center justify-center gap-2 rounded-xs cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
