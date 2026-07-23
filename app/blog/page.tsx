'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Newsletter form states
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useGSAP(
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
      <Navbar />

      <main className="flex-1 flex flex-col bg-ean-navy text-white select-none">
        {/* SECTION 1: Featured Post Hero */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-20 bg-linear-to-b from-ean-navy to-ean-navy-mid border-b border-ean-border-dark overflow-hidden"
        >
          {/* Subtle Ambient Radial Light */}
          <div className="absolute top-0 right-0 w-125 h-125 rounded-full bg-ean-gold/5 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Featured Details */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-3">
                  <span className="inline-block border border-ean-gold/30 bg-ean-gold/5 text-ean-gold text-[10px] sm:text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-xs">
                    Featured Article
                  </span>
                  <Link href={`/blog/${featuredArticle.slug}`} className="group block">
                    <h1
                      ref={featuredTitleRef}
                      className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-[1.1] group-hover:text-ean-gold transition-colors duration-300 opacity-0"
                    >
                      {featuredArticle.title}
                    </h1>
                  </Link>
                </div>

                <p
                  ref={featuredExcerptRef}
                  className="font-ui text-sm sm:text-base text-ean-muted-light leading-relaxed max-w-2xl opacity-0"
                >
                  {featuredArticle.excerpt}
                </p>

                {/* Metadata Row */}
                <div className="flex items-center gap-6 font-ui text-xs text-ean-muted-light border-y border-white/5 py-3 w-fit">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-ean-gold" />
                    <span>{featuredArticle.publishedAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-ean-gold" />
                    <span>{featuredArticle.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-ean-gold" />
                    <span className="text-white font-semibold">{featuredArticle.category}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/blog/${featuredArticle.slug}`} className="inline-flex items-center gap-2 text-sm font-ui font-semibold text-ean-gold hover:text-ean-gold-light group">
                    <span>Read Full Article</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero Cover Image */}
              <div 
                ref={featuredImageRef} 
                className="lg:col-span-6 relative w-full h-65 sm:h-87.5 lg:h-105 rounded-xs overflow-hidden border border-white/10 group opacity-0 shadow-2xl shadow-black/60"
              >
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="object-cover transition-transform duration-1000 group-hover:scale-103"
                  quality={90}
                />
                {/* Visual Gold corner frame border */}
                <div className="absolute inset-4 border border-white/10 group-hover:border-ean-gold/30 transition-colors duration-500 pointer-events-none" />
                <div className="absolute inset-0 bg-linear-to-t from-ean-navy/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Pill Filter Bar */}
        <section className="bg-ean-navy border-b border-ean-border-dark py-6 relative z-20">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex items-center justify-between overflow-x-auto scrollbar-none py-1 gap-8">
              {/* Category Pill Buttons */}
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`relative px-4 py-2 text-xs font-ui font-bold uppercase tracking-wider rounded-full transition-colors duration-300 cursor-pointer ${
                        isActive ? 'text-ean-navy' : 'text-ean-muted-light hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {/* Highlighted slide pill background */}
                      {isActive && (
                        <motion.span
                          layoutId="activeFilterHighlight"
                          className="absolute inset-0 bg-ean-gold rounded-full shadow-[0_4px_12px_rgba(196,149,42,0.25)]"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Editorial label */}
              <div className="hidden lg:block font-ui text-[10px] uppercase font-bold tracking-widest text-ean-gold border border-ean-gold/30 px-3 py-1 rounded-xs bg-ean-gold/5 shrink-0">
                EAN Editorial Volume II
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Staggered Article Cards Grid */}
        <section className="bg-ean-white text-ean-text-dark py-20 sm:py-24 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            
            <AnimatePresence mode="wait">
              {filteredArticles.length > 0 ? (
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                      <SectionReveal key={art.slug} className={`h-full ${gridClass}`}>
                        <Link href={`/blog/${art.slug}`} className="block h-full group focus:outline-none">
                          <motion.div
                            whileHover={{ y: -6, border: '1px solid rgba(196,149,42,0.4)', boxShadow: '0 12px 35px rgba(196,149,42,0.1)' }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className={`bg-ean-surface border border-ean-border-light/60 p-0 rounded-xs shadow-xs overflow-hidden flex flex-col ${
                              isWide 
                                ? isImageRight 
                                  ? 'lg:flex-row' 
                                  : 'lg:flex-row-reverse' 
                                : ''
                            } h-full transition-colors duration-500 hover:bg-ean-navy hover:text-white`}
                          >
                            {/* Image Box */}
                            <div className={`relative w-full ${isWide ? 'h-52 lg:h-auto lg:w-1/2 min-h-[240px]' : 'h-52'} overflow-hidden bg-black/10 shrink-0`}>
                              <Image
                                src={art.image}
                                alt={art.title}
                                fill
                                sizes="(max-width: 1024px) 100vw, 33vw"
                                className="object-cover transition-transform duration-750 group-hover:scale-104"
                                quality={85}
                              />
                              {/* Floating category tag */}
                              <span className="absolute top-4 left-4 bg-ean-navy/95 border border-ean-gold/30 text-ean-gold text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-xs">
                                {art.category}
                              </span>
                            </div>

                            {/* Body Text */}
                            <div className={`p-6 sm:p-8 flex flex-col justify-between flex-1 space-y-6 ${isWide ? 'lg:w-1/2' : ''}`}>
                              <div className="space-y-3.5">
                                {/* Date & read time */}
                                <div className="flex items-center gap-4 font-ui text-[11px] text-ean-muted-dark group-hover:text-ean-muted-light/75 transition-colors duration-300">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-ean-gold" />
                                    <span>{art.publishedAt}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-ean-gold" />
                                    <span>{art.readTime}</span>
                                  </div>
                                </div>
                                <h3 className="font-ui text-lg font-semibold text-ean-navy group-hover:text-white transition-colors duration-300 leading-snug tracking-wide">
                                  {art.title}
                                </h3>
                                <p className="font-ui text-xs sm:text-sm text-ean-muted-dark group-hover:text-white/70 leading-relaxed transition-colors duration-300">
                                  {art.excerpt}
                                </p>
                              </div>

                              {/* Action footer */}
                              <div className="pt-4 border-t border-ean-border-light/40 group-hover:border-white/10 flex justify-between items-center transition-colors duration-300">
                                <span className="font-ui text-[10px] uppercase tracking-widest text-ean-navy/40 group-hover:text-white/40">
                                  Editorial Link
                                </span>
                                <div className="flex items-center gap-1 text-sm font-semibold text-ean-gold">
                                  <span>Read Post</span>
                                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      </SectionReveal>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="no-articles"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 text-center font-ui space-y-4"
                >
                  <p className="text-ean-muted-dark text-lg">
                    No articles found matching this category.
                  </p>
                  <button
                    onClick={() => setActiveCategory('All')}
                    className="text-ean-gold font-semibold uppercase tracking-wider text-sm hover:underline"
                  >
                    View All Articles
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>

        {/* SECTION 4: Newsletter Sign-up panel */}
        <section className="bg-linear-to-r from-ean-navy to-ean-navy-mid py-20 sm:py-24 border-t border-ean-border-dark relative overflow-hidden">
          {/* Amber glow */}
          <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-ean-gold/5 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-center">
            <SectionReveal className="max-w-2xl mx-auto space-y-8">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase block">
                Executive Insights
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-light text-white leading-tight">
                Subscribe to Aviation Intel
              </h2>
              <p className="font-ui text-sm sm:text-base text-ean-muted-light max-w-lg mx-auto leading-relaxed">
                Receive our quarterly analysis of West African flight regulations, corporate aviation indices, and distributorship insights directly to your desk.
              </p>

              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.form
                    key="newsletter-form"
                    onSubmit={handleSubscribe}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                        className={`w-full bg-white/5 border px-4 py-3.5 text-sm rounded-xs placeholder:text-white/20 focus:outline-none focus:border-ean-gold transition-colors duration-300 ${
                          emailError ? 'border-red-500' : 'border-white/10'
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
                        <span className="w-4 h-4 border-2 border-ean-navy border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Subscribe</span>
                        </>
                      )}
                    </GoldButton>
                  </motion.form>
                ) : (
                  <motion.div
                    key="newsletter-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-ean-gold/10 border border-ean-gold/20 p-6 rounded-xs max-w-md mx-auto text-center flex items-center justify-center gap-3 py-6"
                  >
                    <CheckCircle2 className="w-5 h-5 text-ean-gold shrink-0" />
                    <span className="font-ui text-sm text-white font-medium">
                      Subscription successful. Welcome to Executive Insights.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionReveal>
          </div>
        </section>
      </main>
    </>
  );
}
