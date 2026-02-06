import { Shield, Lock, Server, Eye, ShieldCheck, Globe } from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';

function getSafeText(t: (key: string) => string, key: string, fallback: string): string {
  const result = t(key);
  if (!result || result === key || (result.includes('.') && !result.includes(' '))) return fallback;
  return result;
}

interface TrustSecuritySectionProps {
  id?: string;
}

const COUNTRIES = [
  { code: 'us', flag: '🇺🇸' },
  { code: 'de', flag: '🇩🇪' },
  { code: 'at', flag: '🇦🇹' },
  { code: 'ch', flag: '🇨🇭' },
  { code: 'it', flag: '🇮🇹' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'gb', flag: '🇬🇧' },
  { code: 'ua', flag: '🇺🇦' },
  { code: 'tr', flag: '🇹🇷' },
  { code: 'latam', flag: '🌎' },
];

export function TrustSecuritySection({ id }: TrustSecuritySectionProps) {
  const { t } = useLanguageContext();

  const securityFeatures = [0, 1, 2, 3].map((i) => ({
    icon: [Shield, Lock, Server, Eye][i] as typeof Shield,
    title: getSafeText(t, [`security.gdpr`, 'security.ssl', 'security.server', 'security.sharing'][i], ''),
    description: getSafeText(t, [`security.gdpr_desc`, 'security.ssl_desc', 'security.server_desc', 'security.sharing_desc'][i], ''),
  }));

  const countries = COUNTRIES.map((c) => ({
    ...c,
    name: getSafeText(t, `countries.${c.code}`, c.code.toUpperCase()),
  }));

  return (
    <section id={id} className="py-20 bg-[#0f172a]">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-transparent text-[#d4af37] border border-[#d4af37] mb-4">
            {getSafeText(t, 'security.label', 'Security & Trust')}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-white mb-4">
            {getSafeText(t, 'security.title', 'Your data is safe with us')}
          </h2>
          <p className="text-[#9ca3af] max-w-2xl mx-auto">
            {getSafeText(t, 'security.subtitle', 'Security and privacy are our top priorities.')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-xl border border-[#d4af37]/30 bg-[#1e293b]/60 hover:border-[#d4af37]/50 transition-all overflow-hidden min-h-0"
              >
                <div className="h-16 w-16 rounded-full bg-[#1e293b] border border-[#d4af37] flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-[#d4af37] shrink-0" strokeWidth={2} />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2 line-clamp-2 break-words">{feature.title}</h3>
                <p className="text-sm text-[#9ca3af] line-clamp-3 break-words">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1e293b] border border-[#d4af37]/40 min-h-[2.75rem]">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#d4af37]" strokeWidth={2} />
            <span className="text-sm font-medium text-white">ISO 27001</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1e293b] border border-[#d4af37]/40 min-h-[2.75rem]">
            <Shield className="h-5 w-5 shrink-0 text-[#d4af37]" strokeWidth={2} />
            <span className="text-sm font-medium text-white">{getSafeText(t, 'security.cert_gdpr', 'GDPR')}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1e293b] border border-[#d4af37]/40 min-h-[2.75rem]">
            <Lock className="h-5 w-5 shrink-0 text-[#d4af37]" strokeWidth={2} />
            <span className="text-sm font-medium text-white">SOC 2 Type II</span>
          </div>
        </div>

        <div className="border-t border-[#d4af37]/20 pt-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-[#d4af37]" />
              <span className="text-white font-medium">{getSafeText(t, 'countries.label', 'Supported Countries')}</span>
            </div>
            <p className="text-sm text-[#9ca3af] max-w-xl mx-auto">
              {getSafeText(t, 'countries.title', 'Specially adapted to legal requirements in 11 countries worldwide:')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto justify-items-stretch">
            {countries.map((country) => (
              <div
                key={country.code}
                className="flex items-center justify-center gap-3 p-4 min-h-[80px] rounded-lg bg-[#1e293b] border border-[#d4af37]/40 hover:border-[#d4af37] transition-all overflow-hidden min-w-0"
              >
                <span className="text-2xl md:text-3xl shrink-0">{country.flag}</span>
                <span className="font-medium text-white text-center text-sm md:text-base line-clamp-2 break-words leading-tight min-w-0 flex-1">
                  {country.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
