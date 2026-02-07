import { useNavigate, Link } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import {
  Lock,
  Mail,
  Scale,
  Brain,
  ChevronDown,
  FileText,
  MessageCircle,
  Mic,
  Send,
  Camera,
  Paperclip,
  Copy,
  Eye,
  Printer,
  Check,
} from 'lucide-react';
import { useCases } from '@/hooks/useCases';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const GOLD = '#d4af37';
const GOLD_DARK = '#c49c4f';
const CONTENT_BG = '#f5f2ee';
const CARD_BG = '#ffffff';
const CHAT_CARD_BG = '#ebe0b2';
const NAV_BG = '#162334';
const TEXT_DARK = '#333333';
const TEXT_MUTED = '#555555';

const cards = [
  { key: 'cardUrgent', icon: Lock, iconColor: '#7dd3fc' },
  { key: 'cardReadLetter', icon: Mail, iconColor: '#7dd3fc' },
  { key: 'cardObjection', icon: Scale, iconColor: '#c084fc' },
  { key: 'cardExplainDoc', icon: Brain, iconColor: '#86efac' },
] as const;

const SIX_ACTIONS = [
  { key: 'scanDocument' as const, icon: Camera },
  { key: 'uploadFile' as const, icon: Paperclip },
  { key: 'copyLetter' as const, icon: Copy },
  { key: 'preview' as const, icon: Eye },
  { key: 'print' as const, icon: Printer },
  { key: 'email' as const, icon: Mail },
] as const;

const PLANS = [
  { id: 'starter' as const, price: '3,99', casesKey: 'upTo10Cases', f1: 'starterF1', f2: 'starterF2', f3: 'starterF3', badgeGold: false },
  { id: 'pro' as const, price: '9,99', casesKey: '10to50Cases', f1: 'proF1', f2: 'proF2', f3: 'proF3', badgeGold: true },
  { id: 'unlimited' as const, price: '19,99', casesKey: 'unlimitedCases', f1: 'unlimitedF1', f2: 'unlimitedF2', f3: 'unlimitedF3', badgeGold: false },
] as const;

