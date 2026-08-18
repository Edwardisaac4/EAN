import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminSupabase } from '@/utils/supabase/admin'
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function GET() {
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

    const { data, error } = await adminSupabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Full detail stays server-side. A Postgres error message can name
      // columns, constraints and policies, none of which belong in a response
      // body — even an authenticated one.
      console.warn('[Blog API GET] Supabase fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch blog posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('GET /api/admin/blog error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

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
      featuredImg,
      cover_image_url,
      seoTitle,
      seo_title,
      seoDesc,
      seo_description,
      ogImage,
      og_image_url,
      status = 'draft',
    } = body

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // Prepare clean DB insert payload
    const postPayload = {
      title,
      slug,
      category,
      excerpt,
      content: typeof content === 'string' ? { text: content } : content,
      cover_image_url: featuredImg ?? cover_image_url ?? null,
      seo_title: seoTitle || seo_title || title,
      seo_description: seoDesc || seo_description || excerpt,
      og_image_url: ogImage ?? og_image_url ?? null,
      status,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await adminSupabase
      .from('blog_posts')
      .insert([postPayload])
      .select()
      .single()

    if (error) {
      console.warn('[Blog API POST] Supabase insert error:', error)

      // 23505 is the Postgres unique_violation code. The slug is the only
      // unique column on blog_posts, so this is a title the author has already
      // used — an actionable conflict, not a server fault.
      if (error.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'A post with this slug already exists. Choose a different title.',
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create blog post' },
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

