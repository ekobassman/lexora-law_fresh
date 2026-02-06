import { Link } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Shield, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  const { t } = useLanguageContext();

  const gt = (key: string, fallback: string) => {
    try {
      const v = t(key);
      return v && v !== key ? v : fallback;
    } catch { return fallback; }
  };

  return (
    <footer className="bg-[#0f172a] border-t border-[#d4af37]/30 py-16 md:py-[64px] pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4">{gt('footer.product', 'Product')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#how-it-works" className="text-[#9ca3af] hover:text-white text-sm transition-colors">
                  {gt('footer.howItWorks', 'How it works')}
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-[#9ca3af] hover:text-white text-sm transition-colors">
                  {gt('footer.pricing', 'Pricing')}
                </a>
              </li>
              <li>
                <a href="#documents" className="text-[#9ca3af] hover:text-white text-sm transition-colors">
                  {gt('footer.supportedDocuments', 'Supported documents')}
                </a>
              </li>
              <li>
                <a href="#faq" className="text-[#9ca3af] hover:text-white text-sm transition-colors">
                  {gt('nav.faq', 'FAQ')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4">{gt('footer.company', 'Company')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@lexora.app" className="text-[#9ca3af] hover:text-white text-sm transition-colors">
                  {gt('footer.aboutUs', 'About us')}
                </a>
              </li>
              <li>
                <a href="mailto:support@lexora.app" className="text-[#9ca3af] hover:text-white text-sm transition-colors">
                  {gt('footer.contact', 'Contact')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4">{gt('footer.legal', 'Legal')}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-[#9ca3af] hover:text-white text-sm transition-colors">
                  {gt('footer.privacy', 'Privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#9ca3af] hover:text-white text-sm transition-colors">
                  {gt('footer.terms', 'Terms')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4">{gt('footer.support', 'Support')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@lexora.app" className="text-[#9ca3af] hover:text-white text-sm transition-colors">
                  {gt('footer.helpCenter', 'Help')}
                </a>
              </li>
              <li>
                <a href="mailto:support@lexora.app" className="text-[#9ca3af] hover:text-white text-sm transition-colors">
                  support@lexora.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#d4af37]/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center shrink-0 rounded-full border-2 border-[#d4af37]">
                <span className="font-display text-sm font-semibold text-[#d4af37]" style={{ fontFamily: 'Georgia, serif' }}>L</span>
              </div>
              <span className="font-display text-lg font-medium tracking-widest text-white uppercase">LEXORA</span>
              <span className="text-[#9ca3af] text-sm">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full border border-[#9ca3af] flex items-center justify-center text-[#9ca3af] hover:text-white hover:border-[#d4af37] transition-all"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full border border-[#9ca3af] flex items-center justify-center text-[#9ca3af] hover:text-white hover:border-[#d4af37] transition-all"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#d4af37]/20">
          <div className="flex items-start gap-3 rounded-lg bg-[#1e293b] p-4 max-w-3xl mx-auto">
            <Shield className="h-5 w-5 flex-shrink-0 text-[#d4af37] mt-0.5" />
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              {gt('footer.disclaimerText', 'Lexora uses AI to assist with legal documents. Always verify important decisions with a professional.')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
