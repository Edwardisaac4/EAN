import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;

    // Reject authentication if server credentials are not configured in environment
    if (!envEmail || !envPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server authentication is misconfigured. ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment.' 
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password, rememberMe } = body;

    const inputEmail = (email || '').trim().toLowerCase();
    const inputPassword = (password || '').trim();

    if (!inputEmail || !inputPassword) {
      return NextResponse.json(
        { success: false, error: 'Both email and password are required.' },
        { status: 400 }
      );
    }

    // Extract client IP / identity for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Enforce rate limit before credential validation
    const rateCheck = checkRateLimit(clientIp, inputEmail);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Please try again after ${rateCheck.retryAfterSeconds || 900} seconds.`
        },
        { status: 429 }
      );
    }

    const normalizedEnvEmail = envEmail.trim().toLowerCase();
    const normalizedEnvPassword = envPassword.trim();

    // Validate credentials
    if (inputEmail !== normalizedEnvEmail || inputPassword !== normalizedEnvPassword) {
      recordFailedAttempt(clientIp, inputEmail);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid admin credentials.' 
        },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    clearRateLimit(clientIp, inputEmail);

    // Calculate expiration: 7 days if rememberMe is true, 24 hours if false
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresInSeconds = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
    const exp = nowInSeconds + expiresInSeconds;

    // Create signed session token
    const token = await createSessionToken({
      email: normalizedEnvEmail,
      role: 'admin',
      iat: nowInSeconds,
      exp,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Executive authentication successful',
        user: {
          email: normalizedEnvEmail,
          role: 'Lead Command Admin'
        }
      },
      { status: 200 }
    );

    // Set signed HttpOnly, Secure, SameSite session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      ...(rememberMe ? { maxAge: expiresInSeconds } : {}),
    });

    return response;
  } catch (err: unknown) {
    console.error('Admin login API error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing login request.' },
      { status: 500 }
    );
  }
}
