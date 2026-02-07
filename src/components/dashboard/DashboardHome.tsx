import { useNavigate } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Lock, Mail, Scale, Brain, ChevronDown, FileText } from 'lucide-react';
import { useCases } from '@/hooks/useCases';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const GOLD = '#d4af37';
const CONTENT_BG = '#f5f2ee';
const CARD_BG = '#ffffff';
const TEXT_DARK = '#333333';
const TEXT_MUTED = '#555555';

const cards = [
  { key: 'cardUrgent', icon: Lock, iconColor: '#7dd3fc' },
  { key: 'cardReadLetter', icon: Mail, iconColor: '#7dd3fc' },
  { key: 'cardObjection', icon: Scale, iconColor: '#c084fc' },
  { key: 'cardExplainDoc', icon: Brain, iconColor: '#86efac' },
] as const;

export function DashboardHome() {
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const { cases } = useCases();
  const [selectOpen, setSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const hasCases = cases.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setSelectOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-full" style={{ backgroundColor: CONTENT_BG }}>
      <div className="px-4 pt-6 pb-6">
        {/* Title - serif, gold, centered */}
        <h1
          className="text-center text-2xl font-bold tracking-wide uppercase mb-6"
          style={{ color: GOLD, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t('dashboardRef.title')}
        </h1>

        {/* Your legal matters + subtitle */}
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: TEXT_DARK, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t('dashboardRef.yourProcesses')}
        </h2>
        <p
          className="text-sm mb-6"
          style={{ color: TEXT_MUTED }}
        >
          {t('dashboardRef.manageSubtitle')}
        </p>

        {/* 4 cards grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {cards.map(({ key, icon: Icon, iconColor }) => (
            <button
              key={key}
              type="button"
              onClick={() => key === 'cardExplainDoc' && navigate('/dashboard/explain')}
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-[#e5e2dd] shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37]/50"
              style={{
                backgroundColor: CARD_BG,
                color: TEXT_DARK,
              }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg mb-3"
                style={{ backgroundColor: `${iconColor}20` }}
              >
                <Icon className="w-6 h-6" style={{ color: iconColor }} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-center">{t(`dashboardRef.${key}`)}</span>
            </button>
          ))}
        </div>

        {/* Vorgang auswählen dropdown */}
        <div className="relative" ref={selectRef}>
          <button
            type="button"
            onClick={() => setSelectOpen(!selectOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left"
            style={{
              backgroundColor: '#f8f7f4',
              borderColor: '#d4af3740',
              color: TEXT_DARK,
            }}
          >
            <span className="text-sm">{t('dashboardRef.selectProcess')}</span>
            <ChevronDown
              className={cn('w-5 h-5 transition', selectOpen && 'rotate-180')}
              style={{ color: GOLD }}
            />
          </button>
          {selectOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-1 rounded-xl border shadow-lg py-2 z-50 max-h-56 overflow-auto"
              style={{
                backgroundColor: CARD_BG,
                borderColor: '#e5e2dd',
              }}
            >
              {!hasCases ? (
                <div className="px-4 py-3 text-sm" style={{ color: TEXT_MUTED }}>
                  {t('dashboardRef.noProcesses')}
                </div>
              ) : (
                cases.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-black/5"
                    style={{ color: TEXT_DARK }}
                    onClick={() => setSelectOpen(false)}
                  >
                    {c.title || c.aktenzeichen || c.id}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Empty state card when no cases */}
        {!hasCases && (
          <>
            <div
              className="mt-8 flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed text-center"
              style={{
                backgroundColor: CARD_BG,
                borderColor: '#d3d3d3',
              }}
            >
              <div className="w-16 h-16 flex items-center justify-center mb-4" style={{ color: '#9ca3af' }}>
                <FileText className="w-12 h-12" strokeWidth={1.2} />
              </div>
              <p className="font-semibold mb-2" style={{ color: TEXT_DARK }}>
                {t('dashboardRef.noProcesses')}
              </p>
              <p className="text-sm" style={{ color: TEXT_MUTED }}>
                {t('dashboardRef.startNewProcess')}
              </p>
              <button
                type="button"
                onClick={() => navigate('/dashboard/new')}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: GOLD }}
              >
                {t('dashboardShell.upload')}
              </button>
            </div>

            {/* Support section */}
            <div className="mt-10 text-center">
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: TEXT_DARK, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t('dashboardRef.needMoreSupport')}
              </h3>
              <p
                className="text-sm text-left max-w-xl mx-auto leading-relaxed"
                style={{ color: TEXT_MUTED }}
              >
                {t('dashboardRef.supportParagraph')}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer pill - lexora-law.com */}
      <div className="px-4 pb-8 flex justify-center">
        <a
          href="https://lexora-law.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-full text-sm text-white no-underline"
          style={{ backgroundColor: '#282828' }}
        >
          {t('dashboardRef.lexoraWebsite')}
        </a>
      </div>
    </div>
  );
}
