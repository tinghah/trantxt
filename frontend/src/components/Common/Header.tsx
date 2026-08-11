import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage, LANGUAGE_OPTIONS } from '../../contexts/LanguageContext';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { displayLanguage, setDisplayLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/upload', label: 'Upload' },
    { path: '/history', label: 'History' },
    ...(user?.isAdmin ? [{ path: '/admin/dashboard', label: 'Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#16213e] border-b border-neutral-200 dark:border-[#2a2a4a] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-lg text-blue-600 dark:text-[#4a9eff] hidden sm:block">TranTxt</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-50 dark:bg-[#1a2744] text-blue-700 dark:text-[#4a9eff]'
                    : 'text-neutral-600 dark:text-[#b0b0b0] hover:text-neutral-900 dark:hover:text-[#e0e0e0] hover:bg-neutral-100 dark:hover:bg-[#2a2a4a]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-500 dark:text-[#4a9eff] hover:bg-neutral-100 dark:hover:bg-[#2a2a4a] transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-[#b0b0b0] hover:bg-neutral-100 dark:hover:bg-[#2a2a4a] transition-colors border border-neutral-200 dark:border-[#2a2a4a]"
                title="Switch display language"
              >
                {LANGUAGE_OPTIONS.find((o) => o.code === displayLanguage)?.nativeName || 'EN'}
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#16213e] rounded-lg shadow-lg border border-neutral-200 dark:border-[#2a2a4a] py-1 z-50">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => { setDisplayLanguage(opt.code); setLangMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        displayLanguage === opt.code
                          ? 'bg-blue-50 dark:bg-[#1a2744] text-blue-700 dark:text-[#4a9eff] font-semibold'
                          : 'text-neutral-700 dark:text-[#b0b0b0] hover:bg-neutral-100 dark:hover:bg-[#2a2a4a]'
                      }`}
                    >
                      <span>{opt.nativeName}</span>
                      <span className="text-xs text-neutral-400 ml-2">({opt.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#16213e] rounded-lg shadow-lg border border-neutral-200 dark:border-[#2a2a4a] py-1 z-50">
                  <div className="px-4 py-2 border-b border-neutral-200 dark:border-[#2a2a4a]">
                    <p className="text-sm font-medium text-neutral-900 dark:text-[#e0e0e0]">{user?.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-[#707070]">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-[#b0b0b0] hover:bg-neutral-100 dark:hover:bg-[#2a2a4a]">
                    Profile
                  </Link>
                  <Link to="/settings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-[#b0b0b0] hover:bg-neutral-100 dark:hover:bg-[#2a2a4a]">
                    Settings
                  </Link>
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-[#2a1a1a]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-500 dark:text-[#4a9eff] hover:bg-neutral-100 dark:hover:bg-[#2a2a4a]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-neutral-200 dark:border-[#2a2a4a] mt-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-blue-50 dark:bg-[#1a2744] text-blue-700 dark:text-[#4a9eff]'
                    : 'text-neutral-600 dark:text-[#b0b0b0] hover:text-neutral-900 dark:hover:text-[#e0e0e0]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
