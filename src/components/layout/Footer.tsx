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
    <footer className="bg-navy border-t border-gold/20 py-12 md:py-16 mt-auto">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div>
            <h4 className="font-semibold text-ivory mb-4">{gt('footer.product', 'Product')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#chat-demo" className="text-ivory/60 hover:text-gold text-sm transition-colors">
                  {gt('footer.howItWorks', 'How it works')}
                </a>
              </li>
              <li>
                <Link to="/pricing" className="text-ivory/60 hover:text-gold text-sm transition-colors">
                  {gt('footer.pricing', 'Pricing')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ivory mb-4">{gt('footer.company', 'Company')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@lexora.app" className="text-ivory/60 hover:text-gold text-sm transition-colors">
                  {gt('footer.aboutUs', 'About us')}
                </a>
              </li>
              <li>
                <a href="mailto:support@lexora.app" className="text-ivory/60 hover:text-gold text-sm transition-colors">
                  {gt('footer.contact', 'Contact')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ivory mb-4">{gt('footer.legal', 'Legal')}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-ivory/60 hover:text-gold text-sm transition-colors">
                  {gt('footer.privacy', 'Privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-ivory/60 hover:text-gold text-sm transition-colors">
                  {gt('footer.terms', 'Terms')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ivory mb-4">{gt('footer.support', 'Support')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@lexora.app" className="text-ivory/60 hover:text-gold text-sm transition-colors">
                  {gt('footer.helpCenter', 'Help')}
                </a>
              </li>
              <li>
                <a href="mailto:support@lexora.app" className="text-ivory/60 hover:text-gold text-sm transition-colors">
                  support@lexora.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-gold/60" />
                <span className="relative font-display text-sm font-semibold text-gold" style={{ fontFamily: 'Georgia, serif' }}>L</span>
              </div>
              <span className="font-display text-lg font-medium tracking-widest text-ivory uppercase">LEXORA</span>
              <span className="text-ivory/40 text-sm">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full border border-gold/20 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold/40 transition-all"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full border border-gold/20 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold/40 transition-all"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gold/10">
          <div className="flex items-start gap-3 rounded-lg bg-ivory/5 p-4 max-w-3xl mx-auto">
            <Shield className="h-5 w-5 flex-shrink-0 text-gold/60 mt-0.5" />
            <p className="text-xs text-ivory/50 leading-relaxed">
              {gt('footer.disclaimerText', 'Lexora uses AI to assist with legal documents. Always verify important decisions with a professional.')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
