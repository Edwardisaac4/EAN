import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminSupabase } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth-guard'
import type { Database, Json } from '@/types/supabase'

type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

interface RouteParams {
  params: Promise<{ slug: string }>
}

/**
 * Mirrors the recursive `Json` type the `content` column is declared as, so a
 * validated body can be assigned to BlogPostUpdate without an assertion.
 * z.lazy is required because the type refers to itself.
 */
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(z.string(), jsonSchema),
  ])
)

/**
 * Accepted PATCH body.
 *
 * Previously the handler destructured `await req.json()`, which is `any`, so
 * every field arrived untyped and went straight into the update — `title: 42`
 * or `status: "deleted"` would have been written to the row. Unknown keys are
 * stripped rather than rejected, so an editor sending extra client-side state
 * still succeeds.
 *
 * Both casings are kept: the editor posts camelCase, other callers snake_case.
 */
const blogPostPatchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  category: z.string().optional(),
  excerpt: z.string().optional(),
  content: jsonSchema.optional(),
  featuredImg: z.string().nullable().optional(),
  cover_image_url: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seo_title: z.string().nullable().optional(),
  seoDesc: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  og_image_url: z.string().nullable().optional(),
  status: z.enum(['draft', 'published']).optional(),
})

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
      // Postgres messages name columns, constraints and policies; they stay in
      // the server log rather than the response body.
      console.warn('[Blog API GET] Supabase fetch error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch blog post' }, { status: 500 })
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

    let rawBody: unknown
    try {
      rawBody = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      )
    }

    const parsed = blogPostPatchSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

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
    } = parsed.data

    const updatePayload: BlogPostUpdate = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updatePayload.title = title
    if (slug !== undefined) updatePayload.slug = slug
    if (category !== undefined) updatePayload.category = category
    if (excerpt !== undefined) updatePayload.excerpt = excerpt
    if (content !== undefined) {
      // A bare string is wrapped so the column always holds a JSON object,
      // matching what POST /api/admin/blog writes. No assertion needed now that
      // `content` is typed as Json rather than arriving as `any`.
      updatePayload.content = typeof content === 'string' ? { text: content } : content
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
    if (status !== undefined) {
      updatePayload.status = status
    }

    const { data, error } = await adminSupabase
      .from('blog_posts')
      .update(updatePayload)
      .eq('slug', targetSlug)
      .select()
      .single()

    if (error) {
      console.warn('[Blog API PATCH] Supabase update error:', error)

      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Blog post not found' },
          { status: 404 }
        )
      }

      // The slug is the only unique column, so this is a slug already in use.
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'A post with this slug already exists. Choose a different one.' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to update post' },
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
      console.warn('[Blog API DELETE] Supabase delete error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully' })
  } catch (err) {
    console.error('DELETE /api/admin/blog/[slug] error:', err)
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 })
  }
}

