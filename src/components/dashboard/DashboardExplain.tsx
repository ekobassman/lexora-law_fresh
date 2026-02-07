import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useCases } from '@/hooks/useCases';
import {
  MessageCircle,
  Mic,
  Send,
  Camera,
  Paperclip,
  ChevronDown,
  Copy,
  Eye,
  Printer,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GOLD = '#d4af37';
const GOLD_DARK = '#c49c4f';
const CONTENT_BG = '#f5f2ee';
const CARD_BG = '#ebe0b2';
const NAV_BG = '#162334';
const TEXT_DARK = '#333333';
const TEXT_MUTED = '#555555';

const SIX_ACTIONS = [
  { key: 'scanDocument' as const, icon: Camera },
  { key: 'uploadFile' as const, icon: Paperclip },
  { key: 'copyLetter' as const, icon: Copy },
  { key: 'preview' as const, icon: Eye },
  { key: 'print' as const, icon: Printer },
  { key: 'email' as const, icon: Mail },
] as const;

export function DashboardExplain() {
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const { cases } = useCases();
  const [selectOpen, setSelectOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

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
      <div className="px-4 pt-4 pb-6">
        {/* Vorgang auswählen */}
        <div className="relative mb-4" ref={selectRef}>
          <button
            type="button"
            onClick={() => setSelectOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left"
            style={{
              backgroundColor: CARD_BG,
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
              style={{ backgroundColor: '#fff', borderColor: GOLD_DARK }}
            >
              {cases.length === 0 ? (
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

        {/* Main card - Erklär mir, was passiert ist */}
        <div
          className="rounded-2xl border-2 p-6 mb-6 shadow-md"
          style={{
            backgroundColor: CARD_BG,
            borderColor: GOLD_DARK,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span style={{ color: GOLD_DARK }}>✨</span>
            <h2
              className="flex-1 text-center font-bold text-lg"
              style={{ color: TEXT_DARK }}
            >
              {t('dashboardRef.explainTitle')}
            </h2>
            <MessageCircle className="w-5 h-5 shrink-0" style={{ color: GOLD_DARK }} />
          </div>
          <div className="flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: CARD_BG, border: `2px solid ${GOLD_DARK}` }}
            >
              <MessageCircle className="w-8 h-8" style={{ color: GOLD_DARK }} />
            </div>
            <p className="font-medium mb-2" style={{ color: TEXT_MUTED }}>
              {t('dashboardRef.helloPrompt')}
            </p>
            <p className="text-sm italic" style={{ color: TEXT_MUTED }}>
              {t('dashboardRef.describePrompt')}
            </p>
          </div>
        </div>

        {/* Input row - mic, input, send */}
        <div
          className="flex items-center gap-2 mb-6 rounded-full border pl-2 pr-2 py-2"
          style={{
            backgroundColor: CARD_BG,
            borderColor: GOLD_DARK,
          }}
        >
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: CARD_BG }}
            aria-label={t('dashboardRef.scanDocument')}
          >
            <Mic className="w-5 h-5" style={{ color: GOLD_DARK }} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('dashboardRef.writeHere')}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm px-2"
            style={{ color: TEXT_DARK }}
          />
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: GOLD_DARK }}
            aria-label="Send"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Two primary buttons - Scan document, Upload file */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard/new')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2"
            style={{
              backgroundColor: NAV_BG,
              borderColor: GOLD_DARK,
              color: GOLD,
            }}
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">{t('dashboardRef.scanDocument')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/new')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2"
            style={{
              backgroundColor: NAV_BG,
              borderColor: GOLD_DARK,
              color: GOLD,
            }}
          >
            <Paperclip className="w-5 h-5" />
            <span className="text-sm font-medium">{t('dashboardRef.uploadFile')}</span>
          </button>
        </div>

        {/* 6 action buttons grid */}
        <div className="grid grid-cols-2 gap-3">
          {SIX_ACTIONS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className="flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-xl border"
              style={{
                backgroundColor: NAV_BG,
                borderColor: GOLD_DARK,
                color: '#fff',
              }}
            >
              <Icon className="w-6 h-6" style={{ color: GOLD }} />
              <span className="text-xs font-medium">{t(`dashboardRef.${key}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
