import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--am-footer-bg)', borderTop: '1px solid var(--am-border-card)' }}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center text-center">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--am-text-primary)' }}>AbhyasMitra</span>
        </Link>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--am-footer-text)' }}>
          Free study material for SPPU Engineering students.
        </p>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8">
          {[
            { href: '/', label: 'Home' },
            { href: '/about', label: 'About Us' },
            { href: '/privacy-policy', label: 'Privacy Policy' },
            { href: '/terms-and-conditions', label: 'Terms & Conditions' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm transition-colors hover:underline font-medium"
              style={{ color: 'var(--am-footer-text)' }}
            >
              {label}
            </Link>
          ))}
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
