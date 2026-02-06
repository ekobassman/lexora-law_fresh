import { useEffect, useState, useRef } from 'react';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

const BASE_COUNT = 8746;
const ANIMATION_DURATION = 2000;

const translations: Record<string, { title: string; subtitle: string }> = {
  en: { title: 'Over {count} documents successfully analyzed', subtitle: 'We help citizens and professionals understand bureaucracy every day.' },
  de: { title: 'Über {count} Dokumente erfolgreich analysiert', subtitle: 'Wir helfen Bürgern und Fachleuten jeden Tag, die Bürokratie zu verstehen.' },
  it: { title: 'Oltre {count} documenti analizzati con successo', subtitle: 'Aiutiamo cittadini e professionisti a comprendere la burocrazia ogni giorno.' },
  fr: { title: 'Plus de {count} documents analysés avec succès', subtitle: 'Nous aidons les citoyens et les professionnels à comprendre la bureaucratie chaque jour.' },
  es: { title: 'Más de {count} documentos analizados con éxito', subtitle: 'Ayudamos a ciudadanos y profesionales a entender la burocracia cada día.' },
};

function formatNumber(num: number, lang: string): string {
  const localeMap: Record<string, string> = {
    it: 'it-IT', de: 'de-DE', en: 'en-US', fr: 'fr-FR', es: 'es-ES',
  };
  return num.toLocaleString(localeMap[lang] || 'en-US');
}

export function SocialProofCounter() {
  const { language } = useLanguageContext();
  const lang = language.slice(0, 2).toLowerCase();
  const [dbCount, setDbCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasAnimated = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const totalCount = dbCount + BASE_COUNT;
  const text = translations[lang] || translations.en;

  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      try {
        const { data, error } = await supabase
          .from('global_stats')
          .select('documents_processed')
          .eq('id', 'main')
          .maybeSingle();
        if (!cancelled && !error && data != null) {
          setDbCount(Number(data.documents_processed) || 0);
        }
      } catch {
        if (!cancelled) setDbCount(0);
      }
    }
    fetchCount();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (hasAnimated.current) {
      setDisplayCount(totalCount);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current && totalCount > 0) {
            hasAnimated.current = true;
            setIsAnimating(true);
            const startTime = Date.now();
            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(easeOut * totalCount);
              setDisplayCount(current);
              if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
              } else {
                setDisplayCount(totalCount);
                setIsAnimating(false);
              }
            };
            animationRef.current = requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [totalCount]);

  useEffect(() => {
    if (hasAnimated.current && !isAnimating) setDisplayCount(totalCount);
  }, [totalCount, isAnimating]);

  const formattedCount = formatNumber(displayCount, lang);
  const titleText = text.title.replace('{count}', formattedCount);

  return (
    <section ref={sectionRef} className="w-full py-20 bg-[#0f172a]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">{titleText}</h2>
        <p className="text-base md:text-lg max-w-2xl mx-auto opacity-90 text-white">{text.subtitle}</p>
      </div>
    </section>
  );
}
