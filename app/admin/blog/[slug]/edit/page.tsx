'use client'

import React, { useState, useEffect, useRef, useCallback, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Globe, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { FeaturedImage } from '@/components/admin/blog/FeaturedImage'
import { BlogEditor } from '@/components/admin/blog/BlogEditor'
import { PostMeta } from '@/components/admin/blog/PostMeta'
import { SEOPanel } from '@/components/admin/blog/SEOPanel'

interface EditPageProps {
  params: Promise<{ slug: string }>
}

export default function EditBlogPostPage({ params }: EditPageProps) {
  const { slug: routeSlug } = use(params)
  const router = useRouter()

  // Full Page State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState(routeSlug || '')
  const [slugEdited, setSlugEdited] = useState(true)
  const [category, setCategory] = useState('Business Aviation')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState<Record<string, unknown>>({})
  const [featuredImg, setFeaturedImg] = useState<string | null>(null)
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')
  const [ogImage, setOgImage] = useState<string | null>(null)
  const [status, setStatus] = useState<'draft' | 'published'>('draft')

  // Loading & Save State
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch Existing Post Data
  useEffect(() => {
    async function loadPostData() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/admin/blog/${encodeURIComponent(routeSlug)}`)
        const json = await res.json()

        if (json.success && json.data) {
          const post = json.data
          setTitle(post.title || '')
          setSlug(post.slug || routeSlug)
          setCategory(post.category || 'Business Aviation')
          setExcerpt(post.excerpt || '')
          setContent(post.content || {})
          setFeaturedImg(post.cover_image_url || null)
          setSeoTitle(post.seo_title || '')
          setSeoDesc(post.seo_description || '')
          setOgImage(post.og_image_url || null)
          setStatus(post.status || 'draft')
        }
      } catch (err) {
        console.error('Failed to load post for editing:', err)
        setToastMessage({ type: 'error', text: 'Failed to load post details' })
      } finally {
        setIsLoading(false)
      }
    }

    if (routeSlug) {
      loadPostData()
    }
  }, [routeSlug])

  // Save Draft / Save Changes
  const saveDraft = useCallback(async () => {
    if (!title.trim()) return

    setSaveStatus('saving')
    try {
      const payload = {
        title,
        slug,
        category,
        excerpt,
        content,
        featuredImg,
        seoTitle,
        seoDesc,
        ogImage,
        status,
      }

      const res = await fetch(`/api/admin/blog/${encodeURIComponent(routeSlug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save changes')
      }

      setSaveStatus('saved')
      setLastSaved(new Date())

      if (slug && slug !== routeSlug) {
        router.replace(`/admin/blog/${encodeURIComponent(slug)}/edit`)
      }
    } catch (err) {
      console.error('Save failed:', err)
      setSaveStatus('error')
    }
  }, [title, slug, category, excerpt, content, featuredImg, seoTitle, seoDesc, ogImage, status, routeSlug, router])

  // Clear autosave timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current)
        autosaveTimer.current = null
      }
    }
  }, [])

  // Trigger Debounced Autosave (3s) for drafts
  const triggerAutosave = useCallback(() => {
    if (status === 'published') return
    if (!title.trim()) return

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current)
      autosaveTimer.current = null
    }
    autosaveTimer.current = setTimeout(() => {
      saveDraft()
    }, 3000)
  }, [saveDraft, status, title])

  useEffect(() => {
    if (!isLoading && title.trim() && status === 'draft') {
      triggerAutosave()
    }
  }, [title, content, excerpt, category, slug, featuredImg, seoTitle, seoDesc, ogImage, triggerAutosave, status, isLoading])

  // Handle Publish / Update Action
  const handlePublishConfirm = async () => {
    if (!title.trim()) {
      setToastMessage({ type: 'error', text: 'Please enter a post title' })
      return
    }

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current)
      autosaveTimer.current = null
    }

    setPublishing(true)
    setIsPublishModalOpen(false)

    try {
      const saveRes = await fetch(`/api/admin/blog/${encodeURIComponent(routeSlug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          category,
          excerpt,
          content,
          featuredImg,
          seoTitle,
          seoDesc,
          ogImage,
        }),
      })

      const saveJson = await saveRes.json()

      if (!saveRes.ok || !saveJson.success) {
        throw new Error(saveJson.error || 'Failed to update post content')
      }

      const pubRes = await fetch(`/api/admin/blog/${encodeURIComponent(slug)}/publish`, {
        method: 'PATCH',
      })

      const pubJson = await pubRes.json()

      if (!pubRes.ok || !pubJson.success) {
        throw new Error(pubJson.error || 'Failed to publish post')
      }

      setStatus('published')
      setSaveStatus('saved')
      setLastSaved(new Date())
      setToastMessage({ type: 'success', text: 'Post published / updated successfully!' })

      setTimeout(() => {
        router.push('/admin/blog')
      }, 1500)
    } catch (err) {
      console.error('Publish update error:', err)
      setToastMessage({ type: 'error', text: err instanceof Error ? err.message : 'Publish failed' })
    } finally {
      setPublishing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-ean-black-pure text-ean-white">
        <Loader2 className="w-8 h-8 text-ean-gold animate-spin mb-3" />
        <p className="text-sm font-medium text-ean-muted-light">Loading post for editing...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-ean-black-pure text-ean-white min-h-screen">
      {/* TOPBAR */}
      <header className="sticky top-0 z-20 bg-ean-black-accent/90 backdrop-blur-md border-b border-ean-border-dark px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Back Link & Post Title */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="flex items-center gap-2 text-xs font-semibold text-ean-muted-light hover:text-ean-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Blog Posts</span>
          </Link>

          <div className="h-4 w-px bg-ean-border-dark hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-medium text-ean-white truncate max-w-50">
              Editing: {title || routeSlug}
            </span>
            {status === 'published' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Published
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Draft
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveDraft}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-ean-border-dark text-xs text-ean-white hover:border-ean-gold/40 transition-all font-medium disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-ean-gold" />
            ) : (
              <Save className="w-3.5 h-3.5 text-ean-gold" />
            )}
            <span>{status === 'published' ? 'Save Changes' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            disabled={publishing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-ean-gold hover:bg-ean-gold-light text-ean-black text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {publishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
            <span>{status === 'published' ? 'Update Live Post' : 'Publish Post'}</span>
          </button>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          className={`mx-6 mt-4 p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6">
        {/* MAIN COLUMN */}
        <div className="flex-1 space-y-6 min-w-0">
          <FeaturedImage
            value={featuredImg}
            onChange={setFeaturedImg}
            onRemove={() => setFeaturedImg(null)}
          />

          <div className="space-y-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write your post title here..."
              className="w-full text-2xl md:text-3xl font-bold font-display bg-ean-black-accent/80 border border-ean-border-dark text-ean-white rounded-xl px-5 py-4 focus:outline-none focus:border-ean-gold/60 focus:ring-1 focus:ring-ean-gold/30 placeholder:text-ean-muted-light/30 transition-all"
            />
          </div>

          <BlogEditor
            initialContent={content}
            onChange={setContent}
            status={saveStatus}
            lastSaved={lastSaved}
          />
        </div>

        {/* SIDEBAR COLUMN */}
        <div className="w-full lg:w-[320px] space-y-6 shrink-0">
          <PostMeta
            category={category}
            onCategoryChange={setCategory}
            slug={slug}
            onSlugChange={setSlug}
            slugEdited={slugEdited}
            onSlugEdit={() => setSlugEdited(true)}
            title={title}
            excerpt={excerpt}
            onExcerptChange={setExcerpt}
          />

          <SEOPanel
            postTitle={title}
            postExcerpt={excerpt}
            postSlug={slug}
            featuredImage={featuredImg}
            seoTitle={seoTitle}
            onSeoTitleChange={setSeoTitle}
            seoDescription={seoDesc}
            onSeoDescriptionChange={setSeoDesc}
            ogImage={ogImage}
            onOgImageChange={setOgImage}
          />
        </div>
      </main>

      {/* PUBLISH / UPDATE CONFIRMATION MODAL */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-ean-black-accent border border-ean-border-dark rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-ean-gold">
              <div className="p-2.5 rounded-full bg-ean-gold/10 border border-ean-gold/20">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-ean-white">
                {status === 'published' ? 'Update Live Blog Post?' : 'Publish Blog Post?'}
              </h3>
            </div>

            <p className="text-xs text-ean-muted-light leading-relaxed">
              This action will publish / update <strong className="text-ean-white">&quot;{title}&quot;</strong> live on <span className="text-ean-gold font-mono">ean.aero/blog/{slug}</span>. Continue?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ean-border-dark">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-ean-muted-light hover:text-ean-white text-xs font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePublishConfirm}
                disabled={publishing}
                className="px-5 py-2 rounded-lg bg-ean-gold hover:bg-ean-gold-light text-ean-black text-xs font-semibold transition-colors flex items-center gap-2 shadow-md"
              >
                {publishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{status === 'published' ? 'Confirm Update' : 'Confirm & Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
