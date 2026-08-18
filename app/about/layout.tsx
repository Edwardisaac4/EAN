import type { Metadata } from 'next';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata, breadcrumbSchema, PAGE_SEO } from '@/lib/seo';

/**
 * app/about/page.tsx is a client component (GSAP), and a client component cannot
 * export `metadata` — which is why this page previously shipped none and
 * inherited the root layout's generic title. This server layout owns the
 * metadata and structured data; the page keeps its interactivity.
 */
export const metadata: Metadata = buildMetadata(PAGE_SEO.about);

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />
      {children}
    </>
  );
}
