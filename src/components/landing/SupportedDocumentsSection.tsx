import {
  Receipt,
  Scale,
  Plane,
  ShieldCheck,
  Home,
  Briefcase,
  FileWarning,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';

function getSafeText(t: (key: string) => string, key: string, fallback: string): string {
  const result = t(key);
  if (!result || result === key || (result.includes('.') && !result.includes(' '))) return fallback;
  return result;
}

interface SupportedDocumentsSectionProps {
  id?: string;
}

const DOC_TYPES = [
  { icon: Receipt, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { icon: Scale, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { icon: Plane, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
  { icon: ShieldCheck, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { icon: Home, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { icon: Briefcase, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { icon: FileWarning, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { icon: CreditCard, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  { icon: Building2, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
];

export function SupportedDocumentsSection({ id }: SupportedDocumentsSectionProps) {
  const { t } = useLanguageContext();

  const documentTypes = DOC_TYPES.map((d, i) => ({
    ...d,
    title: getSafeText(t, `landingSections.documents.types.${i}.title`, ''),
    description: getSafeText(t, `landingSections.documents.types.${i}.description`, ''),
  }));

  return (
    <section id={id} className="py-20 bg-[#f5f5f0]">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-transparent text-[#d4af37] border border-[#d4af37] mb-4">
            {getSafeText(t, 'landingSections.documents.badge', 'Supported Documents')}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-[#0f172a] mb-4">
            {getSafeText(t, 'landingSections.documents.title', 'Which documents can Lexora analyze?')}
          </h2>
          <p className="text-[#4b5563] max-w-2xl mx-auto">
            {getSafeText(t, 'landingSections.documents.subtitle', 'Lexora understands a variety of official letters.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
          {documentTypes.map((doc, index) => {
            const Icon = doc.icon;
            return (
              <div
                key={index}
                className="group flex flex-col h-full min-h-[140px] overflow-hidden p-6 rounded-2xl border border-[#d4af37]/40 bg-white shadow-sm hover:border-[#d4af37] hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 shrink-0 rounded-xl ${doc.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 md:w-7 md:h-7 shrink-0 ${doc.color}`} />
                </div>
                <h3 className="font-semibold text-[#0f172a] mb-1.5 group-hover:text-[#d4af37] transition-colors text-base md:text-lg line-clamp-2 break-words">
                  {doc.title}
                </h3>
                <p className="text-sm text-[#4b5563] leading-snug line-clamp-3 break-words hyphens-auto flex-1 min-h-0">
                  {doc.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 pt-8 border-t border-[#d4af37]/30">
          <p className="text-sm text-[#4b5563] mb-3">{getSafeText(t, 'landingSections.documents.formatsTitle', 'Supported file formats:')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['PDF', 'JPG', 'PNG', 'WEBP', 'HEIC'].map((format) => (
              <span key={format} className="inline-flex items-center px-3 py-1 rounded-full border border-[#d4af37]/50 text-[#4b5563] text-sm">
                {format}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
