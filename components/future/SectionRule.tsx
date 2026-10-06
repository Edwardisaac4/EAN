import DsReveal from '@/components/future/DsReveal';

/**
 * The design system's section header: an eyebrow, then a title with a rule that
 * fades out to the right and an optional number at the far end.
 *
 * This replaces the ticked measuring rule the page opened with before. That was
 * Archer's device; this is the system's, and the two do not belong on the same
 * page. The gradient rule is the one place Aurum appears on a light ground —
 * legitimately, because it is structure, not type: it fades from 33% alpha to
 * nothing and is never asked to carry a word.
 *
 * The eyebrow is set in blue rather than the published system's Aurum. On
 * Canvas Linen, Aurum measures 2.11:1 — below the 3:1 non-text floor, never
 * mind AA. The system's own typography page sets section labels in the accent,
 * and that is the version followed here.
 */
export default function SectionRule({
  eyebrow,
  title,
  number,
  paddingClassName,
}: {
  eyebrow: string;
  title: string;
  number?: string;
  paddingClassName: string;
}) {
  return (
    <DsReveal className={`${paddingClassName} pt-20 md:pt-28`}>
      <p className="font-ds-display text-[13px] font-semibold uppercase tracking-[0.10em] text-ds-blue">
        {eyebrow}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <h2 className="font-ds-display text-[24px] font-bold tracking-[-0.02em] whitespace-nowrap text-ds-afterburn md:text-[32px]">
          {title}
        </h2>
        <span aria-hidden className="h-px flex-1 bg-linear-to-r from-ds-aurum/33 to-transparent" />
        {number && (
          <span className="font-ds-display text-[13px] font-semibold tracking-[0.08em] whitespace-nowrap text-ds-text-muted">
            {number}
          </span>
        )}
      </div>
    </DsReveal>
  );
}
