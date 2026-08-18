import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { updateSession } from '@/utils/supabase/middleware';

/**
 * API surfaces that expose lead PII (names, emails, phones, messages, captured
 * IPs) or admin write access, and therefore require a valid admin session.
 * See PUBLIC_API_ROUTES below for the deliberate exceptions.
 */
const PROTECTED_API_PREFIXES = [
  '/api/leads',
  '/api/graphql',
  '/api/admin',
  '/api/analytics',
] as const;

/**
 * Endpoints that must stay reachable without a session, even though they sit
 * under a protected prefix — the auth endpoints themselves (otherwise nobody
 * could ever sign in) and the public website lead form.
 */
const PUBLIC_API_ROUTES: ReadonlyArray<{ pathname: string; method?: string }> = [
  { pathname: '/api/admin/login' },
  { pathname: '/api/admin/logout' },
  { pathname: '/api/leads', method: 'POST' },
];

function requiresAdminSession(pathname: string, method: string): boolean {
  const isPublic = PUBLIC_API_ROUTES.some(
    (route) =>
      route.pathname === pathname && (route.method === undefined || route.method === method)
  );
  if (isPublic) return false;

  return PROTECTED_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest) {
  // Refresh Supabase auth session on every request
  const { supabaseResponse } = updateSession(request);

  const { pathname } = request.nextUrl;

  // Protect lead/admin API routes — reject with 401 JSON rather than redirecting,
  // since these are called by fetch() and a 302 to HTML would break the caller.
  if (requiresAdminSession(pathname, request.method)) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const payload = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    return supabaseResponse;
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const payload = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    const isValidSession = Boolean(payload && payload.role === 'admin');

    // If visiting login page while already authenticated, redirect to /admin
    if (pathname === '/admin/login') {
      if (isValidSession) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return supabaseResponse;
    }

    // For all other /admin routes, reject unauthenticated access
    if (!isValidSession) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  // Only the guarded surfaces. Public marketing pages have no Supabase browser
  // session and no admin cookie to check, so running this on every request just
  // added an edge invocation in front of statically rendered HTML.
  //
  // Renamed from middleware.ts in Next 16 — the `middleware` file convention is
  // deprecated in favour of `proxy`. The file name and the exported function name
  // both had to change; `config`/`matcher` is unchanged.
  matcher: ['/admin/:path*', '/api/:path*'],
};
