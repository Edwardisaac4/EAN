import type { Metadata } from 'next';
import JsonLd from '@/components/shared/JsonLd';
import { buildMetadata, breadcrumbSchema, PAGE_SEO } from '@/lib/seo';

export const metadata: Metadata = buildMetadata(PAGE_SEO.termsOfUse);

export default function TermsOfUseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Terms of Use', path: '/terms-of-use' },
        ])}
      />
      {children}
    </>
  );
}
