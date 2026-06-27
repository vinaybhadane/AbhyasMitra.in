'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Search, Menu, X, Sun, Moon, ChevronDown, BookOpen, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SUBJECTS } from '@/lib/types';

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isAdminUser, signInWithGoogle, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [mobileSearchOpen]);

  const firstYearSubjects = SUBJECTS.filter((s) => s.year === '1st');
  const secondYearSubjects = SUBJECTS.filter((s) => s.year === '2nd');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'shadow-md'
          : ''
      }`}
      style={{
        backgroundColor: 'var(--am-header-bg)',
        borderBottom: `1px solid var(--am-header-border)`,
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-14 lg:h-[56px]" style={{ minHeight: '52px' }}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="AbhyasMitra Home">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ color: '#2563eb' }}>
              AbhyasMitra
            </span>
          </Link>

          {/* Center: Inline Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center px-8 max-w-xl">
            <form onSubmit={handleSearch} className="header-search">
              <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--am-text-secondary)' }} />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search notes, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="icon-btn md:hidden"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-0.5">
              <Link href="/" className="nav-link">Home</Link>

              {/* Subjects Dropdown */}
              <div className="relative group">
                <button
                  className="nav-link flex items-center gap-1"
                  aria-expanded={subjectsOpen}
                  onClick={() => setSubjectsOpen(!subjectsOpen)}
                >
                  Subjects <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="w-[540px] rounded-xl shadow-2xl p-5" style={{ background: 'var(--am-bg-card)', border: '1px solid var(--am-border-card)' }}>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--am-text-secondary)' }}>1st Year</p>
                        <ul className="space-y-0.5">
                          {firstYearSubjects.map((s) => (
                            <li key={s.id}>
                              <Link
                                href={`/subject/${s.slug}`}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                style={{ color: 'var(--am-text-primary)' }}
                              >
                                <span style={{ color: s.iconColor }}>{s.icon}</span>
                                <span>{s.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--am-text-secondary)' }}>2nd Year (CSE)</p>
                        <ul className="space-y-0.5">
                          {secondYearSubjects.map((s) => (
                            <li key={s.id}>
                              <Link
                                href={`/subject/${s.slug}`}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                style={{ color: 'var(--am-text-primary)' }}
                              >
                                <span style={{ color: s.iconColor }}>{s.icon}</span>
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
            </div>

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
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors" style={{ border: '1px solid var(--am-border-card)' }}>
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt="Profile" width={24} height={24} className="rounded-full" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate" style={{ color: 'var(--am-text-primary)' }}>{user.displayName}</span>
                </button>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="rounded-xl shadow-xl py-2 min-w-[160px]" style={{ background: 'var(--am-bg-card)', border: '1px solid var(--am-border-card)' }}>
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
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-xl transition-colors shadow-md"
                style={{ background: '#2563eb' }}
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="icon-btn lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (expandable) */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="header-search">
              <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--am-text-secondary)' }} />
              <input
                ref={mobileSearchRef}
                type="search"
                placeholder="Search notes, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" onClick={() => setMobileSearchOpen(false)} className="p-0.5">
                <X className="w-4 h-4" style={{ color: 'var(--am-text-secondary)' }} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-full shadow-xl overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)', background: 'var(--am-header-bg)', borderBottom: '1px solid var(--am-header-border)' }}>
            <div className="px-4 py-4 space-y-1">
              <Link href="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
              <div>
                <button
                  className="mobile-nav-link w-full flex items-center justify-between group"
                  onClick={() => setSubjectsOpen(!subjectsOpen)}
                >
                  <span className="flex items-center gap-2">Subjects</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${subjectsOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--am-text-secondary)' }} />
                </button>
                {subjectsOpen && (
                  <div className="mt-2 space-y-6 pb-4">
                    {/* 1st Year Section */}
                    <div>
                      <h4 className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 rounded-lg" style={{ color: '#2563eb', background: 'var(--am-badge-bg)' }}>
                        1st Year Engineering
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">
                        {firstYearSubjects.map((s) => (
                          <Link 
                            key={s.id} 
                            href={`/subject/${s.slug}`} 
                            className="flex items-center gap-3 p-3 rounded-xl group transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20" 
                            style={{ background: 'var(--am-search-bg)' }}
                            onClick={() => setMenuOpen(false)}
                          >
                            <span className="w-8 h-8 flex items-center justify-center rounded-lg shadow-sm" style={{ color: s.iconColor, background: 'var(--am-bg-card)' }}>{s.icon}</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--am-text-primary)' }}>{s.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* 2nd Year Section */}
                    <div>
                      <h4 className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 rounded-lg" style={{ color: '#7c3aed', background: 'rgba(124, 58, 237, 0.08)' }}>
                        2nd Year (Computer)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">
                        {secondYearSubjects.map((s) => (
                          <Link 
                            key={s.id} 
                            href={`/subject/${s.slug}`} 
                            className="flex items-center gap-3 p-3 rounded-xl group transition-all hover:bg-purple-50 dark:hover:bg-purple-900/20" 
                            style={{ background: 'var(--am-search-bg)' }}
                            onClick={() => setMenuOpen(false)}
                          >
                            <span className="w-8 h-8 flex items-center justify-center rounded-lg shadow-sm" style={{ color: s.iconColor, background: 'var(--am-bg-card)' }}>{s.icon}</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--am-text-primary)' }}>{s.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>About</Link>
              <Link href="/contact" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
              
              <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--am-border-card)' }}>
                {user ? (
                  <>
                    <div className="px-4 py-3 mb-2 flex items-center gap-3">
                      {user.photoURL ? (
                        <Image src={user.photoURL} alt="Profile" width={36} height={36} className="rounded-full" />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold" style={{ background: 'var(--am-badge-bg)', color: '#2563eb' }}>
                          {user.displayName?.charAt(0) || <User className="w-5 h-5" />}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--am-text-primary)' }}>{user.displayName}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--am-text-secondary)' }}>{user.email}</p>
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
                  <button onClick={() => { signInWithGoogle(); setMenuOpen(false); }} className="w-full text-center px-4 py-2.5 mt-2 text-white rounded-xl font-medium shadow-md" style={{ background: '#2563eb' }}>
                    Sign in with Google
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
