import type { Metadata } from 'next';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata, breadcrumbSchema, PAGE_SEO } from '@/lib/seo';

export const metadata: Metadata = buildMetadata(PAGE_SEO.feedback);

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Feedback', path: '/feedback' },
        ])}
      />
      {children}
    </>
  );
}
