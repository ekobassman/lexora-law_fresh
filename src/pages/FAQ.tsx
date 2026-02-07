import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function FAQ() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <header className="mb-8">
        <Link to="/" className="text-[#d4af37] hover:underline text-sm">
          ← {t('legal.backToHome')}
        </Link>
      </header>
      <h1 className="text-4xl font-serif text-[#d4af37] mb-4">{t('footer.faq')}</h1>
      <p className="text-gray-300">{t('faq.title')}...</p>
    </div>
  );
}
