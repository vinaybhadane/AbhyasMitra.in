'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Monitor scroll for subtle shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        </div>
      </div>
    </header>
  );
}