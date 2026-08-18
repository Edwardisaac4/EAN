import type { Metadata } from 'next';
import JsonLd from '@/components/shared/JsonLd';
import {
  buildMetadata,
  breadcrumbSchema,
  localBusinessSchema,
  PAGE_SEO,
} from '@/lib/seo';

export const metadata: Metadata = buildMetadata(PAGE_SEO.contact);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
        LocalBusiness is repeated here as well as site-wide because this is the
        page a search engine is most likely to surface for a "near me" or
        "phone number" query, and the @id keeps the two references to one entity.
      */}
      <JsonLd
        schema={[
          localBusinessSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ]}
      />
      {children}
    </>
  );
}
