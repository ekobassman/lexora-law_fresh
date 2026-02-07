import { Link } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Shield, ArrowLeft } from 'lucide-react';

export function Disclaimer() {
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
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-10 w-10 text-[#d4af37]" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#0f172a]">
              {t('legal.disclaimerTitle')}
            </h1>
          </div>

          <div className="space-y-6 text-gray-800 leading-relaxed">
            <p className="text-lg">{t('footer.disclaimer_text')}</p>
            <p>{t('legal.disclaimerNotLegal')}</p>
            <p>{t('legal.disclaimerVerify')}</p>
            <p>{t('legal.disclaimerJurisdiction')}</p>
            <p className="text-sm text-gray-600">{t('legal.contactNotice')}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
