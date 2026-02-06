import { Link } from 'react-router-dom';
import { ChatDemo } from '@/components/chat/ChatDemo';
import { Scale, Smartphone, Globe, Sparkles, Clock, ArrowUpRight } from 'lucide-react';

export function Home() {
  return (
    <main className="min-h-screen pt-16">
      {/* HERO - Sfondo chiaro */}
      <section className="bg-[#f5f5f0] pt-24 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 bg-[#1e293b] text-white px-4 py-2 rounded-full text-sm font-medium">
              <Globe className="w-4 h-4" />
              Works worldwide
            </span>
            <span className="inline-flex items-center gap-2 bg-[#1e293b] text-white px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI based on national laws
            </span>
            <span className="inline-flex items-center gap-2 bg-[#1e293b] text-white px-4 py-2 rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" />
              From letter to response in minutes
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#1e293b] mb-6 leading-tight">
            Understand official letters.<br />
            Respond with confidence.
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Lexora helps you understand official communications in your country,
            explains what is required in clear terms, and prepares the correct
            response based on local regulations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="#chat-demo"
              className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#c4a030] text-[#1e293b] font-semibold px-8 py-4 rounded-lg transition shadow-lg"
            >
              <ArrowUpRight className="w-5 h-5" />
              Start now
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center border-2 border-[#1e293b] text-[#1e293b] hover:bg-[#1e293b] hover:text-white font-semibold px-8 py-4 rounded-lg transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Sezione navy - Immagine bilancia + telefono */}
      <section className="bg-[#0f172a] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative mx-auto max-w-4xl">
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
