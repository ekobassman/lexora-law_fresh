import { Link } from 'react-router-dom';
import { LexoraChat } from '@/components/chat/LexoraChat';
import {
  PricingSection,
  TestimonialsSection,
  SupportedDocumentsSection,
  FAQSection,
  TrustSecuritySection,
  HowItWorksSection,
  SocialProofCounter,
} from '@/components/landing';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Upload, Clock, Globe, Sparkles, Shield, FolderOpen, Calendar, ArrowRight } from 'lucide-react';

import heroDesktop from '@/assets/hero-desktop.png';
import heroMobile from '@/assets/hero-mobile.png';

function getSafeText(t: (key: string) => string, key: string, fallback: string): string {
  const result = t(key);
  if (!result || result === key || (result.includes('.') && !result.includes(' '))) return fallback;
  return result;
}

const archiveCards = [
  { icon: Shield, titleKey: 'archive.feature1', textKey: 'archive.feature1_desc' },
  { icon: FolderOpen, titleKey: 'archive.feature2', textKey: 'archive.feature2_desc' },
  { icon: Sparkles, titleKey: 'archive.feature3', textKey: 'archive.feature3_desc' },
  { icon: Calendar, titleKey: 'archive.feature4', textKey: 'archive.feature4_desc' },
];

export function Home() {
  const { t } = useLanguageContext();

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Hero Section - pixel-perfect */}
      <section className="relative overflow-hidden bg-[#0f172a]">
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="relative rounded-2xl overflow-hidden border-[3px] border-[#d4af37]">
            <picture className="block">
              <source media="(min-width: 768px)" srcSet={heroDesktop} />
              <img
                src={heroMobile}
                alt="Lexora KI-Assistent für Behördenschreiben"
                className="w-full h-auto object-cover"
                style={{ maxHeight: '70vh' }}
              />
            </picture>
          </div>
        </div>
      </section>

      {/* Value Props - beige #f5f5f0 */}
      <section className="bg-[#f5f5f0] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-full text-sm font-medium">
                <Globe className="h-4 w-4 text-white" />
                {getSafeText(t, 'hero.badge1', 'DE · AT · CH')}
              </span>
              <span className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4 text-white" />
                {getSafeText(t, 'hero.badge2', 'AI based on national laws')}
              </span>
              <span className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-full text-sm font-medium">
                <Clock className="h-4 w-4 text-white" />
                {getSafeText(t, 'hero.badge3', 'From letter to response in minutes')}
              </span>
            </div>

            <h1 className="text-[48px] md:text-[56px] font-display font-normal md:font-medium text-[#0f172a] leading-[1.2] whitespace-pre-line max-w-4xl mx-auto">
              {getSafeText(t, 'hero.title', 'Understand official letters.\nRespond with confidence.')}
            </h1>

            <p className="text-lg md:text-[18px] text-[#4b5563] max-w-2xl mx-auto leading-relaxed">
              {getSafeText(t, 'hero.subtitle', 'Lexora helps you understand official communications in your country, explains what is required in clear terms, and prepares the correct response based on local regulations.')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center justify-center gap-2 bg-[#d4af37] text-black hover:bg-[#b8941d] font-semibold px-8 py-4 rounded-lg text-base transition"
              >
                <Upload className="h-5 w-5" />
                {getSafeText(t, 'landing.cta.start', 'Start now')}
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center border-2 border-[#0f172a] text-[#0f172a] bg-transparent hover:bg-[#0f172a] hover:text-white font-semibold px-8 py-4 rounded-lg text-base transition"
              >
                {getSafeText(t, 'hero.cta_secondary', 'Login')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Counter */}
      <SocialProofCounter />

      {/* Demo Chat Section - same LexoraChat component as dashboard (demo mode) */}
      <section id="chat-demo" className="py-20 scroll-mt-20 bg-[#0f172a]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <LexoraChat mode="demo" />
        </div>
      </section>

      {/* How It Works */}
      <HowItWorksSection id="how-it-works" />

      {/* Supported Documents */}
      <SupportedDocumentsSection id="documents" />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing */}
      <PricingSection id="pricing" />

      {/* Trust & Security */}
      <TrustSecuritySection />

      {/* Archive Section - navy #0f172a, cards navy-medium #1e293b */}
      <section className="py-20 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-white mb-2">
              {getSafeText(t, 'archive.title', 'Your secure case archive')}
            </h2>
            <p className="text-[#d4af37] max-w-2xl mx-auto">
              {getSafeText(t, 'archive.subtitle', 'All your cases, documents and legal proceedings in one secure place.')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {archiveCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="border border-[#d4af37] rounded-xl p-6 text-center bg-[#0f172a]/50"
                >
                  <div className="h-16 w-16 rounded-full bg-[#1e293b] border border-[#d4af37] flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <h3 className="font-display font-semibold text-white text-lg mb-1">
                    {getSafeText(t, card.titleKey, card.titleKey)}
                  </h3>
                  <p className="text-sm text-[#9ca3af]">
                    {getSafeText(t, card.textKey, card.textKey)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center justify-center gap-2 bg-[#d4af37] text-black hover:bg-[#b8941d] font-semibold px-8 py-4 rounded-lg transition"
            >
              {getSafeText(t, 'archive.cta', 'Start now')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection id="faq" />
    </main>
  );
}
