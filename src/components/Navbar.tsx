'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Search, X, Sun, Moon, BookOpen, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isAdminUser, signInWithGoogle, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
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
        {/* Top Row: Logo, Search Box, Actions */}
        <div className="flex items-center justify-between h-14 lg:h-[56px]" style={{ minHeight: '52px' }}>
          <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="AbhyasMitra Home">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ color: '#2563eb' }}>AbhyasMitra</span>
          </Link>

          {/* Search (Desktop) */}
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
            {/* Mobile Search Trigger */}
            <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="icon-btn md:hidden" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="icon-btn" aria-label="Toggle theme">
              {mounted ? (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </button>

            {/* User Auth Info */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors" style={{ border: '1px solid var(--am-border-card)' }}>
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
              <button onClick={signInWithGoogle} className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-xl transition-colors shadow-md" style={{ background: '#2563eb' }}>Sign In</button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="header-search">
              <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--am-text-secondary)' }} />
              <input ref={mobileSearchRef} type="search" placeholder="Search notes, subjects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button type="button" onClick={() => setMobileSearchOpen(false)} className="p-0.5"><X className="w-4 h-4" style={{ color: 'var(--am-text-secondary)' }} /></button>
            </form>
          </div>
        )}

        {/* Bottom Row: Flat Categories Link Bar (horizontally scrollable on mobile) */}
        <div 
          className="flex items-center overflow-x-auto whitespace-nowrap gap-1 py-2 border-t border-gray-100 dark:border-gray-800 scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <Link href="/" className="nav-link px-3 py-1 text-xs rounded-full shrink-0">Home</Link>
          <Link href="/subjects/first-year" className="nav-link px-3 py-1 text-xs rounded-full shrink-0">1st Year</Link>
          <Link href="/browse/computer" className="nav-link px-3 py-1 text-xs rounded-full shrink-0">Computer</Link>
          <Link href="/browse/it" className="nav-link px-3 py-1 text-xs rounded-full shrink-0">IT</Link>
          <Link href="/browse/ai-ds" className="nav-link px-3 py-1 text-xs rounded-full shrink-0">AI & DS</Link>
          <Link href="/browse/mechanical" className="nav-link px-3 py-1 text-xs rounded-full shrink-0">Mechanical</Link>
          <Link href="/browse/electrical" className="nav-link px-3 py-1 text-xs rounded-full shrink-0">Electrical</Link>
          <Link href="/browse/civil" className="nav-link px-3 py-1 text-xs rounded-full shrink-0">Civil</Link>
          <Link href="/browse/entc" className="nav-link px-3 py-1 text-xs rounded-full shrink-0">E&TC</Link>
          <Link href="/about" className="nav-link px-3 py-1 text-xs rounded-full shrink-0">About</Link>
        </div>
      </nav>
    </header>
  );
}