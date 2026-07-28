// =============================================================================
// Supabase Response Helpers
// Standard error / success response builders for API routes
// =============================================================================

import { NextResponse } from 'next/server'

export function dbError(message: string, status = 500) {
  return NextResponse.json(
    { success: false, error: message, code: 'SERVER_ERROR' },
    { status }
  )
}

export function notFound(message = 'Not found') {
  return NextResponse.json(
    { success: false, error: message, code: 'NOT_FOUND' },
    { status: 404 }
  )
}

export function badRequest(message: string) {
  return NextResponse.json(
    { success: false, error: message, code: 'BAD_REQUEST' },
    { status: 400 }
  )
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}
