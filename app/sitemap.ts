import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'
import { ARTICLES_DATABASE, SERVICES_DATA } from '@/lib/constants'
import { adminSupabase } from '@/utils/supabase/admin'

/**
 * Generated at build time, alongside the static prerender.
 *
 * Blog slugs are unioned from both sources the blog reads — the static seed in
 * lib/constants.ts and published rows in blog_posts — mirroring
 * generateStaticParams in app/blog/[slug]/page.tsx. If those two ever disagree,
 * a post is reachable but unlisted.
 *
 * A database failure degrades to the static slugs rather than throwing: an
 * incomplete sitemap is recoverable, a failed build is not.
 */

/** Routes that exist as files, with their relative crawl priority. */
const STATIC_ROUTES: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  // Monthly because the programme section is updated as milestones complete.
  { path: '/the-aeroplex', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/team', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/history', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms-of-use', changeFrequency: 'yearly', priority: 0.3 },
]

interface BlogSitemapEntry {
  slug: string
  lastModified: Date
}

/**
 * A Date that is guaranteed to serialise.
 *
 * The seeded posts carry human-readable prose ("July 8, 2026") and the database
 * rows carry nullable timestamps, so both sources can yield something Date
 * cannot parse. `new Date('not a date')` is an Invalid Date, and
 * `MetadataRoute.Sitemap` renders it as the literal string "Invalid Date" in
 * <lastmod> — a malformed sitemap rather than a missing field.
 */
function toSitemapDate(value: string | null | undefined): Date {
  if (!value) return new Date()
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? new Date() : new Date(parsed)
}

async function getBlogEntries(): Promise<BlogSitemapEntry[]> {
  const seeded: BlogSitemapEntry[] = ARTICLES_DATABASE.map((article) => ({
    slug: article.slug,
    lastModified: toSitemapDate(article.publishedAt),
  }))

  try {
    const { data, error } = await adminSupabase
      .from('blog_posts')
      .select('slug, published_at, updated_at')
      .eq('status', 'published')

    if (error) {
      // Degrading to the seeded slugs silently is how a sitemap quietly loses
      // every database-authored post for an entire release.
      console.error('[sitemap] blog_posts query failed, using seeded slugs only:', error)
      return seeded
    }

    if (!data?.length) return seeded

    const seenSlugs = new Set(seeded.map((entry) => entry.slug))
    const fromDb = data
      .filter((row) => !seenSlugs.has(row.slug))
      .map((row) => ({
        slug: row.slug,
        lastModified: toSitemapDate(row.updated_at ?? row.published_at),
      }))

    return [...seeded, ...fromDb]
  } catch (err) {
    console.error('[sitemap] blog_posts lookup threw, using seeded slugs only:', err)
    return seeded
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const serviceEntries: MetadataRoute.Sitemap = SERVICES_DATA.map((service) => ({
    url: `${SITE_URL}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const blogEntries: MetadataRoute.Sitemap = (await getBlogEntries()).map((entry) => ({
    url: `${SITE_URL}/blog/${entry.slug}`,
    lastModified: entry.lastModified,
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...staticEntries, ...serviceEntries, ...blogEntries]
}
