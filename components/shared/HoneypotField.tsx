import React from 'react';

interface HoneypotFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Spam trap for the public lead forms, validated server-side in
 * app/api/leads/route.ts — a non-empty value means the submission is discarded.
 *
 * `website` is chosen because it is a field name naive bots recognise and fill
 * eagerly. Three details matter for correctness:
 *
 * - It is hidden by moving it out of the viewport, not with `display: none` or
 *   `hidden`. Better bots skip fields they can see are unrenderable, and some
 *   browsers refuse to submit `hidden` inputs at all.
 * - `aria-hidden` + `tabIndex={-1}` keep it away from screen readers and the tab
 *   order, so it is never a trap for an actual person. This is why it must not
 *   be a `required`-looking field with a label.
 * - `autoComplete="off"` stops a password manager from helpfully filling it and
 *   getting a real customer silently rejected.
 */
export default function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden"
    >
      <label htmlFor="website">Website (leave blank)</label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
