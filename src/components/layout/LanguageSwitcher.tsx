import { useState, useRef, useEffect } from 'react';
import {
  useLanguageContext,
  type Language,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
} from '@/contexts/LanguageContext';
import { ChevronDown } from 'lucide-react';

/** Selettore lingua: [bandiera] + codice (IT) + freccia - una sola bandiera */
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const langs = Object.keys(LANGUAGE_FLAGS) as Language[];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-white hover:text-[#d4af37] transition group"
        aria-label={`Lingua: ${language.toUpperCase()}`}
        aria-expanded={open}
      >
        <span className="text-xl leading-none" aria-hidden>
          {LANGUAGE_FLAGS[language]}
        </span>
        <span className="text-sm font-medium uppercase tracking-wide tabular-nums">
          {language.toUpperCase()}
        </span>
        <ChevronDown className="w-4 h-4 text-[#d4af37] group-hover:rotate-180 transition shrink-0" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl py-1 shadow-xl"
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          {langs.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${
                language === lang ? 'text-[#d4af37]' : 'text-white'
              }`}
            >
              <span className="text-xl">{LANGUAGE_FLAGS[lang]}</span>
              <span>{LANGUAGE_NAMES[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
