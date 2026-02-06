import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'de' | 'it' | 'fr' | 'es';

const STORAGE_KEY = 'lexora_language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED: Language[] = ['en', 'de', 'it', 'fr', 'es'];

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
