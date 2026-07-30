'use client'

import React, { useState } from 'react'
import { Editor } from '@tiptap/react'
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Unlink,
  X,
  Upload,
  Loader2,
  Check,
} from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  // Link Popover state
  const [isLinkOpen, setIsLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(true)

  // Image Modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  if (!editor) return null

  // Link Handlers
  const handleOpenLinkPopover = () => {
    const existingHref = editor.getAttributes('link').href || ''
    setLinkUrl(existingHref)
    setIsLinkOpen(true)
  }

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href: linkUrl.trim(),
          target: linkOpenInNewTab ? '_blank' : '_self',
        })
        .run()
    }
    setIsLinkOpen(false)
    setLinkUrl('')
  }

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run()
    setIsLinkOpen(false)
    setLinkUrl('')
  }

  // Image Handlers
  const handleInsertImageUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() || 'Blog inline image' }).run()
      setIsImageModalOpen(false)
      setImageUrl('')
      setImageAlt('')
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploadError(null)

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError('Only JPG, PNG, and WebP images are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be under 5MB.')
      return
    }

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'post-images')

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload image')
      }

      editor
        .chain()
        .focus()
        .setImage({
          src: json.data.url,
          alt: imageAlt.trim() || file.name || 'Inline blog image',
        })
        .run()

      setIsImageModalOpen(false)
      setImageAlt('')
    } catch (err) {
      console.error('Editor image upload failed:', err)
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileUpload(file)
  }

  return (
    <div className="sticky top-0 z-10 bg-ean-black-pure/90 backdrop-blur-md border-b border-ean-border-dark px-3 py-2 flex flex-wrap items-center gap-1">
      {/* GROUP 1 — History */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-md text-ean-muted-light hover:bg-white/5 hover:text-ean-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-md text-ean-muted-light hover:bg-white/5 hover:text-ean-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-ean-border-dark mx-1" />

      {/* GROUP 2 — Headings */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
        >
          H3
        </button>
      </div>

      <div className="w-px h-5 bg-ean-border-dark mx-1" />

      {/* GROUP 3 — Inline Formatting */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive('bold')
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive('italic')
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive('underline')
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive('strike')
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive('highlight')
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-ean-border-dark mx-1" />

      {/* GROUP 4 — Lists */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-ean-border-dark mx-1" />

      {/* GROUP 5 — Blocks */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-md text-ean-muted-light hover:bg-white/5 hover:text-ean-white transition-colors"
          title="Horizontal Divider"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-ean-border-dark mx-1" />

      {/* GROUP 6 — Alignment */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive({ textAlign: 'left' })
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive({ textAlign: 'center' })
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive({ textAlign: 'right' })
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-ean-border-dark mx-1" />

      {/* GROUP 7 — Insert (Link & Image) */}
      <div className="flex items-center gap-0.5 relative">
        <button
          type="button"
          onClick={handleOpenLinkPopover}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive('link')
              ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40'
              : 'text-ean-muted-light hover:bg-white/5 hover:text-ean-white'
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsImageModalOpen(true)}
          className="p-1.5 rounded-md text-ean-muted-light hover:bg-white/5 hover:text-ean-white transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* LINK POPOVER */}
        {isLinkOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 p-3 bg-ean-black-accent border border-ean-border-dark rounded-xl shadow-2xl z-30">
            <form onSubmit={handleApplyLink} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ean-white">
                  {editor.isActive('link') ? 'Edit Link' : 'Insert Link'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLinkOpen(false)}
                  className="text-ean-muted-light hover:text-ean-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://ean.aero/..."
                className="w-full px-3 py-1.5 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold/60"
                autoFocus
              />

              <label className="flex items-center gap-2 text-xs text-ean-muted-light cursor-pointer">
                <input
                  type="checkbox"
                  checked={linkOpenInNewTab}
                  onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                  className="rounded accent-ean-gold"
                />
                Open in new tab
              </label>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 px-3 py-1.5 bg-ean-gold hover:bg-ean-gold-light text-ean-black text-xs font-semibold rounded-lg transition-colors"
                >
                  Apply
                </button>
                {editor.isActive('link') && (
                  <button
                    type="button"
                    onClick={handleRemoveLink}
                    className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Unlink className="w-3 h-3" />
                    Remove
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* IMAGE MODAL */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-ean-black-accent border border-ean-border-dark rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-ean-border-dark pb-3">
              <h3 className="text-sm font-semibold text-ean-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-ean-gold" />
                Insert Image into Post
              </h3>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-ean-muted-light hover:text-ean-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex bg-ean-black-pure p-1 rounded-lg border border-ean-border-dark">
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  imageTab === 'upload'
                    ? 'bg-ean-gold text-ean-black shadow-md'
                    : 'text-ean-muted-light hover:text-ean-white'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  imageTab === 'url'
                    ? 'bg-ean-gold text-ean-black shadow-md'
                    : 'text-ean-muted-light hover:text-ean-white'
                }`}
              >
                External URL
              </button>
            </div>

            {/* TAB 1 — Upload */}
            {imageTab === 'upload' && (
              <div className="space-y-3">
                <button
                  type="button"
                  aria-label="Upload inline image"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={handleImageDrop}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-ean-border-dark bg-ean-black-pure flex flex-col items-center justify-center p-4 text-center hover:border-ean-gold/50 transition-all cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-ean-gold"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/jpeg,image/png,image/webp'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleFileUpload(file)
                    }
                    input.click()
                  }}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-ean-gold animate-spin" />
                      <span className="text-xs text-ean-white">Uploading inline image...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-ean-gold mb-2" />
                      <span className="text-xs font-medium text-ean-white">
                        Click or drag image to upload
                      </span>
                      <span className="text-[11px] text-ean-muted-light/60 mt-1">
                        JPG, PNG, WebP up to 5MB
                      </span>
                    </>
                  )}
                </button>

                {uploadError && (
                  <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                    {uploadError}
                  </p>
                )}

                <div>
                  <label className="text-xs font-medium text-ean-muted-light">Alt Text (Accessibility)</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Descriptive caption for the image..."
                    className="w-full mt-1 px-3 py-1.5 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold/60"
                  />
                </div>
              </div>
            )}

            {/* TAB 2 — External URL */}
            {imageTab === 'url' && (
              <form onSubmit={handleInsertImageUrl} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-ean-muted-light">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full mt-1 px-3 py-1.5 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold/60"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-ean-muted-light">Alt Text (Accessibility)</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Descriptive caption for the image..."
                    className="w-full mt-1 px-3 py-1.5 bg-ean-black-pure border border-ean-border-dark rounded-lg text-xs text-ean-white focus:outline-none focus:border-ean-gold/60"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-ean-muted-light hover:text-ean-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-ean-gold hover:bg-ean-gold-light text-ean-black text-xs font-semibold transition-colors"
                  >
                    Insert Image
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
