import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import de from '../locales/de.json';
import it from '../locales/it.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import ar from '../locales/ar.json';
import pl from '../locales/pl.json';
import ro from '../locales/ro.json';
import ru from '../locales/ru.json';
import tr from '../locales/tr.json';
import uk from '../locales/uk.json';
import pt from '../locales/pt.json';
import nl from '../locales/nl.json';

const resources = {
  en: { translation: en },
  de: { translation: de },
  it: { translation: it },
  fr: { translation: fr },
  es: { translation: es },
  ar: { translation: ar },
  pl: { translation: pl },
  ro: { translation: ro },
  ru: { translation: ru },
  tr: { translation: tr },
  uk: { translation: uk },
  pt: { translation: pt },
  nl: { translation: nl },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
