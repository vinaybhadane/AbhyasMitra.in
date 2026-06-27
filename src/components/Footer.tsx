import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { SUBJECTS } from '@/lib/types';

export default function Footer() {
  // Show top subjects (mix of 1st and 2nd year)
  const topSubjects = SUBJECTS.slice(0, 6);

  return (
    <footer style={{ background: 'var(--am-footer-bg)', borderTop: '1px solid var(--am-border-card)' }}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold" style={{ color: 'var(--am-text-primary)' }}>AbhyasMitra</span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--am-footer-text)' }}>
              Free study material for SPPU Engineering students.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--am-text-primary)' }}>Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/search', label: 'Search Notes' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/privacy-policy', label: 'Privacy Policy' },
                { href: '/terms-and-conditions', label: 'Terms & Conditions' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:underline" style={{ color: 'var(--am-footer-text)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Supported Subjects */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--am-text-primary)' }}>Supported Subjects</h3>
            <ul className="space-y-2">
              {topSubjects.map((s) => (
                <li key={s.id}>
                  <Link href={`/subject/${s.slug}`} className="text-sm transition-colors hover:underline flex items-center gap-1.5" style={{ color: 'var(--am-footer-text)' }}>
                    <span style={{ color: s.iconColor }}>{s.icon}</span> {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid var(--am-border-card)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center">
          <p className="text-xs" style={{ color: 'var(--am-text-secondary)' }}>
            © {new Date().getFullYear()} AbhyasMitra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
