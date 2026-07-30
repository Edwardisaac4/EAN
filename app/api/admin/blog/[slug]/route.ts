import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminSupabase } from '@/utils/supabase/admin'
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
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
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const payload = sessionCookie ? await verifySessionToken(sessionCookie) : null

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Valid admin session required.' },
        { status: 401 }
      )
    }

    const { slug: targetSlug } = await params
    const body = await req.json()

    const { data, error } = await adminSupabase
      .from('blog_posts')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
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
