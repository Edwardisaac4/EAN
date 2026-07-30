'use client'

import React from 'react'
import { Editor } from '@tiptap/react'
import { Check, AlertCircle, RefreshCw, Circle } from 'lucide-react'

interface WordCountProps {
  editor: Editor | null
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved: Date | null
}

export function WordCount({ editor, status, lastSaved }: WordCountProps) {
  const words = editor?.storage.characterCount?.words() ?? 0
  const characters = editor?.storage.characterCount?.characters() ?? 0
  const readingTime = Math.ceil(words / 200)

  const formatTime = (date: Date | null): string => {
    if (!date) return ''
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="border-t border-ean-border-dark bg-ean-black-pure px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-ean-muted-light/70 select-none">
      {/* Left side stats */}
      <div className="flex items-center gap-2 font-mono">
        <span>{words} words</span>
        <span>·</span>
        <span>{characters} characters</span>
        <span>·</span>
        <span>~{readingTime} min read</span>
      </div>

      {/* Right side autosave indicator */}
      <div className="flex items-center gap-1.5 font-medium">
        {status === 'saving' && (
          <span className="flex items-center gap-1 text-ean-muted-light animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-ean-gold" />
            Saving...
          </span>
        )}

        {status === 'saved' && (
          <span className="flex items-center gap-1 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            Saved {lastSaved ? formatTime(lastSaved) : ''}
          </span>
        )}

        {status === 'error' && (
          <span className="flex items-center gap-1 text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            Save failed
          </span>
        )}

        {status === 'idle' && (
          <span className="flex items-center gap-1 text-amber-400/80">
            <Circle className="w-2 h-2 fill-amber-400 text-amber-400" />
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  )
}
