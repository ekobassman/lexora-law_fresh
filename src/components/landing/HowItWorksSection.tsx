import { Upload, Brain, FileCheck, Send, ArrowRight } from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';

function getSafeText(t: (key: string) => string, key: string, fallback: string): string {
  const result = t(key);
  if (!result || result === key || (result.includes('.') && !result.includes(' '))) return fallback;
  return result;
}

interface HowItWorksSectionProps {
  id?: string;
}

export function HowItWorksSection({ id }: HowItWorksSectionProps) {
  const { t } = useLanguageContext();

  const steps = [
    { icon: Upload, number: '01', color: 'from-blue-500 to-blue-600' },
    { icon: Brain, number: '02', color: 'from-purple-500 to-purple-600' },
    { icon: FileCheck, number: '03', color: 'from-gold to-amber-500' },
    { icon: Send, number: '04', color: 'from-green-500 to-green-600' },
  ].map((s, i) => ({
    ...s,
    title: getSafeText(t, `how_it_works.step${i + 1}_title`, ['Upload', 'AI Analysis', 'Review & Adjust', 'Send'][i]),
    description: getSafeText(t, `how_it_works.step${i + 1}_desc`, ''),
  }));

  return (
    <section id={id} className="py-20 bg-[#0f172a] overflow-hidden">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-transparent text-[#d4af37] border border-[#d4af37] mb-4">
            {getSafeText(t, 'how_it_works.label', 'How It Works')}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-white mb-4">
            {getSafeText(t, 'how_it_works.title', 'Your response in 4 easy steps')}
          </h2>
          <p className="text-[#9ca3af] max-w-2xl mx-auto">
            {getSafeText(t, 'how_it_works.subtitle', 'From official letter to professional response.')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 md:gap-4 relative">
            <div className="hidden md:block absolute top-20 left-[12.5%] right-[12.5%] h-px bg-[#d4af37]/40" />
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex flex-col items-center text-center overflow-hidden min-w-0">
                  <div className="absolute -top-2 -right-2 md:relative md:top-0 md:right-0 z-10">
                    <span className="text-xs font-bold text-gold/60 md:hidden">{step.number}</span>
                  </div>
                  <div className={`relative h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 z-10`}>
                    <Icon className="h-8 w-8 text-white" />
                    <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-[#0f172a] border-2 border-[#d4af37] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#d4af37]">{step.number}</span>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="md:hidden my-2">
                      <ArrowRight className="h-5 w-5 text-gold/40 rotate-90" />
                    </div>
                  )}
                  <h3 className="text-lg font-display font-semibold text-white mb-2 line-clamp-2 break-words">{step.title}</h3>
                  <p className="text-sm text-[#9ca3af] leading-relaxed line-clamp-3 break-words">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12 pt-8 border-t border-[#d4af37]/20">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-transparent border border-[#d4af37]/50">
            <span className="text-[#d4af37] font-semibold">{getSafeText(t, 'how_it_works.time_badge', '⏱️ Average time: 5-10 minutes')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
