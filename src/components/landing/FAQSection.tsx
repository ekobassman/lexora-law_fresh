import { useState } from 'react';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { ChevronDown } from 'lucide-react';

function getSafeText(t: (key: string) => string, key: string, fallback: string): string {
  const result = t(key);
  if (!result || result === key || (result.includes('.') && !result.includes(' '))) return fallback;
  return result;
}

interface FAQSectionProps {
  id?: string;
}

export function FAQSection({ id }: FAQSectionProps) {
  const { t } = useLanguageContext();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
    question: getSafeText(t, `faq.q${i + 1}`, ''),
    answer: getSafeText(t, `faq.a${i + 1}`, ''),
  }));

  return (
    <section id={id} className="py-20 bg-[#f5f5f0]">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-transparent text-[#d4af37] border border-[#d4af37] mb-4">
            {getSafeText(t, 'faq.label', 'FAQ')}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-[#0f172a] mb-4">
            {getSafeText(t, 'faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="text-[#4b5563] max-w-2xl mx-auto">
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-[#d4af37]/40 rounded-xl px-6 bg-white shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between py-5 px-6 text-left text-[#0f172a] font-semibold hover:text-[#d4af37] transition-colors"
              >
                <span className="break-words pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-navy/60 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === index && (
                <div className="pb-5 px-6 text-[#4b5563] leading-relaxed break-words">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-[#4b5563]">
            {getSafeText(t, 'faq.contact_text', 'Still have questions?')}{' '}
            <a href="mailto:support@lexora.app" className="text-[#d4af37] hover:underline font-medium">
              {getSafeText(t, 'faq.contact', 'Contact us')}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