export function DashboardHome() {
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const { cases } = useCases();
  const [selectOpen, setSelectOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
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

  const handleSendChat = () => {
    if (chatInput.trim()) navigate('/dashboard/explain', { state: { initialMessage: chatInput.trim() } });
  };

  return (
    <div className="min-h-full" style={{ backgroundColor: CONTENT_BG }}>
      <div className="px-4 pt-6 pb-6">
        {/* Title */}
        <h1
          className="text-center text-2xl font-bold tracking-wide uppercase mb-4"
          style={{ color: GOLD, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t('dashboardRef.title')}
        </h1>

        {/* Vorgang auswählen */}
        <div className="relative mb-4" ref={selectRef}>
          <button
            type="button"
            onClick={() => setSelectOpen(!selectOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left"
            style={{
              backgroundColor: CHAT_CARD_BG,
              borderColor: GOLD_DARK,
              color: TEXT_DARK,
            }}
          >
            <span className="text-sm">{t('dashboardRef.selectProcess')}</span>
            <ChevronDown
              className={cn('w-5 h-5 transition', selectOpen && 'rotate-180')}
              style={{ color: GOLD_DARK }}
            />
          </button>
          {selectOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-1 rounded-xl border shadow-lg py-2 z-50 max-h-56 overflow-auto"
              style={{ backgroundColor: CARD_BG, borderColor: GOLD_DARK }}
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

        {/* Luxury chat card */}
        <div
          className="rounded-2xl border-2 p-5 mb-4 shadow-md"
          style={{ backgroundColor: CHAT_CARD_BG, borderColor: GOLD_DARK }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span style={{ color: GOLD_DARK }}>✨</span>
            <h2 className="flex-1 text-center font-bold text-base" style={{ color: TEXT_DARK }}>
              {t('dashboardRef.explainTitle')}
            </h2>
            <MessageCircle className="w-5 h-5 shrink-0" style={{ color: GOLD_DARK }} />
          </div>
          <div className="flex flex-col items-center text-center mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3 border-2"
              style={{ borderColor: GOLD_DARK }}
            >
              <MessageCircle className="w-7 h-7" style={{ color: GOLD_DARK }} />
            </div>
            <p className="font-medium text-sm mb-1" style={{ color: TEXT_MUTED }}>
              {t('dashboardRef.helloPrompt')}
            </p>
            <p className="text-sm italic" style={{ color: TEXT_MUTED }}>
              {t('dashboardRef.describePrompt')}
            </p>
          </div>
          {/* Input row */}
          <div
            className="flex items-center gap-2 rounded-full border pl-2 pr-2 py-2 mb-4"
            style={{ backgroundColor: CHAT_CARD_BG, borderColor: GOLD_DARK }}
          >
            <button
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              aria-label="Microphone"
            >
              <Mic className="w-4 h-4" style={{ color: GOLD_DARK }} />
            </button>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder={t('dashboardRef.writeHere')}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm px-2"
              style={{ color: TEXT_DARK }}
            />
            <button
              type="button"
              onClick={handleSendChat}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: GOLD_DARK }}
              aria-label="Send"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          {/* Two primary buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/new')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2"
              style={{ backgroundColor: NAV_BG, borderColor: GOLD_DARK, color: GOLD }}
            >
              <Camera className="w-4 h-4" />
              <span className="text-xs font-medium">{t('dashboardRef.scanDocument')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/new')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2"
              style={{ backgroundColor: NAV_BG, borderColor: GOLD_DARK, color: GOLD }}
            >
              <Paperclip className="w-4 h-4" />
              <span className="text-xs font-medium">{t('dashboardRef.uploadFile')}</span>
            </button>
          </div>
          {/* 6 action buttons */}
          <div className="grid grid-cols-2 gap-2">
            {SIX_ACTIONS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => (key === 'scanDocument' || key === 'uploadFile' ? navigate('/dashboard/new') : undefined)}
                className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border"
                style={{ backgroundColor: NAV_BG, borderColor: GOLD_DARK, color: '#fff' }}
              >
                <Icon className="w-5 h-5" style={{ color: GOLD }} />
                <span className="text-xs font-medium">{t(`dashboardRef.${key}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Your legal matters + 4 cards */}
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: TEXT_DARK, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t('dashboardRef.yourProcesses')}
        </h2>
        <p className="text-sm mb-4" style={{ color: TEXT_MUTED }}>
          {t('dashboardRef.manageSubtitle')}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {cards.map(({ key, icon: Icon, iconColor }) => (
            <button
              key={key}
              type="button"
              onClick={() => key === 'cardExplainDoc' && navigate('/dashboard/explain')}
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-[#e5e2dd] shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37]/50"
              style={{ backgroundColor: CARD_BG, color: TEXT_DARK }}
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

        {/* Empty state when no cases */}
        {!hasCases && (
          <div
            className="mb-8 flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed text-center"
            style={{ backgroundColor: CARD_BG, borderColor: '#d3d3d3' }}
          >
            <div className="w-16 h-16 flex items-center justify-center mb-4" style={{ color: '#9ca3af' }}>
              <FileText className="w-12 h-12" strokeWidth={1.2} />
            </div>
            <p className="font-semibold mb-2" style={{ color: TEXT_DARK }}>
              {t('dashboardRef.noProcesses')}
            </p>
            <p className="text-sm mb-4" style={{ color: TEXT_MUTED }}>
              {t('dashboardRef.startNewProcess')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard/new')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: GOLD }}
            >
              {t('dashboardShell.upload')}
            </button>
          </div>
        )}

        {/* Support section + Monthly plan cards */}
        <div className="text-center mb-6">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: TEXT_DARK, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t('dashboardRef.needMoreSupport')}
          </h3>
          <p className="text-sm text-left max-w-xl mx-auto leading-relaxed mb-6" style={{ color: TEXT_MUTED }}>
            {t('dashboardRef.supportParagraph')}
          </p>
        </div>

        {/* Monthly plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
              style={{ borderColor: '#e5e2dd' }}
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                style={{
                  backgroundColor: plan.badgeGold ? `${GOLD}30` : '#e5e7eb',
                  color: TEXT_DARK,
                }}
              >
                {t(`dashboardRef.${plan.id}`)}
              </span>
              <p className="text-2xl font-bold mb-0.5" style={{ color: TEXT_DARK }}>
                {plan.price}€<span className="text-sm font-normal" style={{ color: TEXT_MUTED }}>{t('dashboardRef.perMonth')}</span>
              </p>
              <p className="text-xs mb-3" style={{ color: TEXT_MUTED }}>
                {t(`dashboardRef.${plan.casesKey}`)}
              </p>
              <ul className="space-y-1.5 mb-4 text-left">
                <li className="flex items-center gap-2 text-xs" style={{ color: TEXT_DARK }}>
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                  {t(`dashboardRef.${plan.f1}`)}
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: TEXT_DARK }}>
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                  {t(`dashboardRef.${plan.f2}`)}
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: TEXT_DARK }}>
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                  {t(`dashboardRef.${plan.f3}`)}
                </li>
              </ul>
              <Link
                to="/pricing"
                className="block w-full py-2 rounded-lg text-center text-sm font-medium border"
                style={{ backgroundColor: CARD_BG, borderColor: '#e5e2dd', color: TEXT_DARK }}
              >
                {t('dashboardRef.selectPlan')}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs mb-2" style={{ color: TEXT_MUTED }}>
          {t('dashboardRef.pricesLocalCurrency')}
        </p>
        <p className="text-center mb-6">
          <Link to="/pricing" className="text-sm underline" style={{ color: '#2563eb' }}>
            {t('dashboardRef.comparePlans')}
          </Link>
        </p>
      </div>

      {/* Footer pill */}
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
