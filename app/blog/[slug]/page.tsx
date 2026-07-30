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
  ShieldCheck,
  CheckCircle2,
  Building2,
  UserCheck
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import GoldButton from '@/components/shared/GoldButton';
import OutlineButton from '@/components/shared/OutlineButton';
import { ARTICLES_DATABASE } from '@/lib/constants';
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

// Tiptap JSON block shapes
interface TiptapTextNode {
  type: string;
  text: string;
}

interface TiptapBlock {
  type: string;
  attrs?: Record<string, number | string>;
  content?: TiptapTextNode[];
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

// Helper to get article data from DB or static constants
async function getArticleData(slug: string): Promise<ResolvedArticle | null> {
  // 1. Check Supabase first
  try {
    const { data: dbPost } = await adminSupabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
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
        image: dbPost.cover_image_url || '/images/about-jet.png',
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

  // 3. Fallback check for admin template articles or formatted slugs
  const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  if (slug.length > 3) {
    return {
      slug,
      title: formattedTitle,
      category: 'Aviation Insights',
      excerpt: 'Executive analysis and insights for corporate aircraft operations in West Africa.',
      publishedAt: 'July 2026',
      readTime: '4 min read',
      image: '/images/vip-lounge.jpg',
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
    };
  }

  const title = article.seoTitle || `${article.title} | EAN Aviation Insights`;
  const description = article.seoDescription || article.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://ean.aero/blog/${article.slug}`,
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [article.image],
    },
  };
}

