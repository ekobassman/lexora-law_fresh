import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import {
  LayoutGrid,
  Plus,
  Headphones,
  Settings,
  User,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const NAV_BG = '#0c182b';
const GOLD = '#d4af37';
const CONTENT_BG = '#f5f2ee';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t } = useLanguageContext();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path === '/dashboard/new' && location.pathname === '/dashboard/new') return true;
    if (path === '/help' && location.pathname === '/help') return true;
    if (path === '/dashboard/settings' && location.pathname === '/dashboard/settings') return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: NAV_BG }}>
      {/* Header - pixel-perfect reference */}
      <header
        className="flex items-center justify-between px-4 h-14 shrink-0 safe-area-top"
        style={{ backgroundColor: NAV_BG }}
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-2 shrink-0 no-underline"
          aria-label="Lexora Dashboard"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 shrink-0"
            style={{ borderColor: GOLD, backgroundColor: NAV_BG }}
          >
            <span
              className="text-lg font-semibold"
              style={{ color: GOLD, fontFamily: 'Georgia, serif' }}
            >
              L
            </span>
          </div>
          <span
            className="font-medium tracking-[0.2em] uppercase text-lg"
            style={{ color: GOLD, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            LEXORA
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 rounded-full hover:opacity-90"
            style={{ color: GOLD }}
            aria-label={t('dashboardShell.support')}
            onClick={() => navigate('/help')}
          >
            <Headphones className="w-5 h-5" />
          </button>
          <div className="[&_button]:text-[#d4af37] [&_.text-sm]:text-[#d4af37]">
            <LanguageSwitcher />
          </div>
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="p-2 rounded-full border-2 hover:opacity-90"
              style={{ color: GOLD, borderColor: GOLD }}
              aria-label={t('dashboardShell.profile')}
            >
              <User className="w-5 h-5" />
            </button>
            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl py-2 shadow-xl border"
                style={{ backgroundColor: '#1e293b', borderColor: `${GOLD}40` }}
              >
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-sm text-white hover:bg-white/5"
                  onClick={() => setUserMenuOpen(false)}
                >
                  {t('dashboardShell.dashboard')}
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-white hover:bg-white/5"
                  onClick={() => setUserMenuOpen(false)}
                >
                  {t('dashboardShell.settings')}
                </Link>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5"
                  onClick={async () => {
                    setUserMenuOpen(false);
                    await signOut?.();
                    navigate('/');
                  }}
                >
                  {t('dashboardShell.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content - beige background */}
      <main
        className="flex-1 overflow-auto pb-24"
        style={{ backgroundColor: CONTENT_BG }}
      >
        {children}
      </main>

      {/* Bottom navigation - reference exact */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-end justify-around px-2 pt-2 pb-6 safe-area-bottom z-40"
        style={{ backgroundColor: NAV_BG }}
      >
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className={cn(
            'flex flex-col items-center gap-0.5 min-w-[64px]',
            isActive('/dashboard') ? 'opacity-100' : 'opacity-80'
          )}
          style={{ color: GOLD }}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-xs font-medium">{t('dashboardShell.dashboard')}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard/new')}
          className="flex flex-col items-center gap-0.5 min-w-[64px] -mt-4"
          style={{ color: GOLD }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-lg"
            style={{ backgroundColor: NAV_BG, borderColor: GOLD }}
          >
            <Plus className="w-7 h-7" style={{ color: GOLD }} />
          </div>
          <span className="text-xs font-medium text-white">{t('dashboardShell.upload')}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/help')}
          className={cn(
            'flex flex-col items-center gap-0.5 min-w-[64px]',
            isActive('/help') ? 'opacity-100' : 'opacity-80'
          )}
          style={{ color: GOLD }}
        >
          <Headphones className="w-6 h-6" />
          <span className="text-xs font-medium">{t('dashboardShell.support')}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard/settings')}
          className={cn(
            'flex flex-col items-center gap-0.5 min-w-[64px]',
            isActive('/dashboard/settings') ? 'opacity-100' : 'opacity-80'
          )}
          style={{ color: GOLD }}
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs font-medium">{t('dashboardShell.settings')}</span>
        </button>
      </nav>
    </div>
  );
}
