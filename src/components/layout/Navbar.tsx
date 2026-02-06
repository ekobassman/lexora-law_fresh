import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguageContext();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <nav className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-gold">❧</span>
          Lexora
        </Link>

        <div className="hidden md:flex md:items-center md:gap-6">
          <LanguageSwitcher />
          <Link to="/" className="text-sm hover:underline">
            {t('nav.home')}
          </Link>
          {user && (
            <Link to="/dashboard" className="text-sm hover:underline">
              {t('nav.dashboard')}
            </Link>
          )}
          <Link to="/pricing" className="text-sm hover:underline">
            {t('nav.pricing')}
          </Link>
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">{t('nav.dashboard')}</Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate('/');
                }}
              >
                <LogOut className="h-4 w-4 mr-1" />
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">{t('nav.login')}</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm">{t('nav.signup')}</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t px-4 py-4 space-y-2">
          <div className="py-2">
            <LanguageSwitcher />
          </div>
          <Link to="/" className="block py-2" onClick={() => setOpen(false)}>
            {t('nav.home')}
          </Link>
          {user && (
            <Link to="/dashboard" className="block py-2" onClick={() => setOpen(false)}>
              {t('nav.dashboard')}
            </Link>
          )}
          <Link to="/pricing" className="block py-2" onClick={() => setOpen(false)}>
            {t('nav.pricing')}
          </Link>
          {user ? (
            <button
              className="block py-2 w-full text-left"
              onClick={async () => {
                await signOut();
                setOpen(false);
                navigate('/');
              }}
            >
              {t('nav.logout')}
            </button>
          ) : (
            <>
              <Link to="/auth" className="block py-2" onClick={() => setOpen(false)}>
                {t('nav.login')}
              </Link>
              <Link to="/auth?mode=signup" className="block py-2" onClick={() => setOpen(false)}>
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
