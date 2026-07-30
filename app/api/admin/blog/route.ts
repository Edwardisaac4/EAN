import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminSupabase } from '@/utils/supabase/admin'
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const {
      title,
      slug,
      category = 'Business Aviation',
      excerpt = '',
      content = {},
      featuredImg = null,
      seoTitle = '',
      seoDesc = '',
      ogImage = null,
      status = 'draft',
    } = body

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // Try inserting into Supabase blog_posts table
    const postPayload = {
      title,
      slug,
      category,
      excerpt,
      content,
      cover_image_url: featuredImg,
      seo_title: seoTitle,
      seo_description: seoDesc,
      og_image_url: ogImage,
      status,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await adminSupabase
      .from('blog_posts')
      .insert([postPayload])
      .select()
      .single()

    if (error) {
      console.warn('[Blog API] Supabase insert error:', error.message)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to create blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (err) {
    console.error('POST /api/admin/blog error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
