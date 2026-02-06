import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import de from './locales/de.json';
import en from './locales/en.json';
import it from './locales/it.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import tr from './locales/tr.json';
import uk from './locales/uk.json';
import pl from './locales/pl.json';
import ro from './locales/ro.json';
import nl from './locales/nl.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
      it: { translation: it },
      fr: { translation: fr },
      es: { translation: es },
      pt: { translation: pt },
      tr: { translation: tr },
      uk: { translation: uk },
      pl: { translation: pl },
      ro: { translation: ro },
      nl: { translation: nl },
    },
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
