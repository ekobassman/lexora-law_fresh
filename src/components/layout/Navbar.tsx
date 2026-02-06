import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user } = useAuth();
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
            <Link to="/dashboard">
                <Button variant="outline" size="sm">{t('nav.dashboard')}</Button>
              </Link>
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
          {!user && (
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
