'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Navigation items definition
const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Branches', href: '/#branches' },
  { label: 'Syllabus', href: '/syllabus' },
  { label: 'Community', href: 'https://whatsapp.com/channel/0029VbD3UKE8aKvOTKJcwK1K', external: true },
  { label: 'Contact Us', href: '/contact' }
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdminUser, signInWithGoogle, logout } = useAuth();
  
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  
  // Separate dropdown states for desktop and mobile headers
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for subtle shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Monitor hash changes to keep navigation states active
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveHash(window.location.hash);
    }, 0);
    
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname]);

  // Support clicking Home to reset hash manually on same page
  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    if (item.href === '/') {
      setActiveHash('');
    } else if (item.href.startsWith('/#')) {
      setActiveHash(item.href.substring(1));
    }
  };

  // Helper to determine if an item is active
  const isItemActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.external) return false;

    if (item.href === '/') {
      return pathname === '/' && activeHash !== '#branches';
    }
    if (item.href === '/#branches') {
      return pathname === '/' && activeHash === '#branches';
    }
    if (item.href === '/syllabus') {
      return pathname === '/syllabus';
    }
    if (item.href === '/contact') {
      return pathname === '/contact';
    }
    return pathname === item.href;
  };

  // Render outline SVG icons for the bottom navigation bar tabs
  const renderTabIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case 'Branches':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            <path d="M21.5 12v6" />
          </svg>
        );
      case 'Syllabus':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        );
      case 'Contact Us':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <header className={`premium-navbar ${scrolled ? 'premium-navbar--scrolled' : ''}`}>
      <nav className="premium-nav-container" aria-label="Main Navigation">
        {/* Mobile controls (logo on left, community + login on right) */}
        <div className="premium-mobile-controls">
          <Link href="/" aria-label="AbhyasMitra Logo" onClick={() => handleNavClick({ label: 'Home', href: '/' })}>
            <Image
              src="/AbhyasMitraLogo.png"
              alt="AbhyasMitra"
              width={200}
              height={44}
              priority
              className="h-[34px] sm:h-[38px] w-auto object-contain"
            />
          </Link>

          {/* Top Bar actions: WhatsApp "Join Channel" pill + Profile Avatar */}
          <div className="mobile-header-actions">
            {/* WhatsApp Community Link (Join Channel pill) */}
            <a
              href="https://whatsapp.com/channel/0029VbD3UKE8aKvOTKJcwK1K"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/60 font-bold text-xs transition-colors hover:bg-emerald-100 shrink-0"
              aria-label="Join Channel"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span>Join Channel</span>
            </a>

            {/* User Profile dropdown */}
            {user ? (
              <div ref={mobileDropdownRef} className="premium-profile-container">
                <button
                  type="button"
                  className="mobile-header-avatar"
                  onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                  aria-haspopup="true"
                  aria-expanded={mobileDropdownOpen}
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={28}
                      height={28}
                      className="rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                </button>

                <div className={`premium-profile-dropdown ${mobileDropdownOpen ? 'premium-profile-dropdown--open' : ''}`}>
                  {isAdminUser && (
                    <Link
                      href="/admin"
                      className="premium-profile-item"
                      onClick={() => setMobileDropdownOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDropdownOpen(false);
                      logout();
                    }}
                    className="premium-profile-item premium-profile-item--danger"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="mobile-header-action"
                aria-label="Sign In"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Logo on Far Left */}
        <div className="premium-desktop-logo">
          <Link href="/" aria-label="AbhyasMitra Logo" onClick={() => handleNavClick({ label: 'Home', href: '/' })}>
            <Image
              src="/AbhyasMitraLogo.png"
              alt="AbhyasMitra"
              width={200}
              height={44}
              priority
              className="h-[44px] xl:h-[48px] w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Navigation on Right */}
        <div className="premium-nav-links" role="menubar">
          {NAV_ITEMS.filter(item => item.label !== 'Community').map((item) => {
            const isActive = isItemActive(item);
            if (item.external) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-nav-item"
                  role="menuitem"
                >
                  {item.label}
                </a>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`premium-nav-item ${isActive ? 'premium-nav-item--active' : ''}`}
                onClick={() => handleNavClick(item)}
                role="menuitem"
              >
                {item.label}
              </Link>
            );
          })}

          {/* WhatsApp CTA on Desktop */}
          <a
            href="https://whatsapp.com/channel/0029VbD3UKE8aKvOTKJcwK1K"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100/60 font-bold text-xs transition-colors shadow-sm ml-2 shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-emerald-600">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span>Community</span>
          </a>

          {/* User Auth Profile / Login Button on Desktop */}
          {user ? (
            <div ref={dropdownRef} className="premium-profile-container ml-2">
              <button
                type="button"
                className="premium-profile-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="rounded-full shrink-0"
                  />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0 text-gray-500">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
                <span className="max-w-[100px] truncate text-xs font-semibold">{user.displayName}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-gray-400 shrink-0">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div className={`premium-profile-dropdown ${dropdownOpen ? 'premium-profile-dropdown--open' : ''}`}>
                {isAdminUser && (
                  <Link
                    href="/admin"
                    className="premium-profile-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="premium-profile-item premium-profile-item--danger"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="premium-login-btn ml-2"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar (Frozen at Bottom on Mobile) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Bar">
        {[
          { label: 'Home', href: '/' },
          { label: 'Branches', href: '/#branches' },
          { label: 'Syllabus', href: '/syllabus' },
          { label: 'Contact Us', href: '/contact' }
        ].map((item) => {
          const isActive = isItemActive(item);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`mobile-tab-item ${isActive ? 'mobile-tab-item--active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              {renderTabIcon(item.label)}
              <span className="mobile-tab-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}