// Detailed content fallback generator for static articles
function renderArticleBody(article: ResolvedArticle) {
  if (article.isFromDb && article.content) {
    if (typeof article.content === 'string') {
      return (
        <div 
          className="prose prose-lg prose-slate dark:prose-invert max-w-none font-ui leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />
      );
    }
    if (typeof article.content === 'object' && article.content !== null && !Array.isArray(article.content)) {
      const doc = article.content as { content?: TiptapBlock[] };
      if (doc.content) {
        return (
          <div className="space-y-6 font-ui text-ean-text-dark text-base sm:text-lg leading-relaxed">
            {doc.content.map((block: TiptapBlock, idx: number) => {
              if (block.type === 'heading') {
                const level = block.attrs?.level || 2;
                const text = block.content?.map((c: TiptapTextNode) => c.text).join('') || '';
                if (level === 1) {
                  return (
                    <h1 key={idx} className="font-display text-3xl sm:text-4xl text-ean-navy font-semibold pt-4">
                      {text}
                    </h1>
                  );
                }
                if (level === 3) {
                  return (
                    <h3 key={idx} className="font-display text-xl sm:text-2xl text-ean-navy font-semibold pt-4">
                      {text}
                    </h3>
                  );
                }
                return (
                  <h2 key={idx} className="font-display text-2xl sm:text-3xl text-ean-navy font-semibold pt-4">
                    {text}
                  </h2>
                );
              }
              if (block.type === 'blockquote') {
                const text = block.content?.map((c: TiptapTextNode) => c.text).join('') || '';
                return (
                  <blockquote key={idx} className="border-l-2 border-ean-gold pl-6 py-2 my-6 italic text-ean-navy bg-ean-gold/5 rounded-r-xs">
                    &ldquo;{text}&rdquo;
                  </blockquote>
                );
              }
              const text = block.content?.map((c: TiptapTextNode) => c.text).join('') || '';
              return <p key={idx}>{text}</p>;
            })}
          </div>
        );
      }
    }
  }

  // Pre-crafted executive body content tailored to EAN Aviation topics
  switch (article.slug) {
    case 'future-of-business-aviation-2026':
      return (
        <div className="space-y-8 font-ui text-ean-text-dark text-base sm:text-lg leading-relaxed">
          <p className="text-xl font-light text-ean-navy leading-relaxed border-l-2 border-ean-gold pl-6 italic">
            As corporate operations scale across West Africa, executive air travel has transitioned from an operational luxury to an indispensable business mobility tool.
          </p>

          <h2 className="font-display text-2xl sm:text-3xl text-ean-navy font-medium pt-4">
            1. Regional Flight Corridors & Demand Patterns
          </h2>
          <p>
            Recent flight tracking data across Lagos (DNMM), Abuja (DNAA), Accra (DGAA), and Port Harcourt (DNPO) highlights a 24% increase in point-to-point business jet movements over the past 18 months. High-net-worth individuals and corporate flight departments are increasingly prioritizing seamless airside access, fast-track customs clearance, and dedicated maintenance readiness.
          </p>

          <div className="bg-ean-surface border border-ean-border-light p-6 rounded-xs my-8 space-y-4">
            <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-ean-gold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Key Executive Takeaways
            </h3>
            <ul className="space-y-2 text-sm text-ean-muted-dark">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                <span>Heavy jet charters (Bombardier Challenger, Gulfstream G550/G650) saw the highest utilization on intercontinental routes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                <span>NCAA-approved line maintenance capability at arrival hubs reduces unexpected Aircraft-On-Ground (AOG) delays by up to 70%.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                <span>Rotary-wing transfers between MMIA terminal and commercial centers in Victoria Island remain preferred for diplomatic turnarounds.</span>
              </li>
            </ul>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-ean-navy font-medium pt-4">
            2. Distributorship & Fleet Modernization
          </h2>
          <p>
            Fleet operators across Nigeria are replacing aging airframes with modern fuel-efficient turboprops and twin-engine helicopters. As the exclusive distributor for Airbus Helicopters in West Africa, EAN Aviation continues to support fleet owners with direct OEM warranty backing, crew type-rating support, and localized spare parts inventories.
          </p>

          <blockquote className="border-l-2 border-ean-gold pl-6 py-4 my-8 bg-ean-navy/5 text-ean-navy font-display text-xl sm:text-2xl italic">
            &ldquo;Speed, safety, and operational autonomy are the three non-negotiables for modern executive flight departments in our region.&rdquo;
          </blockquote>

          <h2 className="font-display text-2xl sm:text-3xl text-ean-navy font-medium pt-4">
            3. Operational Outlook for 2026 and Beyond
          </h2>
          <p>
            With on-site Customs, Immigration, and Quarantine (CIQ) processing now active at the EAN Lagos FBO terminal, international arrivals process through private lounges in under 5 minutes. This infrastructure investment positions Lagos as West Africa&apos;s leading business aviation transit hub.
          </p>
        </div>
      );

    case 'navigating-fbo-regulations-west-africa':
      return (
        <div className="space-y-8 font-ui text-ean-text-dark text-base sm:text-lg leading-relaxed">
          <p className="text-xl font-light text-ean-navy leading-relaxed border-l-2 border-ean-gold pl-6 italic">
            Navigating diplomatic permits, landing approvals, and airside security across West African airspace requires deep regulatory compliance and experienced ground handling coordination.
          </p>

          <h2 className="font-display text-2xl sm:text-3xl text-ean-navy font-medium pt-4">
            Essential Compliance for Private Operators
          </h2>
          <p>
            Fixed Base Operators (FBOs) serve as the vital gateway between local civil aviation authorities and international flight operations. Maintaining IS-BAO Stage II alignment and NATA Safety 1st certification guarantees that aircraft refueling, towing, and ramp dispatch follow zero-compromise safety protocols.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="p-5 bg-ean-surface border border-ean-border-light rounded-xs space-y-2">
              <h4 className="font-semibold text-ean-navy text-base">Airside CIQ Processing</h4>
              <p className="text-xs text-ean-muted-dark">Dedicated immigration desks inside private VIP lounges prevent public terminal congestion.</p>
            </div>
            <div className="p-5 bg-ean-surface border border-ean-border-light rounded-xs space-y-2">
              <h4 className="font-semibold text-ean-navy text-base">Fuel Quality Audits</h4>
              <p className="text-xs text-ean-muted-dark">Continuous Jet A-1 thermal testing and clean delivery guarantees engine integrity.</p>
            </div>
          </div>

          <p>
            For international dispatchers planning operations into DNMM (Lagos), submitting flight manifests 24 hours prior to departure ensures instant overflight permit issuance and tarmac limousine authorization.
          </p>
        </div>
      );

    default:
      return (
        <div className="space-y-8 font-ui text-ean-text-dark text-base sm:text-lg leading-relaxed">
          <p className="text-xl font-light text-ean-navy leading-relaxed border-l-2 border-ean-gold pl-6 italic">
            {article.excerpt}
          </p>

          <h2 className="font-display text-2xl sm:text-3xl text-ean-navy font-medium pt-4">
            Executive Analysis & Industry Context
          </h2>
          <p>
            EAN Aviation Limited operates Nigeria&apos;s premier business aviation enclave at Murtala Muhammed International Airport (DNMM) in Lagos. Providing integrated FBO handling, NCAA-approved aircraft maintenance, bespoke jet and helicopter charter, and Wings™ in-flight catering, EAN sets the standard for private air travel in West Africa.
          </p>

          <div className="bg-ean-surface border border-ean-border-light p-6 rounded-xs my-8 space-y-4">
            <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-ean-gold flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Operational Standards
            </h3>
            <ul className="space-y-2 text-sm text-ean-muted-dark">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                <span>NCAA Approved Maintenance Organisation (AMO) status for corporate and commercial airframes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                <span>24/7/365 flight dispatch, diplomatic permits, and airside security escorts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0 mt-0.5" />
                <span>Exclusive Airbus Helicopters distributor in West Africa.</span>
              </li>
            </ul>
          </div>

          <p>
            To learn more about our services or request custom flight support, connect with our executive team directly via our inquiry channel.
          </p>
        </div>
      );
  }
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
      <Navbar />

      <main className="flex-1 bg-ean-white text-ean-navy">
        {/* SECTION 1: Article Header Hero */}
        <section className="relative pt-32 pb-16 bg-linear-to-b from-ean-navy to-ean-navy-mid text-white border-b border-ean-border-dark overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-125 h-125 rounded-full bg-ean-gold/5 blur-[120px] pointer-events-none" />

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
              <span className="text-white/40 truncate max-w-xs">{article.category}</span>
            </div>

            {/* Category Pill */}
            <span className="inline-block border border-ean-gold/30 bg-ean-gold/5 text-ean-gold text-[10px] sm:text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-xs">
              {article.category}
            </span>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-light text-white leading-[1.15]">
              {article.title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-ui text-ean-muted-light pt-2 border-t border-white/10">
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
                <span className="text-white font-medium">EAN Editorial Team</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Featured Image & Content Body */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-6 md:px-8 space-y-12">
            
            {/* Cover Image Container */}
            <div className="relative w-full h-72 sm:h-105 rounded-xs overflow-hidden border border-ean-border-light shadow-xl bg-black/10">
              <Image
                src={article.image}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="object-cover"
                quality={90}
              />
              <div className="absolute inset-0 border border-white/10 pointer-events-none" />
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
                  <h4 className="font-ui text-sm font-semibold text-ean-navy">EAN Aviation Editorial Desk</h4>
                  <p className="font-ui text-xs text-ean-muted-dark">West Africa&apos;s Leader in Executive Aviation Services</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/contact?inquiry=editorial&subject=${encodeURIComponent(article.title)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-ean-surface border border-ean-border-light hover:border-ean-gold text-xs font-ui font-semibold text-ean-navy rounded-xs transition-colors"
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
            <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-ui text-xs font-semibold tracking-widest text-ean-gold uppercase block">
                    Further Reading
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-medium text-ean-navy">
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
                    <div className="bg-white border border-ean-border-light rounded-xs overflow-hidden h-full flex flex-col hover:border-ean-gold/40 transition-colors shadow-xs">
                      <div className="relative w-full h-48 overflow-hidden bg-black/10">
                        <Image
                          src={rel.image}
                          alt={rel.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                        <span className="absolute top-3 left-3 bg-ean-navy/95 border border-ean-gold/30 text-ean-gold text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-xs">
                          {rel.category}
                        </span>
                      </div>
                      <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                        <div className="space-y-2">
                          <span className="text-[11px] text-ean-muted-dark font-ui">{rel.publishedAt}</span>
                          <h4 className="font-ui text-base font-semibold text-ean-navy group-hover:text-ean-gold transition-colors leading-snug">
                            {rel.title}
                          </h4>
                          <p className="font-ui text-xs text-ean-muted-dark line-clamp-2 leading-relaxed">
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
        <section className="bg-ean-navy text-white py-16 border-t border-ean-border-dark">
          <div className="max-w-4xl mx-auto px-6 md:px-8 text-center space-y-6">
            <h3 className="font-display text-3xl sm:text-4xl font-light">
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
