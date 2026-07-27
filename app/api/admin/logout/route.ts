import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      { success: true, message: 'Admin session revoked successfully' },
      { status: 200 }
    );

    // Clear session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (err: unknown) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during logout.' },
      { status: 500 }
    );
  }
}
