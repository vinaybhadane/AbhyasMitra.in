import Link from 'next/link';
import { BookOpen, Search, ArrowLeft, Calculator, Database, Telescope, Radio } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Illustration */}
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/25">
          <BookOpen className="w-12 h-12 text-white" />
        </div>

        <div className="text-8xl font-black text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text mb-4">
          404
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Looks like this page doesn&apos;t exist. The note you&apos;re looking for might have been moved or doesn&apos;t exist yet.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
          >
            <Search className="w-4 h-4" /> Search Notes
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-400 mb-4">Popular subjects:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/subject/engineering-mathematics-2', icon: <Calculator className="w-6 h-6 text-indigo-500" />, label: 'Math 2' },
              { href: '/subject/database-management-system', icon: <Database className="w-6 h-6 text-indigo-500" />, label: 'DBMS' },
              { href: '/subject/engineering-physics', icon: <Telescope className="w-6 h-6 text-indigo-500" />, label: 'Physics' },
              { href: '/subject/internet-of-things', icon: <Radio className="w-6 h-6 text-indigo-500" />, label: 'IoT' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                {link.icon}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
