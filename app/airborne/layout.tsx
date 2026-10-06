import type { Metadata } from 'next';
import { Rosario, Fustat, JetBrains_Mono } from 'next/font/google';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';

/*
 * The design system's three faces, loaded here rather than in the root layout.
 *
 * Scoping them to this route is the whole point: ean.aero sets in Archivo, and
 * moving the root layout would re-typeset fifteen other routes. Declared here,
 * Next still hoists and self-hosts them at build time — there is no runtime
 * cost to the placement — but the variables only exist on the element below, so
 * nothing outside /airborne can reach them even by accident.
 *
 * Each maps to a `--ds-*` variable that globals.css resolves into the
 * `font-ds-*` utilities. The split is the system's own: Rosario carries
 * headings, numbers, buttons, labels and navigation; Fustat carries everything
 * read at length; JetBrains Mono carries figures and specification values.
 * "Never swap them."
 */
const rosario = Rosario({
  subsets: ['latin'],
  // Italic for the brief layout's pull quotes, which would otherwise be slanted
  // synthetically.
  style: ['normal', 'italic'],
  variable: '--ds-display',
  display: 'swap',
});

const fustat = Fustat({
  subsets: ['latin'],
  variable: '--ds-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--ds-mono',
  display: 'swap',
});

/**
 * Metadata for /airborne, in a server layout for the same reason every other
 * public route has one: it keeps the page free to become a client component
 * without silently losing its <title> to the root layout.
 *
 * The ten programme pages nest under this layout, so they inherit the three
 * faces and supply their own metadata from their own record. The breadcrumb
 * JSON-LD is emitted by each page, not here — a layout-level BreadcrumbList
 * would sit beside every programme page's own three-item trail and compete
 * with it.
 */
export const metadata: Metadata = buildMetadata(PAGE_SEO.future);

export default function TheFutureLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${rosario.variable} ${fustat.variable} ${jetbrainsMono.variable}`}>
      {children}
    </div>
  );
}
