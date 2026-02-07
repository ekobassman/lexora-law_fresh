import { useLanguageContext } from '@/contexts/LanguageContext';

const CONTENT_BG = '#f5f2ee';
const TEXT_DARK = '#333333';

export function DashboardSettings() {
  const { t } = useLanguageContext();

  return (
    <div className="min-h-full px-4 pt-6 pb-24" style={{ backgroundColor: CONTENT_BG }}>
      <h1
        className="text-xl font-semibold mb-4"
        style={{ color: TEXT_DARK, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {t('dashboardShell.settings')}
      </h1>
      <p className="text-sm" style={{ color: '#555' }}>
        {t('dashboardRef.needMoreSupport')}
      </p>
    </div>
  );
}
