import { NextResponse } from 'next/server';
import { createSessionToken, constantTimeEqual, SESSION_COOKIE_NAME } from '@/lib/auth';
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  clientIpFrom,
  loginKey,
} from '@/lib/rate-limiter';

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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body shape.' },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = body as Record<string, unknown>;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof rememberMe !== 'boolean'
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid request payload types. Email and password must be strings, and rememberMe must be a boolean.' },
        { status: 400 }
      );
    }

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password;

    if (!inputEmail || !inputPassword) {
      return NextResponse.json(
        { success: false, error: 'Both email and password are required.' },
        { status: 400 }
      );
    }

    // Bucket on ip + email so an attacker cannot lock the real admin out of
    // their own account by exhausting the budget from a different address.
    const rateKey = loginKey(clientIpFrom(request), inputEmail);

    // Enforce the lockout before touching the credentials, so a throttled caller
    // never reaches the comparison.
    const rateCheck = await checkRateLimit(rateKey);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Please try again after ${rateCheck.retryAfterSeconds ?? 900} seconds.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSeconds ?? 900) },
        }
      );
    }

    const normalizedEnvEmail = envEmail.trim().toLowerCase();

    // Both comparisons run unconditionally and in constant time. Short-circuiting
    // on the email (`a !== b || c !== d`) leaked which half failed via response
    // latency, and `!==` on the password leaked how many leading bytes matched.
    const [isEmailMatch, isPasswordMatch] = await Promise.all([
      constantTimeEqual(inputEmail, normalizedEnvEmail),
      constantTimeEqual(inputPassword, envPassword),
    ]);

    if (!isEmailMatch || !isPasswordMatch) {
      const failure = await recordFailedAttempt(rateKey);

      // Surface the lockout on the attempt that triggers it rather than making
      // the caller submit once more to discover it.
      if (!failure.isAllowed) {
        return NextResponse.json(
          {
            success: false,
            error: `Too many failed login attempts. Please try again after ${failure.retryAfterSeconds ?? 900} seconds.`,
          },
          {
            status: 429,
            headers: { 'Retry-After': String(failure.retryAfterSeconds ?? 900) },
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid admin credentials.',
        },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    await clearRateLimit(rateKey);

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
