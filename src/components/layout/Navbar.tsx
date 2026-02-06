import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { User, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-navy border-b border-gold/20 h-16 md:h-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-full flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 py-2 shrink-0">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-gold/60" />
            <div className="absolute inset-1 rounded-full border border-gold/30" />
            <span className="relative font-display text-base sm:text-lg font-semibold text-gold" style={{ fontFamily: 'Georgia, serif' }}>L</span>
          </div>
          <span className="font-display text-lg sm:text-xl font-medium tracking-widest text-ivory uppercase">LEXORA</span>
        </Link>

        <div className="hidden md:flex md:items-center md:gap-6">
          <LanguageSwitcher />
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-navy transition bg-graphite"
              aria-label="Menu utente"
            >
              <User className="w-5 h-5" />
            </button>
            {userMenuOpen && (
              <div
              className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-xl py-2 shadow-xl bg-graphite border border-gold/20"
              >
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/5"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5"
                      onClick={async () => {
                        await signOut();
                        setUserMenuOpen(false);
                        navigate('/');
                      }}
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/5"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t('nav.home')}
                    </Link>
                    <Link
                      to="/pricing"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/5"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t('nav.pricing')}
                    </Link>
                    <Link
                      to="/auth"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/5"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      className="block px-4 py-2 text-sm font-medium text-gold"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t('nav.signup')}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-graphite transition text-gold"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-graphite border-t border-gold/20 px-4 py-4 space-y-2">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link to="/dashboard" className="block py-3 text-white" onClick={() => setMobileOpen(false)}>
                {t('nav.dashboard')}
              </Link>
              <button
                type="button"
                className="block py-3 w-full text-left text-white"
                onClick={async () => {
                  await signOut();
                  setMobileOpen(false);
                  navigate('/');
                }}
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="block py-3 text-white" onClick={() => setMobileOpen(false)}>
                {t('nav.home')}
              </Link>
              <Link to="/pricing" className="block py-3 text-white" onClick={() => setMobileOpen(false)}>
                {t('nav.pricing')}
              </Link>
              <Link to="/auth" className="block py-3 text-white" onClick={() => setMobileOpen(false)}>
                {t('nav.login')}
              </Link>
              <Link
                to="/auth?mode=signup"
                className="block py-3 font-medium text-gold"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>
      )}

      {/* Gold divider line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </nav>
  );
}
