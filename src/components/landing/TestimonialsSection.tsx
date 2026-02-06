import { Card, CardContent } from '@/components/ui/Card';
import { Star, Quote } from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';

function getSafeText(t: (key: string) => string, key: string, fallback: string): string {
  const result = t(key);
  if (!result || result === key || (result.includes('.') && !result.includes(' '))) return fallback;
  return result;
}

interface TestimonialsSectionProps {
  id?: string;
}

export function TestimonialsSection({ id }: TestimonialsSectionProps) {
  const { t } = useLanguageContext();

  const testimonials = [0, 1, 2, 3].map((i) => ({
    name: getSafeText(t, `landingSections.testimonials.users.${i}.name`, ''),
    location: getSafeText(t, `landingSections.testimonials.users.${i}.location`, ''),
    rating: i === 3 ? 4 : 5,
    text: getSafeText(t, `landingSections.testimonials.users.${i}.text`, ''),
    useCase: getSafeText(t, `landingSections.testimonials.users.${i}.useCase`, ''),
    avatar: ['TM', 'MK', 'SB', 'AL'][i],
  }));

  return (
    <section id={id} className="py-20 bg-[#0f172a]">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-transparent text-[#d4af37] border border-[#d4af37] mb-4">
            {getSafeText(t, 'landingSections.testimonials.badge', 'Testimonials')}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-white mb-4">
            {getSafeText(t, 'landingSections.testimonials.title', 'What our users say')}
          </h2>
          <p className="text-[#9ca3af] max-w-2xl mx-auto">
            {getSafeText(t, 'landingSections.testimonials.subtitle', 'Thousands of people trust Lexora.')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-[#1e293b] border border-[#d4af37] hover:border-[#d4af37]/60 transition-all"
            >
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-[#d4af37] mb-4" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-[#d4af37]/30'}`}
                    />
                  ))}
                </div>
                <p className="text-white/90 mb-6 leading-relaxed text-base">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#d4af37]/30 border border-[#d4af37] flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-[#9ca3af]">{testimonial.location}</p>
                  </div>
                  <span className="ml-auto inline-flex items-center px-3 py-1 rounded-full border border-[#d4af37] text-[#d4af37] text-xs">
                    {testimonial.useCase}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12 pt-8 border-t border-[#d4af37]/20">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-[#d4af37]">
              {getSafeText(t, 'landingSections.testimonials.stats.satisfaction.value', '98%')}
            </p>
            <p className="text-sm text-[#9ca3af]">{getSafeText(t, 'landingSections.testimonials.stats.satisfaction.label', 'Satisfaction rate')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-[#d4af37]">
              {getSafeText(t, 'landingSections.testimonials.stats.rating.value', '4.8/5')}
            </p>
            <p className="text-sm text-[#9ca3af]">{getSafeText(t, 'landingSections.testimonials.stats.rating.label', 'Average rating')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-[#d4af37]">
              {getSafeText(t, 'landingSections.testimonials.stats.documents.value', '2,500+')}
            </p>
            <p className="text-sm text-[#9ca3af]">{getSafeText(t, 'landingSections.testimonials.stats.documents.label', 'Documents analyzed')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
