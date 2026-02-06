import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Logo } from '@/components/layout/Logo';
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
    <nav className="bg-[#0f172a] border-b border-[rgba(212,175,55,0.3)] h-16 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Logo size="sm" />

        <div className="hidden md:flex md:items-center md:gap-4">
          <LanguageSwitcher />
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-10 h-10 rounded-full border border-[rgba(212,175,55,0.5)] flex items-center justify-center hover:border-[#d4af37] transition"
              aria-label="Menu utente"
            >
              <User className="w-5 h-5 text-[#d4af37]" />
            </button>
            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-xl py-2 shadow-xl"
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(212,175,55,0.2)',
                }}
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
                      className="block px-4 py-2 text-sm font-medium text-[#d4af37]"
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
          className="md:hidden p-2 rounded-lg hover:bg-navy-800 transition text-[#d4af37]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-navy-800 border-t border-[rgba(212,175,55,0.2)] px-4 py-4 space-y-2">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link to="/dashboard" className="block py-3 text-white" onClick={() => setMobileOpen(false)}>
                {t('nav.dashboard')}
              </Link>
              <button
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
              <Link to="/auth?mode=signup" className="block py-3 font-medium text-[#d4af37]" onClick={() => setMobileOpen(false)}>
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
