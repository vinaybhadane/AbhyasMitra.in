import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AbhyasMitra – Free SPPU 2024 Pattern Notes & Study Material',
  description:
    'AbhyasMitra provides free notes, solutions, and study material for SPPU 2024 Pattern Engineering students. Covers 1st Year and 2nd Year Computer Engineering subjects.',
  keywords:
    'SPPU 2024 pattern notes, engineering notes, SPPU study material, engineering mathematics 2, DBMS notes, IoT notes, first year engineering notes',
  authors: [{ name: 'AbhyasMitra Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://abhyasmitra.in'),
  icons: {
    icon: '/logo12.png',
    apple: '/logo12.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'AbhyasMitra',
    title: 'AbhyasMitra – Free SPPU 2024 Pattern Notes',
    description: 'Free notes and study material for SPPU 2024 Pattern Engineering students.',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AbhyasMitra',
    description: 'Free SPPU 2024 Pattern Engineering Notes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || '',
  },
};

import Script from 'next/script';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AbhyasMitra',
  url: 'https://abhyasmitra.in',
  logo: 'https://abhyasmitra.in/logo12.png',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'vinaybhadane06@gmail.com',
    contactType: 'customer support',
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo12.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Organization schema.org markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
        {/* AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            id="google-adsense"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="abhyasmitra-theme">
          <AuthProvider>
            <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white' }} />
            <Navbar />
            <main className="min-h-screen pt-16">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
