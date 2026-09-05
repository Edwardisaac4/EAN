import type { NextConfig } from "next";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Supabase Storage origin, derived from the public project URL.
 *
 * Needed in two places: images.remotePatterns (blog covers uploaded through the
 * admin editor are served from here) and the CSP img-src/connect-src. Falls back
 * to a wildcard subdomain so a build without the env var still produces a
 * working config rather than a broken one.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = (() => {
  if (!supabaseUrl) return "*.supabase.co";
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return "*.supabase.co";
  }
})();
const supabaseOrigin = supabaseHostname.startsWith("*")
  ? "https://*.supabase.co"
  : `https://${supabaseHostname}`;

/**
 * Content Security Policy.
 *
 * `script-src` carries 'unsafe-inline' deliberately. The strict alternative is a
 * per-request nonce, but a nonce cannot be embedded in statically prerendered
 * HTML — adopting one would force every public page to render on demand and
 * throw away the static prerendering that AGENTS.md §8 exists to protect. Given
 * this site renders no user-authored markup into a script context (blog bodies
 * are sanitised and rendered as data), the trade favours keeping the pages
 * static. Revisit if a page ever starts echoing untrusted input into HTML.
 *
 * 'unsafe-eval' is conditionally included in development mode only — React 19+
 * requires eval() for cross-environment callstack reconstruction. In production
 * the directive is absent, so the policy still blocks the most common injection
 * payloads.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  // Blocks <form action> exfiltration to a third-party host.
  "form-action 'self'",
  // Clickjacking defence; supersedes X-Frame-Options in modern browsers, which
  // is still sent below for older ones.
  "frame-ancestors 'none'",
  "object-src 'none'",
  // The contact-page Google Maps embed. Without this the iframe inherits
  // `default-src 'self'` and the browser blocks it outright — the map renders
  // as an empty box with a console error and nothing else. Google alone; this
  // is not a general licence to frame third parties.
  "frame-src 'self' https://www.google.com https://maps.google.com",
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval' " : ""}https://www.googletagmanager.com https://www.google-analytics.com`,
  "style-src 'self' 'unsafe-inline'",
  // next/font self-hosts its files, so no external font origin is required.
  "font-src 'self' data:",
  `img-src 'self' data: blob: ${supabaseOrigin} https://www.googletagmanager.com https://www.google-analytics.com`,
  `connect-src 'self' ${supabaseOrigin} wss://${supabaseHostname} https://www.google-analytics.com https://region1.google-analytics.com`,
  "manifest-src 'self'",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

/** Applied to every route. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Two years, preload-eligible. Only safe because ean.aero is HTTPS-only.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Stops a browser from MIME-sniffing an uploaded file into something
  // executable — relevant given /api/admin/upload accepts images.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  // Sends the origin but not the path to third parties, so admin URLs and blog
  // draft slugs never leak in a Referer.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This site needs none of these; denying them shrinks the attack surface and
  // silences the permission prompts an injected script could otherwise trigger.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Keeps this origin out of a shared browsing-context group.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    // Optimised variants are immutable for a given (url, w, q) triple, so there
    // is no reason to re-transform them every day.
    minimumCacheTTL: ONE_YEAR,
    // Next 16 rejects any `quality` not listed here with a 400, so this must
    // cover every value the app can request: 70 for full-bleed hero art, 80 for
    // content imagery, and 75 for any <Image> that omits the prop entirely
    // (Navbar logo, Footer, PartnersStrip) and so falls back to the default.
    qualities: [70, 75, 80],
    // No source image is wider than ~1920px, so a 3840 candidate only inflates
    // every srcset string in the HTML without ever being served.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    // Blog covers uploaded via /api/admin/upload are served from Supabase
    // Storage. Without this, <Image src={cover_image_url}> throws "hostname is
    // not configured" and takes the whole post page down at request time — so
    // every DB-authored post with an uploaded cover was a broken page.
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  async headers() {
    return [
      {
        // Security headers belong on every response, including API routes and
        // the admin portal.
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Files under public/ are otherwise served `max-age=0, must-revalidate`,
        // which Lighthouse flags as an inefficient cache policy. These are
        // content assets that change by filename, not in place.
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` },
        ],
      },
      {
        // Never let an intermediary or browser cache a lead/admin JSON payload.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
