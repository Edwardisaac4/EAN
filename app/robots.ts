import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * Previously absent, which left crawl scope entirely to inference — nothing
 * pointed at the sitemap, and nothing kept crawlers out of the admin portal or
 * the API surface.
 *
 * /admin and /api are disallowed because they are useless to a crawler and
 * noisy in logs. This is a crawl-budget measure, not a security one: both are
 * genuinely protected by proxy.ts, and robots.txt is a public file that
 * advertises whatever it names.
 *
 * '/admin' alone covers '/admin/' and everything beneath it — robots.txt
 * disallow rules are prefix matches, so listing both was redundant.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
