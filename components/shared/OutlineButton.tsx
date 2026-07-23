import React from 'react';

interface OutlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'dark' | 'light';
}

export default function OutlineButton({
  children,
  variant = 'dark',
  className = '',
  ...props
}: OutlineButtonProps) {
  const baseStyles = 'font-ui font-medium text-sm px-7 py-3.5 tracking-wider transition-all duration-300 inline-flex items-center justify-center gap-2 rounded-[2px] border cursor-pointer';
  
  const variantStyles =
    variant === 'dark'
      ? 'border-white text-white hover:bg-ean-gold hover:border-ean-gold hover:text-ean-navy'
      : 'border-ean-navy text-ean-navy hover:bg-ean-navy hover:text-white';

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
