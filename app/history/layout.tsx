import type { Metadata } from 'next';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata, breadcrumbSchema, PAGE_SEO } from '@/lib/seo';

export const metadata: Metadata = buildMetadata(PAGE_SEO.history);

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
          { name: 'History', path: '/history' },
        ])}
      />
      {children}
    </>
  );
}
