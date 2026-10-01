/**
 * The source line the brief prints under every block of figures. Not optional
 * decoration — see the note at the top of lib/future-constants.ts.
 */
export default function BriefSources({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3.5 font-ds-body text-[13px] leading-[1.55] text-ds-skyway/55">
      <b className="mr-2 font-ds-mono text-[11.5px] font-medium tracking-[0.08em] text-ds-aurum">
        SOURCES
      </b>
      {children}
    </p>
  );
}
