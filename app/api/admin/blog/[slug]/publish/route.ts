import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminSupabase } from '@/utils/supabase/admin'
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const payload = sessionCookie ? await verifySessionToken(sessionCookie) : null

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Valid admin session required.' },
        { status: 401 }
      )
    }

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
      console.warn('[Publish API] Supabase publish error:', error)
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
