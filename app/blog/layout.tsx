import type { Metadata } from 'next';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata, breadcrumbSchema, PAGE_SEO } from '@/lib/seo';

/**
 * Applies to /blog and, as a parent, to /blog/[slug]. The post route exports its
 * own generateMetadata and Article schema, which take precedence.
 */
export const metadata: Metadata = buildMetadata(PAGE_SEO.blog);

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/blog' },
        ])}
      />
      {children}
    </>
  );
}
