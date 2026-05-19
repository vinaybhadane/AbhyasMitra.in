'use client';

import { useState, useEffect } from 'react';
import { AlignLeft } from 'lucide-react';

interface TocProps {
  toc: { id: string; text: string; level: number }[];
  isMobile: boolean;
}

export default function Toc({ toc, isMobile }: TocProps) {
  const [activeHeading, setActiveHeading] = useState('');
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHeading(entry.target.id);
        });
      },
      { rootMargin: '-20% 0% -60% 0%' }
    );
    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  if (isMobile) {
    return (
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium"
        >
          <span className="flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Table of Contents</span>
          <span>{tocOpen ? '▲' : '▼'}</span>
        </button>
        {tocOpen && (
          <nav className="mt-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setTocOpen(false)}
                className={`toc-link ${item.level === 2 ? '' : 'pl-4'} ${activeHeading === item.id ? 'active' : ''}`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        )}
      </div>
    );
  }

  return (
    <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        <AlignLeft className="w-4 h-4" /> Table of Contents
      </h3>
      <nav className="space-y-0.5">
        {toc.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`toc-link ${item.level > 2 ? 'pl-4' : ''} ${activeHeading === item.id ? 'active' : ''}`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
