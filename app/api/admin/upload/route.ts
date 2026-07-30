import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminSupabase } from '@/utils/supabase/admin'
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Auth Verification — Check admin session token from cookies
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const payload = sessionCookie ? await verifySessionToken(sessionCookie) : null

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Valid admin session required.' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'post-images'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate folder
    const allowedFolders = ['covers', 'post-images', 'og']
    const targetFolder = allowedFolders.includes(folder) ? folder : 'post-images'

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Only JPG, PNG, and WebP images are allowed' },
        { status: 400 }
      )
    }

    // Validate size — 5MB max
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File must be under 5MB' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop() || 'jpg'
    const sanitizeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
    const fileName = `${targetFolder}/${Date.now()}-${sanitizeName}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const bucketName = 'blog-images'

    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.warn('[Upload API] Supabase storage upload error:', uploadError.message)
      return NextResponse.json(
        { success: false, error: uploadError.message || 'File upload failed' },
        { status: 500 }
      )
    }

    const { data: publicUrlData } = adminSupabase.storage
      .from(bucketName)
      .getPublicUrl(uploadData.path)

    return NextResponse.json({
      success: true,
      data: { url: publicUrlData.publicUrl },
    })
  } catch (err) {
    console.error('POST /api/admin/upload error:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to upload image' },
      { status: 500 }
    )
  }
}
