import type { Metadata } from 'next';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata, breadcrumbSchema, PAGE_SEO } from '@/lib/seo';

/**
 * Applies to /services and, as a parent, to /services/[slug]. The detail route
 * exports its own generateMetadata, which takes precedence — this only fills the
 * gap on the index page.
 */
export const metadata: Metadata = buildMetadata(PAGE_SEO.services);

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ])}
      />
      {children}
    </>
  );
}
