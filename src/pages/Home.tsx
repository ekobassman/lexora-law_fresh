import { ChatDemo } from '@/components/chat/ChatDemo';
import { useLanguageContext } from '@/contexts/LanguageContext';

export function Home() {
  const { t } = useLanguageContext();

  return (
    <main className="min-h-screen">
      <section className="container py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">{t('home.title')}</h1>
          <p className="text-muted-foreground">{t('home.subtitle')}</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <ChatDemo />
        </div>
      </section>
    </main>
  );
}
