import Link from 'next/link';
import { BookOpen, Mail, ExternalLink, CheckCircle2, Heart } from 'lucide-react';
import { SUBJECTS } from '@/lib/types';

export default function Footer() {
  const firstYear = SUBJECTS.filter((s) => s.year === '1st');
  const secondYear = SUBJECTS.filter((s) => s.year === '2nd');

  return (
    <footer className="bg-gray-950 dark:bg-gray-950 text-gray-300 mt-20">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AbhyasMitra</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Your trusted study companion for SPPU 2024 Pattern. Free notes, solutions, and study material for engineering students.
            </p>
            <div className="flex gap-3">
              {[
                { 
                  icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 3.827H5.078z"/></svg>, 
                  href: 'https://twitter.com/', 
                  label: 'Twitter/X' 
                },
                { 
                  icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>, 
                  href: 'https://github.com/', 
                  label: 'GitHub' 
                },
                { 
                  icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, 
                  href: 'https://linkedin.com/', 
                  label: 'LinkedIn' 
                },
                { icon: <Mail className="w-4 h-4" />, href: 'mailto:vinaybhadane06@gmail.com', label: 'Email' },
              ].map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-indigo-600 flex items-center justify-center transition-colors text-sm font-bold text-white"
                  aria-label={label}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* 1st Year Subjects */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">1st Year Subjects</h3>
            <ul className="space-y-2">
              {firstYear.map((s) => (
                <li key={s.id}>
                  <Link href={`/subject/${s.slug}`} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    <span>{s.icon}</span> {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 2nd Year Subjects */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">2nd Year (CSE)</h3>
            <ul className="space-y-2">
              {secondYear.map((s) => (
                <li key={s.id}>
                  <Link href={`/subject/${s.slug}`} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    <span>{s.icon}</span> {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/faq', label: 'FAQ' },
                { href: '/search', label: 'Search Notes' },
                { href: '/privacy-policy', label: 'Privacy Policy' },
                { href: '/cookie-policy', label: 'Cookie Policy' },
                { href: '/terms-and-conditions', label: 'Terms & Conditions' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <p className="text-xs text-gray-400 mb-2">For SPPU 2024 Pattern Students</p>
              <p className="text-xs text-indigo-400 font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> 1st & 2nd Year Engineering</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AbhyasMitra. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Made with <Heart className="w-4 h-4 inline text-red-500 mx-1 fill-current" /> for SPPU Engineering Students
          </p>
        </div>
      </div>
    </footer>
  );
}
