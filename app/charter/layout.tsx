import type { Metadata } from 'next';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata, breadcrumbSchema, PAGE_SEO } from '@/lib/seo';

export const metadata: Metadata = buildMetadata(PAGE_SEO.charter);

export default function CharterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Request a Charter', path: '/charter' },
        ])}
      />
      {children}
    </>
  );
}
