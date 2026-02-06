import { Link } from 'react-router-dom';
import { ChatDemo } from '@/components/chat/ChatDemo';
import { Globe, Sparkles, Clock, Upload, Shield, FolderOpen, Calendar, ArrowRight } from 'lucide-react';

import heroDesktop from '@/assets/hero-desktop.png';
import heroMobile from '@/assets/hero-mobile.png';

const archiveCards = [
  { icon: Shield, title: 'Secure archive', text: 'Your cases are stored securely and organized.' },
  { icon: FolderOpen, title: 'Always accessible', text: 'Access your cases anytime – mobile or desktop.' },
  { icon: Sparkles, title: 'History & exports', text: 'Track drafts, exports and actions in one place.' },
  { icon: Calendar, title: 'Deadlines in view', text: 'Keep deadlines in sight so nothing is missed.' },
];

export function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - Premium Design from lexora-law-main */}
      <section className="relative overflow-hidden bg-navy">
        {/* Premium framed hero image - FULL WIDTH */}
        <div className="relative w-full">
          <div className="relative mx-0 md:mx-auto md:max-w-5xl lg:overflow-hidden">
            {/* Gold frame decoration */}
            <div className="absolute inset-0 border-4 border-gold/60 rounded-none md:rounded-xl md:m-4 lg:inset-4 lg:m-0 pointer-events-none z-10" />
            <div className="absolute inset-0 border-2 border-gold/30 rounded-none md:rounded-lg md:m-6 lg:inset-6 lg:m-0 pointer-events-none z-10" />
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-gold z-20 md:m-4 lg:top-4 lg:left-4 lg:m-0 md:rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-gold z-20 md:m-4 lg:top-4 lg:right-4 lg:m-0 md:rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-gold z-20 md:m-4 lg:bottom-4 lg:left-4 lg:m-0 md:rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-gold z-20 md:m-4 lg:bottom-4 lg:right-4 lg:m-0 md:rounded-br-xl" />
            <picture className="block lg:p-4">
              <source media="(min-width: 768px)" srcSet={heroDesktop} />
              <img
                src={heroMobile}
                alt="Lexora AI legal assistant"
                className="w-full h-auto object-cover md:rounded-lg md:m-4 md:w-[calc(100%-2rem)] lg:m-0 lg:w-full"
                style={{ maxHeight: '70vh' }}
              />
            </picture>
          </div>
        </div>
      </section>

      {/* Content Section - Ivory/cream background */}
      <section className="bg-ivory py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center space-y-6">
            {/* Badges - Navy on light */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-navy border border-navy/20 text-ivory px-3 py-1.5 rounded-md text-sm font-medium">
                <Globe className="h-3.5 w-3.5" />
                DE · AT · CH
              </span>
              <span className="inline-flex items-center gap-1.5 bg-navy border border-navy/20 text-ivory px-3 py-1.5 rounded-md text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                AI based on national laws
              </span>
              <span className="inline-flex items-center gap-1.5 bg-navy border border-navy/20 text-ivory px-3 py-1.5 rounded-md text-sm font-medium">
                <Clock className="h-3.5 w-3.5" />
                From letter to response in minutes
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight max-w-4xl mx-auto font-display">
              Understand official letters.<br />Respond with confidence.
            </h1>

            <p className="text-lg md:text-xl text-navy/70 max-w-2xl mx-auto leading-relaxed">
              Lexora helps you understand official communications in your country,
              explains what is required in clear terms, and prepares the correct
              response based on local regulations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link
                to="#chat-demo"
                className="inline-flex items-center justify-center gap-2 bg-gold text-navy hover:bg-gold/90 font-semibold px-8 py-6 rounded-lg text-base shadow-premium transition"
              >
                <Upload className="h-5 w-5" />
                Start now
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center border-2 border-navy text-navy hover:bg-navy hover:text-ivory font-semibold px-8 py-6 rounded-lg text-base transition"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CHAT DEMO SECTION */}
      <section id="chat-demo" className="bg-[#1e293b] py-10 md:py-16 px-3 sm:px-4 scroll-mt-20 min-h-[85vh] flex flex-col justify-center overflow-x-hidden pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto w-full min-w-0">
          <ChatDemo />
        </div>
      </section>

      {/* Archive Section - Premium Navy/Gold from lexora-law-main */}
      <section className="py-12 md:py-16 bg-navy">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-ivory mb-2">
              Your secure case archive
            </h2>
            <p className="text-gold/80 max-w-2xl mx-auto">
              All your cases, documents and legal proceedings in one secure place.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {archiveCards.map((card, i) => {
              const Icon = card.icon;
              return (
              <div
                key={i}
                className="bg-navy/50 border-2 border-gold/30 rounded-xl p-4 md:p-6 text-center hover:border-gold/60 transition-all hover:shadow-[0_0_20px_rgba(201,162,77,0.2)]"
              >
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold/40 flex items-center justify-center mx-auto mb-4 shadow-[inset_0_2px_4px_rgba(201,162,77,0.3)]">
                  <Icon className="h-7 w-7 md:h-8 md:w-8 text-gold" />
                </div>
                <h3 className="font-semibold text-ivory text-sm md:text-base mb-1">{card.title}</h3>
                <p className="text-xs md:text-sm text-ivory/60">{card.text}</p>
              </div>
            );
            })}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center justify-center gap-2 bg-gold text-navy hover:bg-gold/90 font-semibold px-8 py-4 rounded-lg shadow-premium transition"
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
