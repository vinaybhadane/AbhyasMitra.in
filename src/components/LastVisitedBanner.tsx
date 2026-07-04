'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';

interface LastVisited {
  label: string;
  href: string;
}

export default function LastVisitedBanner() {
  const [last, setLast] = useState<LastVisited | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('am-last-visited');
      if (raw) setLast(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  if (!last) return null;

  return (
    <Link href={last.href} className="last-visited-banner group">
      <span
        className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0"
        style={{ background: 'var(--am-accent)', color: '#fff' }}
      >
        <BookOpen className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{ color: 'var(--am-text-secondary)' }}>
          Continue where you left off
        </p>
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--am-text-primary)' }}>
          {last.label}
        </p>
      </div>
      <ArrowRight
        className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1"
        style={{ color: 'var(--am-accent)' }}
      />
    </Link>
  );
}

/** Call this from any page to persist last-visited context */
export function saveLastVisited(label: string, href: string) {
  try {
    localStorage.setItem('am-last-visited', JSON.stringify({ label, href }));
  } catch {
    // ignore
  }
}
