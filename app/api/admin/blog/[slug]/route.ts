import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth-guard'
import type { Database } from '@/types/supabase'

type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { slug } = await params

    const { data, error } = await adminSupabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 })
      }
      return NextResponse.json({ success: false, error: error.message || 'Database error' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('GET /api/admin/blog/[slug] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch blog post' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { slug: targetSlug } = await params
    const body = await req.json()

    const {
      title,
      slug,
      category,
      excerpt,
      content,
      featuredImg,
      cover_image_url,
      seoTitle,
      seo_title,
      seoDesc,
      seo_description,
      ogImage,
      og_image_url,
      status,
    } = body

    const updatePayload: BlogPostUpdate = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updatePayload.title = title
    if (slug !== undefined) updatePayload.slug = slug
    if (category !== undefined) updatePayload.category = category
    if (excerpt !== undefined) updatePayload.excerpt = excerpt
    if (content !== undefined) {
      updatePayload.content = (typeof content === 'string' ? { text: content } : content) as Database['public']['Tables']['blog_posts']['Row']['content']
    }
    if (featuredImg !== undefined || cover_image_url !== undefined) {
      updatePayload.cover_image_url = featuredImg !== undefined ? featuredImg : cover_image_url
    }
    if (seoTitle !== undefined || seo_title !== undefined) {
      updatePayload.seo_title = seoTitle !== undefined ? seoTitle : seo_title
    }
    if (seoDesc !== undefined || seo_description !== undefined) {
      updatePayload.seo_description = seoDesc !== undefined ? seoDesc : seo_description
    }
    if (ogImage !== undefined || og_image_url !== undefined) {
      updatePayload.og_image_url = ogImage !== undefined ? ogImage : og_image_url
    }
    if (status === 'draft' || status === 'published') {
      updatePayload.status = status
    }

    const { data, error } = await adminSupabase
      .from('blog_posts')
      .update(updatePayload)
      .eq('slug', targetSlug)
      .select()
      .single()

    if (error) {
      console.warn('[Blog API PATCH] Supabase update error:', error.message)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to update post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('PATCH /api/admin/blog/[slug] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { slug } = await params

    const { error } = await adminSupabase
      .from('blog_posts')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.warn('[Blog API DELETE] Supabase delete error:', error.message)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully' })
  } catch (err) {
    console.error('DELETE /api/admin/blog/[slug] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 })
  }
}

