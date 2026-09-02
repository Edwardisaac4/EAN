'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { withReducedMotion } from '@/lib/gsap-motion';
import { 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  BookOpen, 
  Send, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import SectionReveal from '@/components/shared/SectionReveal';
import GoldButton from '@/components/shared/GoldButton';

import { ARTICLES_DATABASE, CATEGORIES } from '@/lib/constants';

export default function BlogPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuredTitleRef = useRef<HTMLHeadingElement>(null);
  const featuredExcerptRef = useRef<HTMLParagraphElement>(null);
  const featuredImageRef = useRef<HTMLDivElement>(null);

  // Category Filtering State
  const [activeCategory, setActiveCategory] = useState('All');

  // Sliding gold filter pill — CSS equivalent of the old layoutId morph.
  const filterBarRef = useRef<HTMLDivElement>(null);
  const filterRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [filterPill, setFilterPill] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  // Held false for the first paint so the pill appears in place rather than
  // gliding in from the left edge on load.
  const [isFilterPillAnimated, setIsFilterPillAnimated] = useState(false);

  const measureFilterPill = useCallback(() => {
    const idx = CATEGORIES.indexOf(activeCategory);
    const el = filterRefs.current[idx];
    if (!filterBarRef.current || !el) return;

    setFilterPill({
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
  }, [activeCategory]);

  useEffect(() => {
    measureFilterPill();
    const enableFrame = requestAnimationFrame(() => setIsFilterPillAnimated(true));

    const bar = filterBarRef.current;
    if (!bar) {
      return () => cancelAnimationFrame(enableFrame);
    }

    const observer = new ResizeObserver(measureFilterPill);
    observer.observe(bar);
    document.fonts?.ready.then(measureFilterPill).catch(() => {});

    return () => {
      cancelAnimationFrame(enableFrame);
      observer.disconnect();
    };
  }, [measureFilterPill]);

  // Newsletter form states
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useGSAP(
    () =>
      withReducedMotion(
        () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          tl.fromTo(
            featuredTitleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
          );

          tl.fromTo(
            featuredExcerptRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.4'
          );

          tl.fromTo(
            featuredImageRef.current,
            { opacity: 0, scale: 0.96 },
            { opacity: 1, scale: 1, duration: 1 },
            '-=0.7'
          );
        },
        () => {
          gsap.set(
            [featuredTitleRef.current, featuredExcerptRef.current, featuredImageRef.current],
            { opacity: 1, y: 0, scale: 1, clearProps: 'transform' }
          );
        }
      ),
    { scope: heroRef }
  );

  // Filtered Articles Selector (Excluding the primary featured article from grid if 'All' is selected)
  const filteredArticles = ARTICLES_DATABASE.filter((art) => {
    if (activeCategory === 'All') {
      return !art.isFeatured;
    }
    return art.category === activeCategory;
  });

  // Featured article finder
  const featuredArticle = ARTICLES_DATABASE.find((art) => art.isFeatured)!;

  // Newsletter Submit
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Email address is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email format.');
      return;
    }

    setEmailError('');
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setEmail('');
    }, 1500);
  };

  return (
    <>
      <Navbar hasPhotoHero />

      <main className="flex-1 flex flex-col bg-ean-navy text-ean-text-light">
        {/* SECTION 1: Featured Post Hero */}
        <section
          ref={heroRef}
          className="relative pt-36 pb-24 overflow-hidden"
        >
          {/*
           * Full-bleed photograph. Decorative — the featured article's own
           * headline is the h1 — so `alt` is empty. `priority` lives here now
           * rather than on the cover image below: this band is the larger
           * above-the-fold paint and therefore the LCP element, and AGENTS.md
           * §8 allows exactly one per page. `quality={70}` is the whitelisted
           * step for full-bleed hero art.
           *
           * The scrim is tuned to this frame, not shared with the other two
           * heroes. This one is a lounge interior: two warm lamps in the lower
           * left, directly behind where the excerpt starts, and a floodlit
           * fuselage behind the headline. Those are the two constraints, and
           * they are what set 40% flat plus a 35/10/40 gradient — at that
           * weight the excerpt clears 5.8:1 against its worst pixel and the
           * headline 3.8:1, while the lamps and the jet both survive. Dropping
           * to 30% puts the headline at 2.7:1 over the fuselage.
           *
           * A second photograph sits inside this band (the featured cover), and
           * the scrim is also what separates them: the band reads as ground,
           * the card as the image.
           */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <Image
              src="/images/insight Hero.jpg"
              alt=""
              fill
              sizes="100vw"
              quality={70}
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/10 to-black/40" />
          </div>

          <div className="max-w-ean mx-auto px-6 md:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Featured Details */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-3">
                  <span className="inline-block border border-white/25 bg-black/40 backdrop-blur-xs text-white text-[10px] sm:text-xs uppercase font-bold tracking-widest px-3 py-1">
                    Featured Article
                  </span>
                  <Link href={`/blog/${featuredArticle.slug}`} className="group block">
                    <h1
                      ref={featuredTitleRef}
                      className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-[1.1] group-hover:text-white/75 transition-colors duration-300"
                    >
                      {featuredArticle.title}
                    </h1>
                  </Link>
                </div>

                <p
                  ref={featuredExcerptRef}
                  className="font-ui text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl"
                >
                  {featuredArticle.excerpt}
                </p>

                {/* Metadata Row */}
                <div className="flex items-center gap-6 font-ui text-xs text-white/85 border-y border-white/20 py-3 w-fit">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white" />
                    <span>{featuredArticle.publishedAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white" />
                    <span>{featuredArticle.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold">{featuredArticle.category}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/blog/${featuredArticle.slug}`} className="inline-flex items-center gap-2 text-sm font-ui font-semibold text-white hover:text-white/75 group">
                    <span>Read Full Article</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero Cover Image */}
              <div 
                ref={featuredImageRef} 
                className="lg:col-span-6 relative w-full h-65 sm:h-87.5 lg:h-105 overflow-hidden border border-white/20 group"
              >
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-103"
                  quality={80}
                />
                {/* Inset frame. White at low opacity, not a border token — the
                    card sits on the photographic band. */}
                <div className="absolute inset-4 border border-white/20 group-hover:border-white/45 transition-colors duration-500 pointer-events-none" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Pill Filter Bar */}
        <section className="bg-ean-navy border-b border-ean-border-dark py-6 relative z-20">
          <div className="max-w-ean mx-auto px-6 md:px-8">
            <div className="flex items-center justify-between overflow-x-auto scrollbar-none py-1 gap-8">
              {/* Category Pill Buttons */}
              <div ref={filterBarRef} className="relative flex gap-2">
                {/* Single gold pill that glides to the active filter */}
                <span
                  aria-hidden="true"
                  className={`${isFilterPillAnimated ? 'ean-indicator' : ''} absolute left-0 top-0 bg-ean-gold rounded-full shadow-[0_4px_12px_rgba(43,0,152,0.25)] pointer-events-none`}
                  style={{
                    width: filterPill?.width ?? 0,
                    height: filterPill?.height ?? 0,
                    transform: `translate(${filterPill?.left ?? 0}px, ${filterPill?.top ?? 0}px)`,
                    opacity: filterPill ? 1 : 0,
                  }}
                />

                {CATEGORIES.map((cat, idx) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      ref={(el) => {
                        filterRefs.current[idx] = el;
                      }}
                      onClick={() => setActiveCategory(cat)}
                      className={`relative z-10 px-4 py-2 text-xs font-ui font-bold uppercase tracking-wider rounded-full transition-colors duration-300 cursor-pointer ${
                        isActive ? 'text-ean-text-light' : 'text-ean-muted-light hover:text-ean-text-light hover:bg-black/5'
                      }`}
                    >
                      <span className="relative z-10">{cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Editorial label */}
              <div className="hidden lg:block font-ui text-[10px] uppercase font-bold tracking-widest text-ean-gold border border-ean-gold/30 px-3 py-1 bg-ean-gold/5 shrink-0">
                EAN Editorial Volume II
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Staggered Article Cards Grid */}
        <section className="bg-ean-white text-ean-text-light py-20 sm:py-24 transition-colors duration-500">
          <div className="max-w-ean mx-auto px-6 md:px-8">
            
            {filteredArticles.length > 0 ? (
                /*
                  One trigger on the grid, then a diagonal sweep. A SectionReveal
                  per card put every card in a row on the same `top 85%` line, so
                  a row arrived on one frame.

                  `ean-enter-up` came off the container in the same move. It faded
                  the whole grid up as one block on a filter change; with the
                  `key` still here the SectionReveal remounts instead, and because
                  the grid is already past the trigger line by then the cards
                  restagger. One animation doing the job, not two over each other.
                */
                <SectionReveal
                  key={activeCategory}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  stagger={0.06}
                  grid
                >
                  {filteredArticles.map((art, idx) => {
                    // Alternate spans:
                    // idx % 4 === 0 -> 2x1 wide (image right)
                    // idx % 4 === 1 -> 1x1 square
                    // idx % 4 === 2 -> 1x1 square
                    // idx % 4 === 3 -> 2x1 wide (image left)
                    const isWide = idx % 4 === 0 || idx % 4 === 3;
                    const gridClass = isWide ? 'lg:col-span-2' : 'lg:col-span-1';
                    const isImageRight = idx % 4 === 0;

                    return (
                      <div key={art.slug} data-reveal className={`h-full ${gridClass}`}>
                        <Link href={`/blog/${art.slug}`} className="block h-full group focus:outline-none">
                          <div
                            className={`bg-ean-surface border border-ean-border-light/60 p-0 shadow-xs overflow-hidden flex flex-col group-hover:-translate-y-1.5 group-hover:border-ean-gold/40 group-hover:shadow-[0_12px_35px_rgba(43,0,152,0.1)] ${
                              isWide 
                                ? isImageRight 
                                  ? 'lg:flex-row' 
                                  : 'lg:flex-row-reverse' 
                                : ''
                            } h-full transition-[background-color,border-color,color,transform,box-shadow] duration-500 ease-out hover:bg-ean-navy hover:text-ean-text-light`}
                          >
                            {/* Image Box */}
                            <div className={`relative w-full ${isWide ? 'h-52 lg:h-auto lg:w-1/2 min-h-60' : 'h-52'} overflow-hidden bg-black/10 shrink-0`}>
                              <Image
                                src={art.image}
                                alt={art.title}
                                fill
                                sizes="(max-width: 1024px) 100vw, 33vw"
                                className="object-cover transition-transform duration-750 group-hover:scale-104"
                                quality={80}
                              />
                              {/* Floating category tag */}
                              <span className="absolute top-4 left-4 bg-ean-navy/95 border border-ean-gold/30 text-ean-gold text-[9px] uppercase font-bold tracking-widest px-2.5 py-1">
                                {art.category}
                              </span>
                            </div>

                            {/* Body Text */}
                            <div className={`p-6 sm:p-8 flex flex-col justify-between flex-1 space-y-6 ${isWide ? 'lg:w-1/2' : ''}`}>
                              <div className="space-y-3.5">
                                {/* Date & read time */}
                                <div className="flex items-center gap-4 font-ui text-[11px] text-ean-muted-light group-hover:text-ean-muted-light/75 transition-colors duration-300">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-ean-gold" />
                                    <span>{art.publishedAt}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-ean-gold" />
                                    <span>{art.readTime}</span>
                                  </div>
                                </div>
                                <h3 className="font-ui text-lg font-semibold text-ean-text-light group-hover:text-ean-text-light transition-colors duration-300 leading-snug tracking-wide">
                                  {art.title}
                                </h3>
                                <p className="font-ui text-xs sm:text-sm text-ean-muted-light group-hover:text-ean-text-light/70 leading-relaxed transition-colors duration-300">
                                  {art.excerpt}
                                </p>
                              </div>

                              {/* Action footer */}
                              <div className="pt-4 border-t border-ean-border-light/40 group-hover:border-ean-border-dark flex justify-between items-center transition-colors duration-300">
                                <span className="font-ui text-[10px] uppercase tracking-widest text-ean-text-light/40 group-hover:text-ean-text-light/40">
                                  Editorial Link
                                </span>
                                <div className="flex items-center gap-1 text-sm font-semibold text-ean-gold">
                                  <span>Read Post</span>
                                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </SectionReveal>
              ) : (
                <div
                  key="no-articles"
                  className="ean-enter-fade py-20 text-center font-ui space-y-4"
                >
                  <p className="text-ean-muted-light text-lg">
                    No articles found matching this category.
                  </p>
                  <button
                    onClick={() => setActiveCategory('All')}
                    className="text-ean-gold font-semibold uppercase tracking-wider text-sm hover:underline"
                  >
                    View All Articles
                  </button>
                </div>
              )}

          </div>
        </section>

        {/* SECTION 4: Newsletter Sign-up panel */}
        <section className="bg-linear-to-r from-ean-navy to-ean-navy-mid py-20 sm:py-24 border-t border-ean-border-dark relative overflow-hidden">

          <div className="max-w-ean mx-auto px-6 md:px-8 relative z-10 text-center">
            <SectionReveal className="max-w-2xl mx-auto space-y-8" stagger={0.14} distance={48} duration={1.1} ease="power3.out">
              <span data-reveal className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase block">
                Executive Insights
              </span>
              <h2 data-reveal className="font-display text-2xl sm:text-4xl font-light text-ean-text-light leading-tight">
                Subscribe to Aviation Intel
              </h2>
              <p data-reveal className="font-ui text-sm sm:text-base text-ean-muted-light max-w-lg mx-auto leading-relaxed">
                Receive our quarterly analysis of West African flight regulations, corporate aviation indices, and distributorship insights directly to your desk.
              </p>

              {!success ? (
                  <form
                    key="newsletter-form"
                    onSubmit={handleSubscribe}
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto items-stretch font-ui"
                    noValidate
                  >
                    <div className="flex-1 flex flex-col items-start gap-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        placeholder="client@company.com"
                        className={`w-full bg-black/5 border px-4 py-3.5 text-sm placeholder:text-ean-text-light/20 focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30 transition-colors duration-300 ${
                          emailError ? 'border-red-500' : 'border-ean-border-dark'
                        }`}
                      />
                      {emailError && (
                        <span className="text-[11px] text-red-400 mt-1 pl-1">{emailError}</span>
                      )}
                    </div>
                    <GoldButton
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3.5 flex items-center justify-center gap-2 shrink-0 h-11.5 sm:h-auto"
                    >
                      {submitting ? (
                        <span className="w-4 h-4 border border-ean-navy border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Subscribe</span>
                        </>
                      )}
                    </GoldButton>
                  </form>
                ) : (
                  <div
                    key="newsletter-success"
                    className="ean-enter-scale bg-ean-gold/10 border border-ean-gold/20 p-6 max-w-md mx-auto text-center flex items-center justify-center gap-3 py-6"
                  >
                    <CheckCircle2 className="w-5 h-5 text-ean-gold shrink-0" />
                    <span className="font-ui text-sm text-ean-text-light font-medium">
                      Subscription successful. Welcome to Executive Insights.
                    </span>
                  </div>
                )}
            </SectionReveal>
          </div>
        </section>
      </main>
    </>
  );
}
