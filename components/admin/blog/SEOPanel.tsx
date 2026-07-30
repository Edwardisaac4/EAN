'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Upload,
  Trash2,
  Loader2,
  Globe,
  Share2,
} from 'lucide-react'

interface SEOPanelProps {
  postTitle: string
  postExcerpt: string
  postSlug: string
  featuredImage: string | null
  seoTitle: string
  onSeoTitleChange: (val: string) => void
  seoDescription: string
  onSeoDescriptionChange: (val: string) => void
  ogImage: string | null
  onOgImageChange: (url: string | null) => void
}

export function SEOPanel({
  postTitle,
  postExcerpt,
  postSlug,
  featuredImage,
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  ogImage,
  onOgImageChange,
}: SEOPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploadingOg, setIsUploadingOg] = useState(false)
  const [ogError, setOgError] = useState<string | null>(null)
  const ogFileInputRef = useRef<HTMLInputElement>(null)

  const handleOgFileUpload = async (file: File) => {
    setOgError(null)

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setOgError('Only JPG, PNG, and WebP images allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setOgError('File must be under 5MB')
      return
    }

    setIsUploadingOg(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'og')

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload OG image')
      }

      onOgImageChange(json.data.url)
    } catch (err) {
      console.error('OG image upload failed:', err)
      setOgError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploadingOg(false)
    }
  }

  // Calculate live display values for Google Preview
  const displayTitle = seoTitle.trim() || postTitle.trim() || 'Untitled Post — EAN Aviation'
  const displayDesc =
    seoDescription.trim() ||
    postExcerpt.trim() ||
    'Read the latest executive aviation insights, fleet operational updates, and industry announcements from EAN Aviation.'
  const displaySlug = postSlug.trim() || 'post-url-slug'

  // Counter styling helpers
  const getTitleCounterColor = (len: number) => {
    if (len >= 60) return 'text-red-400 font-semibold'
    if (len >= 50) return 'text-amber-400 font-medium'
    return 'text-ean-muted-light/60'
  }

  const getDescCounterColor = (len: number) => {
    if (len >= 160) return 'text-red-400 font-semibold'
    if (len >= 140) return 'text-amber-400 font-medium'
    return 'text-ean-muted-light/60'
  }

  const titleProgressPercent = Math.min(100, Math.round((seoTitle.length / 60) * 100))
  const descProgressPercent = Math.min(100, Math.round((seoDescription.length / 160) * 100))

  return (
    <div className="bg-ean-black-accent/80 border border-ean-border-dark rounded-xl overflow-hidden shadow-lg transition-all">
      {/* Collapsible Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-ean-white flex items-center gap-2">
          <Search className="w-4 h-4 text-ean-gold" />
          SEO & Social Settings
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ean-muted-light/60 font-mono">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-ean-gold" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ean-muted-light" />
          )}
        </div>
      </button>

      {/* Expanded Content Area */}
      {isOpen && (
        <div className="p-5 border-t border-ean-border-dark space-y-5">
          {/* FIELD 1 — SEO Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-ean-muted-light">SEO Title</label>
              <span className={`font-mono ${getTitleCounterColor(seoTitle.length)}`}>
                {seoTitle.length} / 60
              </span>
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              placeholder="Leave blank to use post title"
              className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold/60 focus:ring-1 focus:ring-ean-gold/30"
            />
            {/* Progress bar */}
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  seoTitle.length >= 60
                    ? 'bg-red-500'
                    : seoTitle.length >= 50
                    ? 'bg-amber-400'
                    : 'bg-ean-gold'
                }`}
                style={{ width: `${titleProgressPercent}%` }}
              />
            </div>
          </div>

          {/* FIELD 2 — Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-ean-muted-light">Meta Description</label>
              <span className={`font-mono ${getDescCounterColor(seoDescription.length)}`}>
                {seoDescription.length} / 160
              </span>
            </div>
            <textarea
              rows={3}
              value={seoDescription}
              onChange={(e) => onSeoDescriptionChange(e.target.value)}
              placeholder="Short description for search engine results..."
              className="w-full px-3 py-2 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold/60 focus:ring-1 focus:ring-ean-gold/30 resize-none leading-relaxed"
            />
            {/* Progress bar */}
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  seoDescription.length >= 160
                    ? 'bg-red-500'
                    : seoDescription.length >= 140
                    ? 'bg-amber-400'
                    : 'bg-ean-gold'
                }`}
                style={{ width: `${descProgressPercent}%` }}
              />
            </div>
          </div>

          {/* FIELD 3 — OG Image */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ean-muted-light flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-ean-gold" />
                Social Share Image (OG)
              </span>
              <span className="text-[10px] text-ean-muted-light/60">Rec: 1200×630px</span>
            </label>

            <input
              type="file"
              ref={ogFileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleOgFileUpload(file)
              }}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {ogImage ? (
              <div className="relative w-full h-25 rounded-lg overflow-hidden border border-ean-border-dark group bg-ean-black-pure">
                <Image
                  src={ogImage}
                  alt="OG Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => onOgImageChange(null)}
                  className="absolute top-2 right-2 p-1.5 rounded bg-red-500/80 hover:bg-red-600 text-white transition-colors"
                  title="Remove OG Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                aria-label="Upload OG Image"
                onClick={() => ogFileInputRef.current?.click()}
                className="w-full h-25 rounded-lg border border-dashed border-ean-border-dark bg-ean-black-pure hover:border-ean-gold/50 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ean-gold"
              >
                {isUploadingOg ? (
                  <Loader2 className="w-5 h-5 text-ean-gold animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-ean-gold mb-1" />
                    <span className="text-xs font-medium text-ean-white">Upload OG Image</span>
                    <span className="text-[10px] text-ean-muted-light/60">
                      {featuredImage ? 'Fallback: Using Featured Image' : 'Fallback: Featured Image'}
                    </span>
                  </>
                )}
              </button>
            )}

            {ogError && (
              <p className="text-[11px] text-red-400 bg-red-500/10 p-1.5 rounded border border-red-500/20">
                {ogError}
              </p>
            )}
          </div>

          {/* LIVE GOOGLE PREVIEW */}
          <div className="pt-2 border-t border-ean-border-dark/50">
            <span className="text-[11px] font-semibold text-ean-muted-light uppercase tracking-wider mb-2 flex items-center gap-1">
              <Globe className="w-3 h-3 text-ean-gold" />
              Live Google Search Preview
            </span>

            <div className="bg-ean-black-pure border border-ean-border-dark p-3.5 rounded-xl space-y-1 select-none">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 truncate">
                <span>ean.aero</span>
                <span className="text-ean-muted-light/40">›</span>
                <span>blog</span>
                <span className="text-ean-muted-light/40">›</span>
                <span className="text-ean-muted-light/70 truncate">{displaySlug}</span>
              </div>

              <h4 className="text-sm font-medium text-sky-400 hover:underline cursor-pointer truncate leading-tight">
                {displayTitle}
              </h4>

              <p className="text-xs text-ean-muted-light/80 line-clamp-2 leading-relaxed">
                {displayDesc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
