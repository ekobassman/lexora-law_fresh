import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

export type Language =
  | 'ar'
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'it'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'tr'
  | 'uk';

const STORAGE_KEY = 'lexora_language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED: Language[] = ['ar', 'de', 'en', 'es', 'fr', 'it', 'nl', 'pl', 'pt', 'ro', 'ru', 'tr', 'uk'];

/** Emoji bandiere per ogni lingua (per UI compatta) */
export const LANGUAGE_FLAGS: Record<Language, string> = {
  ar: '🇸🇦',
  de: '🇩🇪',
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  it: '🇮🇹',
  nl: '🇳🇱',
  pl: '🇵🇱',
  pt: '🇵🇹',
  ro: '🇷🇴',
  ru: '🇷🇺',
  tr: '🇹🇷',
  uk: '🇺🇦',
};

export const LANGUAGE_NAMES: Record<Language, string> = {
  ar: 'العربية',
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  pt: 'Português',
  ro: 'Română',
  ru: 'Русский',
  tr: 'Türkçe',
  uk: 'Українська',
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored && SUPPORTED.includes(stored)) return stored;
    } catch {
      /* ignore */
    }
    return 'en';
  });

  useEffect(() => {
    i18n.changeLanguage(language);
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
  }, [language, i18n]);

  const setLanguage = useCallback((lang: Language) => {
    if (SUPPORTED.includes(lang)) setLanguageState(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const ctx = useContext(LanguageContext);
  if (ctx === undefined)
    throw new Error('useLanguageContext must be used within LanguageProvider');
  return ctx;
}
