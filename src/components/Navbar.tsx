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
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const firstYearSubjects = SUBJECTS.filter((s) => s.year === '1st');
  const secondYearSubjects = SUBJECTS.filter((s) => s.year === '2nd');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'shadow-md' : ''}`}
        style={{
          backgroundColor: 'var(--am-header-bg)',
          borderBottom: `1px solid var(--am-header-border)`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-14 lg:h-[56px]" style={{ minHeight: '52px' }}>
            <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="AbhyasMitra Home">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold" style={{ color: '#2563eb' }}>AbhyasMitra</span>
            </Link>

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

            <div className="flex items-center gap-1.5">
              <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="icon-btn md:hidden" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>

              <div className="hidden lg:flex items-center gap-0.5">
                <Link href="/" className="nav-link px-2 text-xs">Home</Link>
                <Link href="/subjects/first-year" className="nav-link px-2 text-xs">1st Year</Link>
                <Link href="/browse/computer" className="nav-link px-2 text-xs">Computer</Link>
                <Link href="/browse/it" className="nav-link px-2 text-xs">IT</Link>
                <Link href="/browse/ai-ds" className="nav-link px-2 text-xs">AI & DS</Link>
                <Link href="/browse/mechanical" className="nav-link px-2 text-xs">Mechanical</Link>
                <Link href="/browse/electrical" className="nav-link px-2 text-xs">Electrical</Link>
                <Link href="/browse/civil" className="nav-link px-2 text-xs">Civil</Link>
                <Link href="/browse/entc" className="nav-link px-2 text-xs">E&TC</Link>
                <Link href="/about" className="nav-link px-2 text-xs">About</Link>
              </div>

              <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="icon-btn" aria-label="Toggle theme">
                {mounted ? (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="relative group hidden lg:block">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors" style={{ border: '1px solid var(--am-border-card)' }}>
                    {user.photoURL ? <Image src={user.photoURL} alt="Profile" width={24} height={24} className="rounded-full" /> : <User className="w-5 h-5" />}
                    <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate" style={{ color: 'var(--am-text-primary)' }}>{user.displayName}</span>
                  </button>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="rounded-xl shadow-xl py-2 min-w-[160px]" style={{ background: 'var(--am-bg-card)', border: '1px solid var(--am-border-card)' }}>
                      {isAdminUser && <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"><Shield className="w-4 h-4 text-indigo-500" /> Admin Panel</Link>}
                      <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"><LogOut className="w-4 h-4" /> Sign out</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={signInWithGoogle} className="hidden lg:flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-xl transition-colors shadow-md" style={{ background: '#2563eb' }}>Sign In</button>
              )}

              <button onClick={() => setDrawerOpen(true)} className="icon-btn lg:hidden" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {mobileSearchOpen && (
            <div className="md:hidden pb-3">
              <form onSubmit={handleSearch} className="header-search">
                <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--am-text-secondary)' }} />
                <input ref={mobileSearchRef} type="search" placeholder="Search notes, subjects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <button type="button" onClick={() => setMobileSearchOpen(false)} className="p-0.5"><X className="w-4 h-4" style={{ color: 'var(--am-text-secondary)' }} /></button>
              </form>
            </div>
          )}
        </nav>
      </header>

      {drawerOpen && (
        <>
          <div className="drawer-overlay lg:hidden" onClick={closeDrawer} aria-hidden="true" />
          <div className="drawer lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--am-border-card)' }}>
              <Link href="/" className="flex items-center gap-2" onClick={closeDrawer}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold" style={{ color: '#2563eb' }}>AbhyasMitra</span>
              </Link>
              <button onClick={closeDrawer} className="icon-btn" aria-label="Close menu"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              <Link href="/" className="mobile-nav-link" onClick={closeDrawer}>🏠 Home</Link>
              <Link href="/subjects/first-year" className="mobile-nav-link" onClick={closeDrawer}>📚 1st Year Subjects</Link>
              <div>
                <button className="mobile-nav-link w-full flex items-center justify-between" onClick={() => setSubjectsOpen(!subjectsOpen)}>
                  <span>🗂️ All Subjects</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${subjectsOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--am-text-secondary)' }} />
                </button>
                {subjectsOpen && (
                  <div className="mt-2 space-y-4 pb-2 pl-2">
                    <div>
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg mb-1" style={{ color: '#2563eb', background: 'var(--am-badge-bg)' }}>1st Year Engineering</p>
                      {firstYearSubjects.map((s) => (
                        <Link key={s.id} href={`/subject/${s.slug}`} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20" style={{ color: 'var(--am-text-primary)' }} onClick={closeDrawer}>
                          <span style={{ color: s.iconColor }}>{s.icon}</span><span>{s.name}</span>
                        </Link>
                      ))}
                    </div>
                    <div>
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg mb-1" style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.08)' }}>2nd Year (Computer)</p>
                      {secondYearSubjects.map((s) => (
                        <Link key={s.id} href={`/subject/${s.slug}`} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20" style={{ color: 'var(--am-text-primary)' }} onClick={closeDrawer}>
                          <span style={{ color: s.iconColor }}>{s.icon}</span><span>{s.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link href="/about" className="mobile-nav-link" onClick={closeDrawer}>ℹ️ About</Link>
              <Link href="/contact" className="mobile-nav-link" onClick={closeDrawer}>✉️ Contact</Link>
              <Link href="/search" className="mobile-nav-link" onClick={closeDrawer}>🔍 Search Notes</Link>
            </div>

            <div className="shrink-0 px-4 py-4" style={{ borderTop: '1px solid var(--am-border-card)' }}>
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-3 px-1">
                    {user.photoURL ? <Image src={user.photoURL} alt="Profile" width={36} height={36} className="rounded-full" /> : <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold" style={{ background: 'var(--am-badge-bg)', color: '#2563eb' }}>{user.displayName?.charAt(0) || <User className="w-5 h-5" />}</div>}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--am-text-primary)' }}>{user.displayName}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--am-text-secondary)' }}>{user.email}</p>
                    </div>
                  </div>
                  {isAdminUser && <Link href="/admin" className="mobile-nav-link flex items-center gap-2 mb-1" onClick={closeDrawer}><Shield className="w-4 h-4 text-indigo-500" /> Admin Panel</Link>}
                  <button onClick={() => { logout(); closeDrawer(); }} className="w-full text-left mobile-nav-link text-red-600 flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign out</button>
                </>
              ) : (
                <button onClick={() => { signInWithGoogle(); closeDrawer(); }} className="w-full text-center px-4 py-2.5 text-white rounded-xl font-medium shadow-md" style={{ background: '#2563eb' }}>Sign in with Google</button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}