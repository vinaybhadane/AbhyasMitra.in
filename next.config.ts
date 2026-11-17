import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ─── Image Optimization ────────────────────────────────────────────────────
  images: {
    unoptimized: true,
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
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: '*.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: 'abhyasmitra.in',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
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
          { key: 'Content-Security-Policy', value: [
            "default-src 'self'",
            // ISR uses inline Next hydration and next-themes. Nonces require dynamic rendering.
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://www.gstatic.com https://apis.google.com https://www.google.com https://www.recaptcha.net" + (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''),
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.google-analytics.com https://*.blob.core.windows.net https://pagead2.googlesyndication.com https://www.google.com https://www.recaptcha.net https://googleads.g.doubleclick.net https://tpc.googlesyndication.com" + (process.env.NODE_ENV === 'development' ? ' ws://localhost:3000' : ''),
            "frame-src https://www.google.com https://www.recaptcha.net https://" + process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN + " https://accounts.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
            "worker-src 'self' blob:", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'self'",
            ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
          ].join('; ') },
          ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
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
