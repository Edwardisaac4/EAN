'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import OutlineButton from '@/components/shared/OutlineButton';
import SectionReveal from '@/components/shared/SectionReveal';

import { MOCK_POSTS } from '@/lib/constants';

export default function NewsSection() {
  return (
    <section className="bg-ean-white dark:bg-ean-navy-mid text-ean-text-dark dark:text-ean-text-light py-20 sm:py-24 transition-colors duration-500 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <SectionReveal>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="font-ui text-xs sm:text-sm font-semibold tracking-[0.25em] text-ean-gold uppercase">
                Aviation Insights
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-medium text-ean-navy dark:text-white leading-[1.15]">
                Latest News & Executive Insights
              </h2>
            </div>
            <div className="shrink-0">
              <Link href="/blog">
                <OutlineButton
                  variant="light"
                  className="dark:border-white dark:text-white dark:hover:bg-ean-gold dark:hover:border-ean-gold dark:hover:text-ean-navy"
                >
                  View All Insights
                </OutlineButton>
              </Link>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_POSTS.map((post, idx) => {
              // Bento grid config:
              // Index 0 (Post 1): lg:col-span-2 (2x1 wide)
              // Index 1 (Post 2): lg:col-span-1 (1x1 square)
              // Index 2 (Post 3): lg:col-span-3 (3x1 full-width wide)
              const gridClass = idx === 0 
                ? 'lg:col-span-2' 
                : idx === 1 
                  ? 'lg:col-span-1' 
                  : 'lg:col-span-3';

              const isWide = idx === 0 || idx === 2;
              const isReversed = idx === 2; // reverse image alignment for Post 3

              return (
                <Link 
                  key={post.slug} 
                  href={`/blog/${post.slug}`} 
                  className={`block focus:outline-none group ${gridClass}`}
                >
                  <motion.div
                    whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(196, 149, 42, 0.1)' }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`bg-ean-surface dark:bg-ean-navy border border-ean-border-light dark:border-ean-border-dark overflow-hidden rounded-xs h-full flex flex-col ${
                      isWide 
                        ? isReversed 
                          ? 'lg:flex-row-reverse' 
                          : 'lg:flex-row' 
                        : ''
                    } transition-colors duration-500 cursor-pointer shadow-xs`}
                  >
                    {/* Image wrapper */}
                    <div className={`relative w-full ${isWide ? 'h-52 lg:h-auto lg:w-1/2 min-h-[240px]' : 'h-48 sm:h-52'} overflow-hidden bg-black/10 shrink-0`}>
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        quality={85}
                      />
                    </div>

                    {/* Body Content */}
                    <div className={`p-6 sm:p-8 flex flex-col justify-between flex-1 space-y-6 ${isWide ? 'lg:w-1/2' : ''}`}>
                      <div className="space-y-4">
                        {/* Meta information */}
                        <div className="flex items-center justify-between">
                          <span className="font-ui text-[10px] uppercase font-bold tracking-[0.15em] text-ean-gold border border-ean-gold/30 px-2.5 py-0.5 rounded-xs bg-ean-gold/5">
                            {post.category}
                          </span>
                          <span className="font-ui text-xs text-ean-muted-dark dark:text-ean-muted-light">
                            {post.publishedAt}
                          </span>
                        </div>

                        {/* Headline */}
                        <h3 className="font-display text-xl sm:text-2xl font-medium text-ean-navy dark:text-white leading-tight group-hover:text-ean-gold transition-colors duration-300">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="font-ui text-sm sm:text-base text-ean-muted-dark dark:text-ean-muted-light leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Arrow Indicator */}
                      <div className="pt-2 flex items-center gap-1 font-ui text-xs font-bold tracking-widest text-ean-navy dark:text-white group-hover:text-ean-gold transition-colors duration-300 uppercase">
                        Read Article
                        <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
