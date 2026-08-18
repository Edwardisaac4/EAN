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

/**
 * Shape of a row from GET /api/admin/blog. Declared locally rather than reusing
 * the generated Supabase row type because this list only reads a projection of
 * it, and `content` arrives as Tiptap JSON that the table stringifies for search.
 */
interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  published_at: string | null;
  created_at: string | null;
  views: number | null;
  status: 'published' | 'draft' | null;
  content?: unknown;
}

export default function BlogCMSPage() {
  const router = useRouter();
  // Starts empty and stays empty on a failed or empty load. Seeding this with
  // mock rows made an API outage look like a populated CMS, and every action on
  // one of those rows hit a slug that does not exist.
  const [articles, setArticles] = useState<MockArticle[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BlogTemplate | null>(null);

  // Form State for new article creation
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Company News');
  const [newContent, setNewContent] = useState('');

  // Fetch live articles from Supabase API
  React.useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/admin/blog');
        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.success || !Array.isArray(json.data)) {
          setLoadError(
            'Could not load blog posts. The list below is empty because the request failed, not because there are no posts.'
          );
          return;
        }

        // Mapped unconditionally: an empty array is a real answer, and rendering
        // the empty state for it is more honest than leaving stale rows on screen.
        const mapped: MockArticle[] = (json.data as BlogPostRow[]).map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          category: item.category || 'Company News',
          publishedAt: item.published_at ? item.published_at.split('T')[0] : (item.created_at ? item.created_at.split('T')[0] : ''),
          views: item.views || 0,
          status: item.status || 'draft',
          leadsGenerated: 0,
          content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
        }));
        setArticles(mapped);
      } catch (err) {
        console.error('Failed to fetch blog posts from API:', err);
        setLoadError(
          'Could not reach the blog API. The list below is empty because the request failed, not because there are no posts.'
        );
      } finally {
        setIsLoaded(true);
      }
    }
    fetchPosts();
  }, []);

  const filtered = articles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = async (id: string) => {
    const article = articles.find((a) => a.id === id);
    if (!article) return;

    const previousStatus = article.status;
    const nextStatus = previousStatus === 'published' ? 'draft' : 'published';

    setActionError(null);

    // Optimistic UI update
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
    );

    try {
      const res =
        nextStatus === 'published'
          ? await fetch(`/api/admin/blog/${encodeURIComponent(article.slug)}/publish`, { method: 'PATCH' })
          : await fetch(`/api/admin/blog/${encodeURIComponent(article.slug)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'draft' }),
            });

      // A 4xx/5xx does not reject, so without this the optimistic row would keep
      // showing a status the database never accepted.
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to toggle post status:', err);
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: previousStatus } : a))
      );
      setActionError(`Could not change the status of “${article.title}”. It is still ${previousStatus}.`);
    }
  };

  const deleteArticle = async (id: string) => {
    const index = articles.findIndex((a) => a.id === id);
    if (index === -1) return;

    const article = articles[index];

    if (!window.confirm(`Delete “${article.title}”? This removes the post permanently.`)) {
      return;
    }

    setActionError(null);
    setArticles((prev) => prev.filter((a) => a.id !== id));

    try {
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(article.slug)}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      // Restore at its original position so the table does not reorder itself
      // after a failure the administrator did not cause.
      setArticles((prev) => {
        const restored = [...prev];
        restored.splice(index, 0, article);
        return restored;
      });
      setActionError(`Could not delete “${article.title}”. The post is still published in the CMS.`);
    }
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

    setActionError(null);

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

      const json = await res.json().catch(() => null);

      // Nothing below this point may run on a rejected create: closing the modal
      // and navigating to the editor would send the author to a slug the
      // database never stored.
      if (!res.ok || !json?.success) {
        setActionError(
          json?.error ?? 'Could not create the article. Please try again.'
        );
        return;
      }

      const finalSlug = json.data?.slug || targetSlug;

      const newArt: MockArticle = {
        id: json.data?.id || `art-${Date.now()}`,
        title: newTitle,
        slug: finalSlug,
        category: newCategory,
        publishedAt: new Date().toISOString().split('T')[0],
        views: 0,
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
      setActionError('Could not reach the blog API. The article was not created.');
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

        {(loadError || actionError) && (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-200"
          >
            {loadError ?? actionError}
          </div>
        )}

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
              {isLoaded && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center text-ean-muted-light">
                    {loadError
                      ? 'No articles could be loaded.'
                      : search
                        ? `No articles match “${search}”.`
                        : 'No articles yet. Create your first post to get started.'}
                  </td>
                </tr>
              )}
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
                    Create Draft from Template
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

