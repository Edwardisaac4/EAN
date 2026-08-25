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
      console.warn('[Publish API] Supabase publish error:', error.message)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to publish post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('PATCH /api/admin/blog/[slug]/publish error:', err)
    return NextResponse.json({ success: false, error: 'Failed to publish post' }, { status: 500 })
  }
}
