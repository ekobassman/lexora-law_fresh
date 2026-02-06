import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Button } from '@/components/ui/Button';
import {
  canSendDemoMessage,
  incrementDemoUsage,
  getDemoUsageToday,
  DEMO_LIMIT,
} from '@/lib/demoLimit';
import { getDemoReply } from '@/lib/demoChat';
import { Save, FileText } from 'lucide-react';

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

      const msgCount = getDemoUsageToday(); // già incrementato
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col h-[500px] rounded-xl border border-navy-light bg-card">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Descrivi la tua situazione legale per iniziare.
            </p>
          )}
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20">
                <span className="animate-pulse">...</span>
              </div>
              <div className="rounded-xl bg-muted px-4 py-3 text-sm">Riflettendo...</div>
            </div>
          )}
        </div>
        <ChatInput
          onSend={sendMessage}
          disabled={loading || !canSend}
          placeholder={
            !canSend
              ? `Limite raggiunto (${DEMO_LIMIT}/giorno). Registrati per continuare.`
              : 'Scrivi il tuo messaggio...'
          }
        />
      </div>

      {/* Contatore messaggi */}
      <p className="text-xs text-muted-foreground text-center">
        Messaggi oggi: {used}/{DEMO_LIMIT}
      </p>

      {/* Preview bozza + Salva nel Dashboard */}
      {draftText && (
        <div className="rounded-xl border border-navy-light bg-navy/50 p-4 space-y-4">
          <h3 className="flex items-center gap-2 font-semibold text-gold">
            <FileText className="h-5 w-5" />
            Anteprima bozza
          </h3>
          <pre className="whitespace-pre-wrap text-sm max-h-48 overflow-y-auto rounded bg-navy p-3">
            {draftText}
          </pre>
          <div className="flex flex-wrap gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Salva nel Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth?mode=signup&redirect=/dashboard">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Registrati per salvare nel Dashboard
                </Button>
              </Link>
            )}
            <Link to="/letter-preview" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Apri anteprima completa</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
