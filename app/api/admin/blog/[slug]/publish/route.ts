import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth-guard'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response

    const { slug } = await params

    const { data, error } = await adminSupabase
      .from('blog_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      // Full detail stays server-side. A Postgres error message can name
      // columns, constraints and policies, none of which belong in a response
      // body — even an authenticated one.
      console.warn('[Publish API] Supabase publish error:', error)

      // .single() reports "no rows returned" as PGRST116. Publishing a slug that
      // does not exist is a client mistake, not a server fault, and returning
      // 500 for it made a typo indistinguishable from an outage.
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Blog post not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to publish post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('PATCH /api/admin/blog/[slug]/publish error:', err)
    return NextResponse.json({ success: false, error: 'Failed to publish post' }, { status: 500 })
  }
}
