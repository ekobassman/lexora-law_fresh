import { Link } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';

export function Imprint() {
  const { t } = useLanguageContext();

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#e5c04a] text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('legal.backToHome')}
        </Link>

        <article className="bg-[#f5f5f0] rounded-2xl p-8 md:p-12 shadow-2xl text-[#0f172a]">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#0f172a] mb-8">
            {t('legal.imprintTitle')}
          </h1>

          <div className="space-y-6 text-gray-800 leading-relaxed">
            <p>{t('legal.imprintIntro')}</p>
            <div className="space-y-2">
              <p><strong>Lexora</strong></p>
              <p>{t('legal.imprintAddress')}</p>
              <p>{t('legal.imprintEmail')}: <a href="mailto:support@lexora-law.com" className="text-[#d4af37] hover:underline">support@lexora-law.com</a></p>
            </div>
            <p className="text-sm text-gray-600">{t('legal.contactNotice')}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
