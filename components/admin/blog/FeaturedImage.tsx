'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'

interface FeaturedImageProps {
  value: string | null
  onChange: (url: string) => void
  onRemove: () => void
}

export function FeaturedImage({ value, onChange, onRemove }: FeaturedImageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null)

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Only JPG, PNG, and WebP images are allowed.')
      return
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds 5MB limit.')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'covers')

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload image')
      }

      onChange(json.data.url)
    } catch (err) {
      console.error('Featured image upload failed:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const getFilenameFromUrl = (url: string): string => {
    try {
      const parts = url.split('/')
      return decodeURIComponent(parts[parts.length - 1])
    } catch {
      return 'Featured Cover Image'
    }
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {value ? (
        /* STATE B — Image Uploaded */
        <div className="relative">
          <button 
            type="button"
            aria-label="Replace image"
            className="w-full h-55 rounded-xl overflow-hidden border border-ean-border-dark group bg-ean-black-pure cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-ean-gold"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image
              src={value}
              alt="Featured Cover"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
            
            {/* Subtle Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs font-semibold text-white bg-black/60 px-3 py-1.5 rounded-lg border border-white/20">
                Replace image
              </span>
            </div>
          </button>

          {/* Top-Right Trash Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute top-3 right-3 p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white shadow-lg transition-colors z-10"
            title="Remove image"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Bottom-Left Filename Overlay */}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 max-w-[80%] truncate flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-ean-gold shrink-0" />
            <span className="truncate">{getFilenameFromUrl(value)}</span>
          </div>
        </div>
      ) : (
        /* STATE A — No Image Uploaded Yet */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full h-55 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center ${
            isDragging
              ? 'border-ean-gold bg-ean-gold/10'
              : 'border-ean-border-dark bg-ean-black-pure/70 hover:border-ean-gold/50 hover:bg-ean-black-pure'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-ean-gold animate-spin" />
              <p className="text-sm font-medium text-ean-white">Uploading featured image...</p>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-full bg-white/5 border border-ean-border-dark text-ean-muted-light group-hover:text-ean-gold transition-colors">
                <Upload className="w-7 h-7 text-ean-gold" />
              </div>
              <h4 className="text-sm font-semibold text-ean-white mt-3">Upload featured image</h4>
              <p className="text-xs text-ean-muted-light/60 mt-1">PNG, JPG, WebP up to 5MB</p>
              
              <button
                type="button"
                className="mt-3 px-4 py-1.5 rounded-lg bg-ean-gold hover:bg-ean-gold-light text-ean-black text-xs font-semibold transition-colors"
              >
                Browse files
              </button>

              {errorMessage && (
                <p className="text-xs font-medium text-red-400 mt-2 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20">
                  {errorMessage}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
