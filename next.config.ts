import type { NextConfig } from "next";

const ONE_YEAR = 60 * 60 * 24 * 365;

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
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  async headers() {
    return [
      {
        // Files under public/ are otherwise served `max-age=0, must-revalidate`,
        // which Lighthouse flags as an inefficient cache policy. These are
        // content assets that change by filename, not in place.
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` },
        ],
      },
    ];
  },
};

export default nextConfig;
