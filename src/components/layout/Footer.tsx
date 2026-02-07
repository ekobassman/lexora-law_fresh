import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0f172a] border-t border-[#d4af37]/20 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* PRODOTTO */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-6">
            {t('footer.product')}
          </h3>
          <ul className="space-y-4">
            <li>
              <Link to="/#how-it-works" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                {t('footer.howItWorks')}
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                {t('footer.pricing')}
              </Link>
            </li>
            <li>
              <Link to="/#documents" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                {t('footer.supportedDocs')}
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                {t('footer.faq')}
              </Link>
            </li>
          </ul>
        </div>

        {/* AZIENDA */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-6">
            {t('footer.company')}
          </h3>
          <ul className="space-y-4">
            <li>
              <Link to="/about" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                {t('footer.about')}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                {t('footer.contact')}
              </Link>
            </li>
          </ul>
        </div>

        {/* LEGALE */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-6">
            {t('footer.legal')}
          </h3>
          <ul className="space-y-4">
            <li>
              <Link to="/privacy" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                {t('footer.privacy')}
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                {t('footer.terms')}
              </Link>
            </li>
            <li>
              <Link to="/imprint" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                {t('footer.imprint')}
              </Link>
            </li>
            <li>
              <Link to="/disclaimer" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                {t('footer.disclaimer')}
              </Link>
            </li>
          </ul>
        </div>

        {/* SUPPORTO */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-6">
            {t('footer.support')}
          </h3>
          <ul className="space-y-4">
            <li>
              <Link to="/help" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                {t('footer.helpCenter')}
              </Link>
            </li>
            <li>
              <a href="mailto:support@lexora-law.com" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                support@lexora-law.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright bottom */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Lexora. {t('footer.allRights')}
        </p>
      </div>
    </footer>
  );
}
