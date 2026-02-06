import { Link } from 'react-router-dom';
import { ChatDemo } from '@/components/chat/ChatDemo';
import { Scale, Smartphone } from 'lucide-react';

export function Home() {
  return (
    <main className="min-h-screen pt-16">
      {/* HERO SECTION */}
      <section className="bg-[#0f172a] pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative mx-auto max-w-4xl mb-12">
            <div className="absolute inset-0 bg-[#d4af37] rounded-2xl transform translate-x-2 translate-y-2 opacity-20" />
            <div className="relative border-4 border-[#d4af37] rounded-2xl overflow-hidden shadow-2xl shadow-[rgba(212,175,55,0.2)]">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center p-12">
                  <Scale className="w-32 h-32 text-[#d4af37] mx-auto mb-6" />
                  <Smartphone className="w-24 h-24 text-white mx-auto" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-serif text-white mb-6 leading-tight">
              Il tuo assistente legale <span className="text-[#d4af37]">AI</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 font-light">
              Genera documenti legali professionali in pochi minuti, supportato in 11 paesi
            </p>
            <Link
              to="#chat-demo"
              className="inline-block bg-[#d4af37] text-[#0f172a] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#f4d03f] transition shadow-lg shadow-[rgba(212,175,55,0.3)]"
            >
              Inizia Ora
            </Link>
          </div>
        </div>
      </section>

      {/* CHAT DEMO SECTION */}
      <section id="chat-demo" className="bg-[#1e293b] py-20 px-4 scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <ChatDemo />
        </div>
      </section>
    </main>
  );
}
