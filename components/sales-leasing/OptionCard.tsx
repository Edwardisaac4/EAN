import React from 'react';
import { Check } from 'lucide-react';
import type { EnquiryOption } from '@/lib/sales-leasing-enquiry';

interface OptionCardProps {
  type: 'radio' | 'checkbox';
  name: string;
  option: EnquiryOption;
  isSelected: boolean;
  onSelect: () => void;
}

/** Field label — the charter form's mono eyebrow style, so the two forms read as one family. */
export const LABEL = 'block font-mono text-[10.5px] tracking-[0.14em] uppercase text-ean-gold mb-2';

/**
 * Text input and select chrome. No border colour here: callers add either
 * `border-ean-border-dark` or `border-ean-error`, because two border-colour
 * utilities on one element resolve by stylesheet order, not class order.
 */
export const FIELD =
  'w-full bg-ean-white border text-ean-text-light px-3.25 py-2.75 font-ui text-[15px] rounded-sm placeholder:text-ean-slate focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors duration-200';

/** Selected and resting chrome for anything card-shaped in the enquiry. */
export const CARD_SELECTED = 'border-ean-gold bg-ean-gold/5';
export const CARD_RESTING = 'border-ean-border-dark bg-ean-navy';

/**
 * A native radio or checkbox, visually hidden inside a card-sized label. The
 * whole card is the target, which is what makes it comfortable on a phone, and
 * the input underneath keeps arrow-key and screen-reader behaviour native.
 */
export function OptionCard({ type, name, option, isSelected, onSelect }: OptionCardProps) {
  return (
    <label
      className={`relative flex min-h-17 cursor-pointer flex-col justify-center border px-4.5 py-4 transition-colors duration-200 has-focus-visible:ring-2 has-focus-visible:ring-ean-gold/40 ${
        isSelected ? CARD_SELECTED : `${CARD_RESTING} hover:border-ean-gold/50`
      }`}
    >
      <input
        type={type}
        name={name}
        value={option.id}
        checked={isSelected}
        onChange={onSelect}
        className="sr-only"
      />
      <span className="pr-7 font-ui text-[15px] font-medium leading-snug text-ean-text-light">
        {option.label}
      </span>
      {option.detail && (
        <span className="mt-1 pr-7 font-ui text-[13px] font-light leading-snug text-ean-slate">
          {option.detail}
        </span>
      )}
      {isSelected && (
        <Check className="absolute right-3.5 top-3.5 h-4 w-4 text-ean-gold" aria-hidden />
      )}
    </label>
  );
}
