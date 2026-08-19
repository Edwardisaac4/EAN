import type { Metadata } from 'next';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata, breadcrumbSchema } from '@/lib/seo';
import { AEROPLEX_PATH, AEROPLEX_SEO } from '@/lib/aeroplex-constants';

/**
 * Metadata and structured data for /the-aeroplex, in a server layout for the
 * reason every other public route has one: it keeps the page free to become a
 * client component without silently losing its <title> to the root layout.
 *
 * The SEO copy itself sits in lib/aeroplex-constants.ts beside the page content
 * it describes, rather than in PAGE_SEO.
 */
export const metadata: Metadata = buildMetadata(AEROPLEX_SEO);

export default function TheAeroplexLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'The Aeroplex', path: AEROPLEX_PATH },
        ])}
      />
      {children}
    </>
  );
}
