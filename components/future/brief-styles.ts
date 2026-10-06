/*
 * The brief layout's shared type, as class strings.
 *
 * The brief is a replica of the line's own published page, so these carry its
 * measurements verbatim — 88px section padding, the 1120px column — with its
 * burgundy ramp moved onto the blue one:
 *
 *   page ground   #150a0e → ds-afterburn (black; every table and panel is ds-blue-deep)
 *   panels        #22131a → ds-blue-deep, the one table shade
 *   the ten band  #3d0b16 → ds-blue-deep cells; the band itself is black
 *   rose figures  #e8a9bc → ds-skyway
 *
 * Cream and gold are unchanged: the brief's cream and gold *are* ds-skyway and
 * ds-aurum. The brief's 45% "dim" is raised to 55% here, because 45% of cream
 * on afterburn measures 3.8:1 and the source lines it sets are 13px.
 *
 * Breakpoints are the brief's own 560px and 900px rather than Tailwind's, so
 * the grids collapse where the brief's do.
 *
 * The headings are the exception to "verbatim": the brief's ran to 66px, and
 * they take the design system's own scale instead (Foundations 01, Typography).
 * Headline 1 and 2 are Rosario Bold at 48px and 32px, stepping down to 36px
 * and 26px below 561px; Headline 4 is Rosario SemiBold 18px; all at -0.02em.
 * Section labels are Rosario SemiBold 14px at 0.08em, uppercase.
 */

export const BRIEF_WRAP = 'mx-auto w-full max-w-[1120px] px-6';

export const BRIEF_LABEL =
  "mb-[18px] flex items-center gap-3 font-ds-display text-[14px] font-semibold tracking-[0.08em] text-ds-aurum uppercase before:h-px before:w-[26px] before:bg-ds-aurum before:content-['']";

export const BRIEF_H2 =
  'mb-[22px] max-w-[22ch] font-ds-display text-[26px] leading-[1.15] font-bold tracking-[-0.02em] text-balance text-ds-skyway min-[561px]:text-[32px]';

/** Headline 4, for the titles inside a section: cards, steps, milestones, questions. */
export const BRIEF_H4 = 'font-ds-display text-[18px] leading-[1.3] font-semibold tracking-[-0.02em] text-ds-skyway';

export const BRIEF_LEDE =
  'mb-[18px] max-w-[66ch] font-ds-body text-[19px] leading-[1.6] text-ds-skyway/90';

/** A grid whose 1px gaps show the ground through as hairlines. Cells must be opaque. */
export const BRIEF_HAIRLINE_GRID = 'grid gap-px border border-ds-skyway/14 bg-ds-skyway/14';

/** Every section but the first also takes BRIEF_RULE — the brief's `section + section`. */
export const BRIEF_SECTION = 'scroll-mt-[66px] py-16 min-[561px]:py-[88px]';

export const BRIEF_RULE = 'border-t border-ds-skyway/14';
