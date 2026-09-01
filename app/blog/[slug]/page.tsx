import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  ChevronRight,
  UserCheck
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';
import JsonLd from '@/components/shared/JsonLd';
import ArticleBody from '@/components/blog/ArticleBody';
import { ARTICLES_DATABASE } from '@/lib/constants';
import { ARTICLE_BODIES } from '@/lib/blog-content';
import { articleSchema, breadcrumbSchema, buildMetadata } from '@/lib/seo';
import { adminSupabase } from '@/utils/supabase/admin';
import type { Json } from '@/types/supabase';

// Resolved article shape returned by getArticleData
interface ResolvedArticle {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  image: string;
  content?: Json;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isFromDb: boolean;
  isFeatured?: boolean;
}

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static params for pre-rendering
export async function generateStaticParams() {
  const staticSlugs = ARTICLES_DATABASE.map((art) => ({ slug: art.slug }));
  
  try {
    const { data: dbPosts } = await adminSupabase
      .from('blog_posts')
      .select('slug')
      .eq('status', 'published');

    if (dbPosts && dbPosts.length > 0) {
      const dbSlugs = dbPosts.map((p) => ({ slug: p.slug }));
      return [...staticSlugs, ...dbSlugs];
    }
  } catch {
    // Return fallback static slugs on DB error
  }

  return staticSlugs;
}

/**
 * Allowlists a link target from Tiptap JSON.
 *
 * The previous check was `href.startsWith('javascript:')`, which is
 * case-sensitive and anchored, so ` javascript:…`, `JavaScript:…`, and
 * `java\tscript:…` all slipped through — browsers strip leading whitespace and
 * control characters before resolving a scheme, and match it case-insensitively.
 * Inverting to an allowlist removes the whole class of bypass rather than
 * patching each spelling.
 */
