import { useState, useRef, useEffect } from 'react';
import {
  useLanguageContext,
  type Language,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
} from '@/contexts/LanguageContext';

/** Dropdown con le 11 bandiere/lingue supportate */
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
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-lg hover:bg-navy-light/50 transition-colors"
        aria-label="Cambia lingua"
        aria-expanded={open}
      >
        <span>{LANGUAGE_FLAGS[language]}</span>
        <span className="text-sm hidden sm:inline">{language.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border border-navy-light bg-navy py-1 shadow-lg">
          {langs.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-navy-light ${
                language === lang ? 'bg-navy-light/50 text-gold' : ''
              }`}
            >
              <span>{LANGUAGE_FLAGS[lang]}</span>
              <span>{LANGUAGE_NAMES[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
