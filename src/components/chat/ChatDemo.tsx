import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import {
  canSendDemoMessage,
  incrementDemoUsage,
  getDemoUsageToday,
  DEMO_LIMIT,
} from '@/lib/demoLimit';
import { getDemoReply } from '@/lib/demoChat';
import { Scale, Save, FileText } from 'lucide-react';

const DEMO_PREVIEW_KEY = 'lexora_demo_preview';

export function ChatDemo() {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const [draftText, setDraftText] = useState<string | null>(null);
  const canSend = canSendDemoMessage();
  const used = getDemoUsageToday();

  const onSend = useCallback(
    async (content: string): Promise<string> => {
      if (!canSendDemoMessage())
        return 'Limite giornaliero raggiunto (20 messaggi). Registrati per continuare.';

      incrementDemoUsage();
      const msgCount = getDemoUsageToday();
      const prevUserMessages = msgCount - 1;

      const result = getDemoReply(content, prevUserMessages, language);
      if (result.draftText) {
        setDraftText(result.draftText);
        try {
          sessionStorage.setItem(
            DEMO_PREVIEW_KEY,
            JSON.stringify({ text: result.draftText, createdAt: new Date().toISOString() })
          );
        } catch {
          /* ignore */
        }
      }
      return result.text;
    },
    [language]
  );

  const { messages, loading, sendMessage } = useChat({ onSend });

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#0f172a] rounded-2xl border border-[rgba(212,175,55,0.3)] overflow-hidden shadow-2xl shadow-[rgba(212,175,55,0.1)]">
        {/* Header Chat */}
        <div className="bg-[#0f172a] border-b border-[rgba(212,175,55,0.2)] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center">
            <Scale className="w-6 h-6 text-[#0f172a]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Lexora Assistant</h3>
            <p className="text-xs text-slate-400">Online</p>
          </div>
        </div>

        {/* Messaggi */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-[#0f172a]">
          {messages.length === 0 && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d4af37] flex-shrink-0 flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#0f172a]" />
              </div>
              <div className="bg-[#1e293b] text-white p-4 rounded-2xl rounded-tl-none max-w-[80%] border border-[rgba(212,175,55,0.2)]">
                <p>
                  Benvenuto! Sono Lexora, il tuo assistente legale AI. Descrivimi la tua situazione (es.
                  assenza scolastica, lettera al datore di lavoro) e ti aiuterò a redigere un documento
                  formale.
                </p>
              </div>
            </div>
          )}
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d4af37] flex-shrink-0 flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#0f172a]" />
              </div>
              <div className="bg-[#1e293b] text-white p-4 rounded-2xl rounded-tl-none max-w-[80%] border border-[rgba(212,175,55,0.2)]">
                <p className="animate-pulse">Riflettendo...</p>
              </div>
            </div>
          )}
        </div>

        <ChatInput
          onSend={sendMessage}
          disabled={loading || !canSend}
          placeholder={
            !canSend
              ? `Limite raggiunto (${DEMO_LIMIT}/giorno). Registrati per continuare.`
              : 'Descrivi la tua situazione...'
          }
        />
      </div>

      <p className="text-xs text-slate-400 text-center">
        Messaggi oggi: {used}/{DEMO_LIMIT}
      </p>

      {/* Preview bozza */}
      {draftText && (
        <div
          className="rounded-2xl p-6 space-y-4 border border-[rgba(212,175,55,0.2)]"
          style={{ backgroundColor: '#1e293b' }}
        >
          <h3 className="flex items-center gap-2 font-semibold text-[#d4af37]">
            <FileText className="h-5 w-5" />
            Anteprima bozza
          </h3>
          <pre className="whitespace-pre-wrap text-sm max-h-48 overflow-y-auto rounded-lg p-4 bg-[#0f172a] text-white">
            {draftText}
          </pre>
          <div className="flex flex-wrap gap-2">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-[#d4af37] text-[#0f172a] px-4 py-2 rounded-lg font-semibold hover:bg-[#f4d03f] transition"
              >
                <Save className="h-4 w-4" />
                Salva nel Dashboard
              </Link>
            ) : (
              <Link
                to="/auth?mode=signup&redirect=/dashboard"
                className="inline-flex items-center gap-2 bg-[#d4af37] text-[#0f172a] px-4 py-2 rounded-lg font-semibold hover:bg-[#f4d03f] transition"
              >
                <Save className="h-4 w-4" />
                Registrati per salvare nel Dashboard
              </Link>
            )}
            <Link
              to="/letter-preview"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[rgba(212,175,55,0.5)] text-[#d4af37] px-4 py-2 rounded-lg font-medium hover:border-[#d4af37] transition"
            >
              Apri anteprima completa
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
