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
  { label: 'Study Material', href: '/search' },
  { label: 'Community', href: 'https://whatsapp.com/channel/0029VbD3UKE8aKvOTKJcwK1K', external: true },
  { label: 'Contact Us', href: '/contact' }
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdminUser, signInWithGoogle, logout } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for subtle shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
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
    setIsOpen(false);
  };

  // Prevent body scrolling while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    drawer.addEventListener('keydown', handleTab);
    return () => {
      drawer.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  // Helper to determine if an item is active
  const isItemActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.external) return false;

    if (item.href === '/') {
      return pathname === '/' && activeHash !== '#branches';
    }
    if (item.href === '/#branches') {
      return pathname === '/' && activeHash === '#branches';
    }
    if (item.href === '/search') {
      return (
        pathname === '/search' ||
        pathname.startsWith('/subject') ||
        pathname.startsWith('/browse') ||
        pathname.startsWith('/subjects')
      );
    }
    if (item.href === '/contact') {
      return pathname === '/contact';
    }
    return pathname === item.href;
  };

  // Render outline SVG icons for the mobile drawer
  const renderDrawerIcon = (label: string) => {
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
      case 'Study Material':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        );
      case 'Community':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
        {/* Mobile controls (hamburger + logo next to it) */}
        <div className="premium-mobile-controls">
          <button
            ref={triggerRef}
            type="button"
            className="premium-hamburger-btn"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation-drawer"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {/* Top line */}
              <line
                x1="4"
                y1="6"
                x2="20"
                y2="6"
                style={{
                  transform: isOpen ? 'translateY(6px) rotate(45deg)' : '',
                  transformOrigin: '12px 12px',
                  transition: 'transform 220ms ease-out'
                }}
              />
              {/* Middle line */}
              <line
                x1="4"
                y1="12"
                x2="20"
                y2="12"
                style={{
                  opacity: isOpen ? 0 : 1,
                  transition: 'opacity 220ms ease-out'
                }}
              />
              {/* Bottom line */}
              <line
                x1="4"
                y1="18"
                x2="20"
                y2="18"
                style={{
                  transform: isOpen ? 'translateY(-6px) rotate(-45deg)' : '',
                  transformOrigin: '12px 12px',
                  transition: 'transform 220ms ease-out'
                }}
              />
            </svg>
          </button>
          
          {/* Logo next to Hamburger on mobile */}
          <Link href="/" className="flex items-center" aria-label="AbhyasMitra Logo" onClick={() => handleNavClick({ label: 'Home', href: '/' })}>
            <Image
              src="/AbhyasMitraLogo.png"
              alt="AbhyasMitra"
              width={200}
              height={44}
              priority
              className="h-[34px] sm:h-[38px] md:h-[40px] w-auto object-contain"
            />
          </Link>
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
          {NAV_ITEMS.map((item) => {
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

      {/* Mobile Drawer Backdrop Overlay */}
      <div
        className={`premium-drawer-overlay ${isOpen ? 'premium-drawer-overlay--open' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer Panel */}
      <div
        ref={drawerRef}
        id="mobile-navigation-drawer"
        className={`premium-drawer ${isOpen ? 'premium-drawer--open' : ''}`}
        aria-label="Mobile Navigation"
        aria-hidden={!isOpen}
      >
        <div className="premium-drawer-header">
          <Link href="/" aria-label="AbhyasMitra Logo" onClick={() => handleNavClick({ label: 'Home', href: '/' })}>
            <Image
              src="/AbhyasMitraLogo.png"
              alt="AbhyasMitra"
              width={160}
              height={36}
              priority
              className="h-[34px] sm:h-[36px] w-auto object-contain"
            />
          </Link>
          
          <button
            type="button"
            className="premium-drawer-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="premium-drawer-nav" role="menu">
          {NAV_ITEMS.map((item) => {
            const isActive = isItemActive(item);
            if (item.external) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-drawer-item"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                >
                  {renderDrawerIcon(item.label)}
                  <span>{item.label}</span>
                </a>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`premium-drawer-item ${isActive ? 'premium-drawer-item--active' : ''}`}
                onClick={() => handleNavClick(item)}
                role="menuitem"
              >
                {renderDrawerIcon(item.label)}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />

          {/* User Auth Section inside Mobile Drawer */}
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/40 rounded-xl mb-2">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full shrink-0 border border-gray-150"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 font-bold shrink-0 border border-sky-100 text-xs">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{user.displayName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              {isAdminUser && (
                <Link
                  href="/admin"
                  className="premium-drawer-item !h-12 !px-3"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
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
                  setIsOpen(false);
                  logout();
                }}
                className="premium-drawer-item !h-12 !px-3 text-red-500 hover:!bg-red-50 hover:!text-red-600"
                role="menuitem"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="px-1 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  signInWithGoogle();
                }}
                className="w-full h-12 flex items-center justify-center gap-2 font-bold text-sm bg-gray-950 hover:bg-sky-600 text-white rounded-xl transition-all duration-300 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}