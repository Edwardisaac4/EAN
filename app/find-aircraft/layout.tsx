import type { Metadata } from 'next';
import JsonLd from '@/components/shared/JsonLd';
import { SERVICES_DATA } from '@/lib/constants';
import { buildMetadata, breadcrumbSchema, PAGE_SEO } from '@/lib/seo';

export const metadata: Metadata = buildMetadata(PAGE_SEO.findAircraft);

export default function FindAircraftLayout({ children }: { children: React.ReactNode }) {
  // The service crumb comes from the services record, as on the service page
  // itself, so a rename there reaches this trail. A slug that stops matching
  // fails the build rather than shipping a crumb to a page that is gone.
  const service = SERVICES_DATA.find((s) => s.slug === 'aircraft-sales-leasing');
  if (!service) throw new Error('find-aircraft: no aircraft-sales-leasing entry in SERVICES_DATA');

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.name, path: `/services/${service.slug}` },
          { name: 'Find the Right Aircraft', path: '/find-aircraft' },
        ])}
      />
      {children}
    </>
  );
}
