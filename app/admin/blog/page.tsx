'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { BLOG_TEMPLATES, BlogTemplate } from '@/lib/blog-templates';
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  Globe, 
  Sparkles, 
  X, 
  Check, 
  Building2, 
  BookOpen, 
  Award 
} from 'lucide-react';

interface MockArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: string;
  views: number;
  status: 'published' | 'draft';
  leadsGenerated: number;
  content?: string;
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
  const router = useRouter();
  const [articles, setArticles] = useState<MockArticle[]>(INITIAL_ARTICLES);
  const [search, setSearch] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BlogTemplate | null>(null);

  // Form State for new article creation
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Company News');
  const [newContent, setNewContent] = useState('');

  const filtered = articles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'published' ? 'draft' : 'published' } : a))
    );
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleApplyTemplate = (template: BlogTemplate) => {
    setSelectedTemplate(template);
    setNewTitle(template.defaultTitle);
    setNewCategory(template.category);
    setNewContent(template.defaultContent);
  };

  const handleCreateArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          slug: targetSlug,
          category: newCategory,
          content: newContent,
          status: 'draft',
        }),
      });

      const json = await res.json();
      const finalSlug = json.data?.slug || targetSlug;

      const newArt: MockArticle = {
        id: json.data?.id || `art-${Date.now()}`,
        title: newTitle,
        slug: finalSlug,
        category: newCategory,
        publishedAt: new Date().toISOString().split('T')[0],
        views: 1,
        status: 'draft',
        leadsGenerated: 0,
        content: newContent,
      };

      setArticles((prev) => [newArt, ...prev]);
      setIsTemplateModalOpen(false);
      setSelectedTemplate(null);
      setNewTitle('');
      setNewContent('');

      router.push(`/admin/blog/${encodeURIComponent(finalSlug)}/edit`);
    } catch (err) {
      console.error('Failed to create article via template:', err);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-5 h-5 text-ean-gold" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-sky-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Award': return <Award className="w-5 h-5 text-emerald-400" />;
      default: return <FileText className="w-5 h-5 text-ean-gold" />;
    }
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

          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-ean-border-dark hover:border-ean-gold/50 text-ean-white font-semibold text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-ean-gold" />
              <span>New Blank Post</span>
            </Link>

            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ean-gold hover:bg-ean-gold-light text-ean-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(196,149,42,0.25)] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 stroke-3" />
              <span>Create Article with Template</span>
            </button>
          </div>
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
                        href={`/admin/blog/${art.slug}/edit`}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-ean-gold/20 text-ean-muted-light hover:text-ean-gold transition-colors"
                        title="Edit Article"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </Link>
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
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-ean-muted-light hover:text-rose-400 cursor-pointer"
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

      {/* Blog Posting Templates Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-ean-black-accent border border-ean-border-dark rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-ean-border-dark pb-4">
              <div>
                <h2 className="text-lg font-bold font-display text-ean-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-ean-gold" />
                  Select Blog Posting Template
                </h2>
                <p className="text-xs text-ean-muted-light">
                  Choose a pre-structured template for press releases, industry guides, or client case studies.
                </p>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 rounded-lg text-ean-muted-light hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BLOG_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate?.id === tmpl.id;
                return (
                  <button
                    type="button"
                    key={tmpl.id}
                    onClick={() => handleApplyTemplate(tmpl)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-ean-gold ${
                      isSelected
                        ? 'bg-ean-gold/15 border-ean-gold text-white shadow-[0_0_15px_rgba(196,149,42,0.25)]'
                        : 'bg-ean-black-pure border-ean-border-dark text-ean-muted-light hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {renderIcon(tmpl.iconName)}
                        <span className="font-semibold text-xs text-ean-white">{tmpl.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-ean-gold" />}
                    </div>
                    <p className="text-[11px] text-ean-muted-light line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Article Content Form */}
            {selectedTemplate && (
              <form onSubmit={handleCreateArticleSubmit} className="space-y-4 pt-4 border-t border-ean-border-dark">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ean-white">Article Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ean-white">Article Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ean-white">Pre-formatted Body Content</label>
                  <textarea
                    rows={8}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white font-mono focus:outline-none focus:border-ean-gold resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-ean-muted-light"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-ean-gold hover:bg-ean-gold-light text-ean-black font-semibold text-xs shadow-md"
                  >
                    Publish Article with Template
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

