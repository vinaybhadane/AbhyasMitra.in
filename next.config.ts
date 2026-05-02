import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ─── Image Optimization ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ─── Performance ────────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  // ─── Security Headers ───────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ─── Redirects ───────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // SEO-friendly subject URL redirects
      {
        source: '/sppu-2024-pattern-notes',
        destination: '/',
        permanent: true,
      },
      {
        source: '/engineering-mathematics-2-notes',
        destination: '/subject/engineering-mathematics-2',
        permanent: true,
      },
    ];
  },

  // ─── Experimental ──────────────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
