'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Thin top-of-page progress bar shown during Next.js route transitions.
 * Intercepts <a> clicks to start, listens to pathname changes to finish.
 */
export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevUrl = useRef('');

  const startLoading = useCallback(() => {
    setLoading(true);
    setProgress(0);

    // Animate progress: fast to 30%, then slow crawl to ~90%
    let p = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      p += p < 30 ? 8 : p < 60 ? 3 : p < 85 ? 0.8 : 0;
      if (p >= 90) p = 90;
      setProgress(p);
    }, 80);
  }, []);

  const stopLoading = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 300);
  }, []);

  // Detect route change completion
  useEffect(() => {
    const currentUrl = pathname + searchParams.toString();
    if (prevUrl.current && prevUrl.current !== currentUrl) {
      stopLoading();
    }
    prevUrl.current = currentUrl;
  }, [pathname, searchParams, stopLoading]);

  // Intercept internal link clicks to start the loader
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external links, hash links, new-tab links, download links
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('#') ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        e.ctrlKey || e.metaKey || e.shiftKey
      ) {
        return;
      }

      // Skip if navigating to the same page
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      startLoading();
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [startLoading]);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      style={{ height: '3px' }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)',
          borderRadius: '0 2px 2px 0',
          transition: progress === 100 ? 'width 200ms ease, opacity 300ms ease' : 'width 200ms ease',
          opacity: progress === 100 ? 0 : 1,
          boxShadow: '0 0 8px rgba(37, 99, 235, 0.4)',
        }}
      />
    </div>
  );
}
