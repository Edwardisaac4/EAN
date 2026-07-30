'use client'

import React, { useEffect } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import { EditorToolbar } from './EditorToolbar'
import { WordCount } from './WordCount'

interface BlogEditorProps {
  initialContent?: Record<string, unknown> | string | null
  onChange: (content: Record<string, unknown>) => void
  status?: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved?: Date | null
  onEditorReady?: (editor: Editor) => void
}

export function BlogEditor({
  initialContent,
  onChange,
  status = 'idle',
  lastSaved = null,
  onEditorReady,
}: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto my-6 border border-ean-border-dark shadow-md',
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-ean-gold underline hover:text-ean-gold-light transition-colors',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your post content here...',
      }),
      CharacterCount,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-ean-gold/20 text-ean-gold px-1 rounded border border-ean-gold/30',
        },
      }),
      Typography,
    ],
    content: initialContent ?? '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none prose-headings:font-display prose-headings:text-ean-white prose-p:text-ean-muted-light prose-p:leading-relaxed prose-a:text-ean-gold prose-a:no-underline prose-blockquote:border-l-4 prose-blockquote:border-ean-gold prose-blockquote:bg-ean-gold/5 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:text-ean-white prose-code:bg-white/10 prose-code:text-ean-gold prose-code:px-1.5 prose-code:rounded prose-img:rounded-xl focus:outline-none min-h-[500px] p-6 text-ean-white font-ui text-sm md:text-base',
      },
    },
  })

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  return (
    <div className="w-full bg-ean-black-accent/80 border border-ean-border-dark rounded-xl overflow-hidden shadow-lg flex flex-col min-h-[600px]">
      {/* Sticky Formatting Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor Body Input Area */}
      <div className="flex-1 bg-ean-black-pure/70 cursor-text">
        <EditorContent editor={editor} />
      </div>

      {/* Bottom Status Bar */}
      <WordCount editor={editor} status={status} lastSaved={lastSaved} />
    </div>
  )
}
