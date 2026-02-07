import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Disclaimer() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <header className="p-6 border-b border-[#d4af37]">
        <Link to="/" className="text-white font-serif text-2xl">
          LEXORA
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 bg-[#f5f5f0] my-8 rounded-2xl">
        <h1 className="text-3xl font-serif text-[#0f172a] mb-8 border-b-2 border-[#d4af37] pb-4">
          {t('legal.disclaimerTitle')}
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-lg">{t('footer.disclaimer_text')}</p>
          <p>{t('legal.disclaimerNotLegal')}</p>
          <p>{t('legal.disclaimerVerify')}</p>
          <p>{t('legal.disclaimerJurisdiction')}</p>

          <p className="text-sm text-gray-500 mt-4">{t('legal.contactNotice')}</p>
        </div>
      </main>

      <footer className="bg-[#0f172a] py-8 text-center text-gray-400">
        <Link to="/" className="text-[#d4af37] hover:underline">
          ← {t('legal.backToHome')}
        </Link>
      </footer>
    </div>
  );
}
