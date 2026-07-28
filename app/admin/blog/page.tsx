'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { FileText, Plus, Search, Eye, Edit3, Trash2, CheckCircle2, Clock, Globe } from 'lucide-react';

interface MockArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: string;
  views: number;
  status: 'published' | 'draft';
  leadsGenerated: number;
}

const INITIAL_ARTICLES: MockArticle[] = [
  {
    id: "art-1",
    title: "EAN Aviation Expands Executive Jet Maintenance Capabilities at Murtala Muhammed Airport",
    slug: "ean-aviation-expands-jet-maintenance-lagos",
    category: "Company News",
    publishedAt: "2026-07-15",
    views: 1420,
    status: "published",
    leadsGenerated: 12,
  },
  {
    id: "art-2",
    title: "Navigating NCAA Compliance & Aircraft Inspection Standards in West Africa",
    slug: "navigating-ncaa-compliance-west-africa",
    category: "Aviation Insights",
    publishedAt: "2026-07-02",
    views: 980,
    status: "published",
    leadsGenerated: 7,
  },
  {
    id: "art-3",
    title: "The Future of Private Jet Charter & VIP FBO Services in Lagos",
    slug: "future-of-private-jet-charter-lagos",
    category: "Industry Trends",
    publishedAt: "2026-06-20",
    views: 2150,
    status: "published",
    leadsGenerated: 19,
  },
  {
    id: "art-4",
    title: "Wings™ Gourmet In-Flight Catering Menu Launch for Diplomatic Flights",
    slug: "wings-gourmet-catering-menu-launch",
    category: "Services Update",
    publishedAt: "2026-07-20",
    views: 310,
    status: "draft",
    leadsGenerated: 2,
  },
];

export default function BlogCMSPage() {
  const [articles, setArticles] = useState<MockArticle[]>(INITIAL_ARTICLES);
  const [search, setSearch] = useState('');

  const filtered = articles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'published' ? 'draft' : 'published' } : a))
    );
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-ean-gold" />
              <h1 className="text-2xl font-bold font-display text-ean-white">News & Blog Content Manager</h1>
            </div>
            <p className="text-xs text-ean-muted-light mt-0.5">
              Publish industry news, press releases, and articles to drive organic search traffic and inbound leads.
            </p>
          </div>

          <button
            onClick={() => alert("Article Editor dialog opened. Here you can write markdown content, set cover image, and publish.")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ean-gold hover:bg-ean-gold-light text-ean-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(196,149,42,0.2)]"
          >
            <Plus className="w-4 h-4 stroke-3" />
            <span>Create New Article</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ean-muted-light/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search published articles..."
            className="w-full pl-9 pr-4 py-2 bg-ean-black-accent border border-ean-border-dark rounded-xl text-xs text-ean-white focus:outline-none focus:border-ean-gold"
          />
        </div>

        {/* Article Table */}
        <div className="bg-ean-black-accent/90 border border-ean-border-dark rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-ean-black-pure/80 border-b border-ean-border-dark text-ean-muted-light/70 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Article Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Readership</th>
                <th className="py-3.5 px-4">Inquiries Generated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ean-border-dark/60 text-ean-white font-ui">
              {filtered.map((art) => (
                <tr key={art.id} className="hover:bg-white/3 transition-colors">
                  <td className="py-4 px-4 font-semibold text-ean-white">
                    <Link href={`/blog/${art.slug}`} target="_blank" className="hover:text-ean-gold transition-colors flex items-center gap-1.5">
                      {art.title}
                      <Globe className="w-3 h-3 text-ean-muted-light/60" />
                    </Link>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-ean-gold-light text-[11px]">
                      {art.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleStatus(art.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        art.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {art.status}
                    </button>
                  </td>
                  <td className="py-4 px-4 font-mono text-ean-muted-light">
                    {art.views.toLocaleString()} views
                  </td>
                  <td className="py-4 px-4 font-mono text-ean-gold font-bold">
                    {art.leadsGenerated} leads
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/blog/${art.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-ean-muted-light hover:text-ean-white"
                        title="View Live Article"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => deleteArticle(art.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-ean-muted-light hover:text-rose-400"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