function safeHref(href: string): string {
  // Strip the characters a browser ignores when parsing the scheme.
  const normalised = href.replace(/[\s\x00-\x1f]/g, '').toLowerCase();

  if (/^(https?:|mailto:|tel:)/.test(normalised)) return href;
  // Relative, anchor, and root-absolute links are safe and common in posts.
  if (/^(\/|#|\.)/.test(normalised)) return href;

  return '#';
}

// Full recursive Tiptap JSON node renderer
interface TiptapMark {
  type: string;
  attrs?: Record<string, string | number | boolean | null>;
}

interface TiptapNode {
  type: string;
  text?: string;
  attrs?: Record<string, string | number | boolean | null>;
  marks?: TiptapMark[];
  content?: TiptapNode[];
}

function renderTiptapNode(node: TiptapNode, key: number | string): React.ReactNode {
  if (!node) return null;

  if (node.type === 'text') {
    let element: React.ReactNode = node.text || '';
    if (node.marks) {
      node.marks.forEach((mark) => {
        if (mark.type === 'bold') element = <strong>{element}</strong>;
        if (mark.type === 'italic') element = <em>{element}</em>;
        if (mark.type === 'code') element = <code className="bg-ean-gold/10 px-1 py-0.5 text-sm font-mono">{element}</code>;
        const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '';
        if (mark.type === 'link' && href) {
          element = (
            <a href={safeHref(href)} target="_blank" rel="noopener noreferrer" className="text-ean-gold underline hover:text-ean-gold-light">
              {element}
            </a>
          );
        }
      });
    }
    return <React.Fragment key={key}>{element}</React.Fragment>;
  }

  const children = node.content ? node.content.map((child, idx) => renderTiptapNode(child, idx)) : null;

  switch (node.type) {
    case 'heading': {
      const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 2;
      if (level === 1) return <h1 key={key} className="font-display text-2xl sm:text-3xl text-ean-text-light font-semibold pt-4">{children}</h1>;
      if (level === 3) return <h3 key={key} className="font-display text-xl sm:text-2xl text-ean-text-light font-semibold pt-4">{children}</h3>;
      return <h2 key={key} className="font-display text-2xl sm:text-2xl text-ean-text-light font-semibold pt-4">{children}</h2>;
    }
    case 'paragraph':
      return <p key={key} className="leading-relaxed my-3">{children}</p>;
    case 'blockquote':
      return <blockquote key={key} className="border-l border-ean-gold pl-6 py-2 my-6 italic text-ean-text-light bg-ean-gold/5">{children}</blockquote>;
    case 'bulletList':
      return <ul key={key} className="list-disc list-inside my-4 space-y-2">{children}</ul>;
    case 'orderedList':
      return <ol key={key} className="list-decimal list-inside my-4 space-y-2">{children}</ol>;
    case 'listItem':
      return <li key={key} className="text-ean-text-light">{children}</li>;
    case 'image': {
      const imgSrc = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
      const imgAlt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
      if (!imgSrc) return null;
      return (
        <div key={key} className="my-6 relative w-full h-64 sm:h-96 overflow-hidden border border-ean-border-light">
          <Image src={imgSrc} alt={imgAlt} fill className="object-cover" />
        </div>
      );
    }
    case 'horizontalRule':
      return <hr key={key} className="my-8 border-ean-border-light" />;
    default:
      return <div key={key}>{children}</div>;
  }
}

// Helper to get article data from DB or static constants
async function getArticleData(slug: string): Promise<ResolvedArticle | null> {
  // 1. Check Supabase first for published posts.
  //
  // Reads through adminSupabase, matching generateStaticParams above and
  // app/sitemap.ts. blog_posts has RLS enabled with no policies (migration 005
  // §5), so the anon client returns zero rows *and no error* — every
  // database-authored post silently fell through to the static seed below, while
  // the sitemap advertised its slug. The three readers now agree.
  //
  // Because this bypasses RLS, `.eq('status', 'published')` is the only thing
  // keeping drafts off the public site. It is load-bearing — do not remove it.
  //
  // No cookies() here: a published post does not vary by reader, and calling it
  // forced the whole route to re-render per request. Worse, the catch below
  // swallowed the dynamic-rendering signal Next throws to bail out of the
  // prerender, so the route was silently dropped from prerender-manifest.json.
  try {
    const { data: dbPost } = await adminSupabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (dbPost) {
      return {
        slug: dbPost.slug,
        title: dbPost.title,
        category: dbPost.category || 'Business Aviation',
        excerpt: dbPost.excerpt || '',
        publishedAt: dbPost.published_at 
          ? new Date(dbPost.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : 'Recent',
        readTime: '5 min read',
        image: dbPost.cover_image_url || '/images/about-jet.jpg',
        content: dbPost.content,
        seoTitle: dbPost.seo_title,
        seoDescription: dbPost.seo_description,
        isFromDb: true,
      };
    }
  } catch {
    // Continue to static lookup
  }

  // 2. Check static ARTICLES_DATABASE
  const staticArt = ARTICLES_DATABASE.find((art) => art.slug === slug);
  if (staticArt) {
    return {
      ...staticArt,
      isFromDb: false,
    };
  }

  return null;
}

// Generate dynamic Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleData(slug);

  if (!article) {
    return {
      title: 'Article Not Found | EAN Aviation',
      robots: { index: false, follow: true },
    };
  }

  // Routed through buildMetadata so the canonical URL, Open Graph and Twitter
  // blocks are constructed the same way as every other page. The previous version
  // hardcoded the https://ean.aero origin here and declared no canonical at all.
  return buildMetadata({
    title: article.seoTitle || `${article.title} | EAN Aviation Insights`,
    description: article.seoDescription || article.excerpt,
    path: `/blog/${article.slug}`,
    image: article.image,
    type: 'article',
  });
}

// Detailed content fallback generator for static articles
function renderArticleBody(article: ResolvedArticle) {
  if (article.isFromDb && article.content) {
    // No raw-HTML branch: blog_posts.content is jsonb (migration 005 §1) and both
    // write paths coerce a string body into { text } before insert, so it never
    // arrives as a string. The dead branch that handled it pulled in
    // isomorphic-dompurify, which loads jsdom at module scope. jsdom is one of
    // Next's default serverExternalPackages, so it is required at runtime rather
    // than bundled — and it was absent from this route's file trace, which meant
    // every /blog/<slug> request on Vercel died at module load with a 500.
    if (typeof article.content === 'object' && article.content !== null) {
      const doc = (article.content as unknown) as TiptapNode;
      if (doc.content) {
        return (
          <div className="space-y-6 font-ui text-ean-text-light text-base sm:text-lg leading-relaxed">
            {doc.content.map((child, idx) => renderTiptapNode(child, idx))}
          </div>
        );
      }
    }
  }

  // Static seed posts: body copy is structured data in lib/blog-content.ts and is
  // rendered by components/blog/ArticleBody.tsx. This replaced a ~125-line switch
  // statement that inlined every post's markup, heading classes and all, by hand.
  const blocks = ARTICLE_BODIES[article.slug];

  if (blocks?.length) {
    return <ArticleBody blocks={blocks} />;
  }

  // A post can legitimately have no body yet — a draft promoted to published
  // before its content saved, or a seed entry awaiting copy. Lead with the excerpt
  // rather than rendering an empty column.
  return (
    <div className="space-y-6 font-ui text-ean-text-light text-base sm:text-lg leading-relaxed">
      <p className="text-xl font-light text-ean-text-light leading-relaxed border-l border-ean-gold pl-6 italic">
        {article.excerpt}
      </p>
    </div>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleData(slug);

  if (!article) {
    notFound();
  }

  // Filter related articles from database excluding current post
  const relatedArticles = ARTICLES_DATABASE.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      {/*
        BlogPosting + breadcrumb structured data. `publishedAt` is stored as prose
        ("July 8, 2026"), but schema.org datePublished expects ISO 8601 — so it is
        converted here, and omitted rather than guessed if it will not parse.
      */}
      <JsonLd
        schema={[
          articleSchema({
            title: article.title,
            description: article.seoDescription || article.excerpt,
            slug: article.slug,
            image: article.image,
            publishedAt: Number.isNaN(Date.parse(article.publishedAt))
              ? ''
              : new Date(article.publishedAt).toISOString(),
            category: article.category,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Insights', path: '/blog' },
            { name: article.title, path: `/blog/${article.slug}` },
          ]),
        ]}
      />

      <Navbar />

      <main className="flex-1 bg-ean-white text-ean-text-light">
        {/* SECTION 1: Article Header Hero */}
        <section className="relative pt-32 pb-16 bg-linear-to-b from-ean-navy to-ean-navy-mid text-ean-text-light border-b border-ean-border-dark overflow-hidden">

          <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10 space-y-6">
            {/* Breadcrumb / Back button */}
            <div className="flex items-center gap-2 text-xs font-ui text-ean-muted-light">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-1 text-ean-gold hover:text-ean-gold-light transition-colors group font-semibold uppercase tracking-wider"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Back to Insights</span>
              </Link>
              <span>/</span>
              <span className="text-ean-text-light/40 truncate max-w-xs">{article.category}</span>
            </div>

            {/* Category Pill */}
            <span className="inline-block border border-ean-gold/30 bg-ean-gold/5 text-ean-gold text-[10px] sm:text-xs uppercase font-bold tracking-widest px-3 py-1">
              {article.category}
            </span>

            {/* Headline */}
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-light text-ean-text-light leading-[1.15]">
              {article.title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-ui text-ean-muted-light pt-2 border-t border-ean-border-dark">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ean-gold" />
                <span>{article.publishedAt}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-ean-gold" />
                <span>{article.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-ean-gold" />
                <span className="text-ean-text-light font-medium">EAN Editorial Team</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Featured Image & Content Body */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-6 md:px-8 space-y-12">
            
            {/* Cover Image Container */}
            <div className="relative w-full h-72 sm:h-105 overflow-hidden border border-ean-border-light bg-black/10">
              <Image
                src={article.image}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="object-cover"
                quality={80}
              />
              <div className="absolute inset-0 border border-ean-border-dark pointer-events-none" />
            </div>

            {/* Article Content Render */}
            <article className="py-4">
              {renderArticleBody(article)}
            </article>

            {/* Author Footer & Share Bar */}
            <div className="border-t border-b border-ean-border-light/60 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-ean-navy text-ean-gold flex items-center justify-center font-display text-xl font-bold border border-ean-gold/30 shrink-0">
                  EAN
                </div>
                <div>
                  <h4 className="font-ui text-sm font-semibold text-ean-text-light">EAN Aviation Editorial Desk</h4>
                  <p className="font-ui text-xs text-ean-muted-light">West Africa&apos;s Leader in Executive Aviation Services</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/contact?inquiry=editorial&subject=${encodeURIComponent(article.title)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-ean-surface border border-ean-border-light hover:border-ean-gold text-xs font-ui font-semibold text-ean-text-light transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-ean-gold" />
                  <span>Inquire About This Subject</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: Related Articles Grid */}
        {relatedArticles.length > 0 && (
          <section className="bg-ean-surface border-t border-ean-border-light py-16 sm:py-20">
            <div className="max-w-ean mx-auto px-6 md:px-8 space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-ui text-xs font-semibold tracking-widest text-ean-gold uppercase block">
                    Further Reading
                  </span>
                  <h3 className="font-display text-2xl sm:text-2xl font-medium text-ean-text-light">
                    Related Executive Insights
                  </h3>
                </div>
                <Link href="/blog" className="hidden sm:inline-flex items-center gap-1 text-xs font-ui font-bold text-ean-gold hover:underline uppercase tracking-wider">
                  <span>View All Articles</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((rel) => (
                  <Link 
                    key={rel.slug} 
                    href={`/blog/${rel.slug}`} 
                    className="block group h-full"
                  >
                    <div className="bg-white border border-ean-border-light overflow-hidden h-full flex flex-col hover:border-ean-gold/40 transition-colors shadow-xs">
                      <div className="relative w-full h-48 overflow-hidden bg-black/10">
                        <Image
                          src={rel.image}
                          alt={rel.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                        <span className="absolute top-3 left-3 bg-ean-navy/95 border border-ean-gold/30 text-ean-gold text-[9px] uppercase font-bold tracking-widest px-2.5 py-1">
                          {rel.category}
                        </span>
                      </div>
                      <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                        <div className="space-y-2">
                          <span className="text-[11px] text-ean-muted-light font-ui">{rel.publishedAt}</span>
                          <h4 className="font-ui text-base font-semibold text-ean-text-light group-hover:text-ean-gold transition-colors leading-snug">
                            {rel.title}
                          </h4>
                          <p className="font-ui text-xs text-ean-muted-light line-clamp-2 leading-relaxed">
                            {rel.excerpt}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-ean-border-light/60 flex items-center justify-between text-xs font-semibold text-ean-gold">
                          <span>Read Post</span>
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: Inquiry Callout Banner */}
        <section className="bg-ean-navy text-ean-text-light py-16 border-t border-ean-border-dark">
          <div className="max-w-4xl mx-auto px-6 md:px-8 text-center space-y-6">
            <h3 className="font-display text-2xl sm:text-3xl font-light">
              Elevate Your Flight Operations with EAN Aviation
            </h3>
            <p className="font-ui text-sm text-ean-muted-light max-w-xl mx-auto">
              Connect with our FBO dispatchers, maintenance engineers, or charter advisory desk today.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact">
                <GoldButton className="px-7 py-3">Make an Inquiry</GoldButton>
              </Link>
              <Link href="/services">
                <OutlineButton variant="dark" className="px-7 py-3">Explore Our Services</OutlineButton>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
