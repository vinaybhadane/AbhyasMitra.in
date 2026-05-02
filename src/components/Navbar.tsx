'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Search, Menu, X, Sun, Moon, ChevronDown, BookOpen, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SUBJECTS } from '@/lib/types';

export default function Navbar() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, isAdminUser, signInWithGoogle, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const firstYearSubjects = SUBJECTS.filter((s) => s.year === '1st');
  const secondYearSubjects = SUBJECTS.filter((s) => s.year === '2nd');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50'
          : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="AbhyasMitra Home">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-shadow shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AbhyasMitra
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/" className="nav-link">Home</Link>

            {/* Subjects Dropdown */}
            <div className="relative group">
              <button
                className="nav-link flex items-center gap-1"
                aria-expanded={subjectsOpen}
                onClick={() => setSubjectsOpen(!subjectsOpen)}
              >
                Subjects <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="w-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">1st Year</p>
                      <ul className="space-y-1">
                        {firstYearSubjects.map((s) => (
                          <li key={s.id}>
                            <Link
                              href={`/subject/${s.slug}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              <span>{s.icon}</span>
                              <span>{s.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">2nd Year (CSE)</p>
                      <ul className="space-y-1">
                        {secondYearSubjects.map((s) => (
                          <li key={s.id}>
                            <Link
                              href={`/subject/${s.slug}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              <span>{s.icon}</span>
                              <span>{s.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/about" className="nav-link">About</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="icon-btn"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="icon-btn"
              aria-label="Toggle theme"
            >
              {mounted ? (
                resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5" />
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative group hidden lg:block">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt="Profile" width={24} height={24} className="rounded-full" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">{user.displayName}</span>
                </button>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[160px]">
                    {isAdminUser && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Shield className="w-4 h-4 text-indigo-500" /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md shadow-indigo-600/25"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="icon-btn lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            <div className="px-4 py-4 space-y-1">
              <Link href="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
              <div>
                <button
                  className="mobile-nav-link w-full flex justify-between items-center"
                  onClick={() => setSubjectsOpen(!subjectsOpen)}
                >
                  Subjects <ChevronDown className={`w-4 h-4 transition-transform ${subjectsOpen ? 'rotate-180' : ''}`} />
                </button>
                {subjectsOpen && (
                  <div className="mt-2 space-y-6 pb-4">
                    {/* 1st Year Section */}
                    <div>
                      <h4 className="px-4 py-2 text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg">
                        1st Year Engineering
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">
                        {firstYearSubjects.map((s) => (
                          <Link 
                            key={s.id} 
                            href={`/subject/${s.slug}`} 
                            className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group transition-all" 
                            onClick={() => setMenuOpen(false)}
                          >
                            <span className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">{s.icon}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{s.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* 2nd Year Section */}
                    <div>
                      <h4 className="px-4 py-2 text-[10px] font-bold text-purple-500 uppercase tracking-[0.2em] mb-2 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                        2nd Year (Computer)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">
                        {secondYearSubjects.map((s) => (
                          <Link 
                            key={s.id} 
                            href={`/subject/${s.slug}`} 
                            className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 group transition-all" 
                            onClick={() => setMenuOpen(false)}
                          >
                            <span className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">{s.icon}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{s.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>About</Link>
              <Link href="/contact" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
              
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <>
                    <div className="px-4 py-3 mb-2 flex items-center gap-3">
                      {user.photoURL ? (
                        <Image src={user.photoURL} alt="Profile" width={36} height={36} className="rounded-full" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold">
                          {user.displayName?.charAt(0) || <User className="w-5 h-5" />}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    {isAdminUser && (
                      <Link href="/admin" className="mobile-nav-link flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                        <Shield className="w-4 h-4 text-indigo-500" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left mobile-nav-link text-red-600 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <button onClick={() => { signInWithGoogle(); setMenuOpen(false); }} className="w-full text-center px-4 py-2.5 mt-2 bg-indigo-600 text-white rounded-xl font-medium shadow-md">
                    Sign in with Google
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                  setSearchOpen(false);
                }
              }}
              className="flex items-center gap-3"
            >
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="search"
                placeholder="Search notes, subjects, topics..."
                className="flex-1 bg-transparent text-lg outline-none text-gray-900 dark:text-white placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="icon-btn">
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
