import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { ChatMessage } from './ChatMessage';
import {
  canSendDemoMessage,
  incrementDemoUsage,
  getDemoUsageToday,
  DEMO_LIMIT,
} from '@/lib/demoLimit';
import { getDemoReply } from '@/lib/demoChat';
import {
  Scale,
  Mic,
  Send,
  Camera,
  Paperclip,
  Copy,
  Eye,
  Printer,
  Mail,
  Trash2,
} from 'lucide-react';

const DEMO_PREVIEW_KEY = 'lexora_demo_preview';

export function ChatDemo() {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const [draftText, setDraftText] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const scanInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const canSend = canSendDemoMessage();
  const used = getDemoUsageToday();
  const hasDocument = !!draftText;

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

  const { messages, loading, sendMessage, clearMessages } = useChat({ onSend });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || disabled) return;
    sendMessage(trimmed);
    setInputValue('');
  };

  const disabled = loading || !canSend;

  const handleScan = () => scanInputRef.current?.click();
  const handleUpload = () => uploadInputRef.current?.click();

  const handleScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendMessage(`[Scansione documento: ${file.name}]`);
    }
    e.target.value = '';
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendMessage(`[Upload file: ${file.name}]`);
    }
    e.target.value = '';
  };

  const handleClear = () => {
    clearMessages();
    setDraftText(null);
    try {
      sessionStorage.removeItem(DEMO_PREVIEW_KEY);
    } catch {
      /* ignore */
    }
  };

  const handleCopy = () => {
    if (!draftText) return;
    navigator.clipboard.writeText(draftText);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#0f172a] rounded-2xl border-2 border-[#d4af37] p-6 max-w-2xl mx-auto shadow-2xl">
        {/* Area messaggi */}
        <div className="bg-[#f5f5dc] rounded-lg h-96 mb-4 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d4af37] flex-shrink-0 flex items-center justify-center">
                <Scale className="h-5 w-5 text-[#0f172a]" />
              </div>
              <div className="bg-[#1e293b] text-white p-4 rounded-2xl rounded-tl-none max-w-[80%] border border-[rgba(212,175,55,0.2)]">
                <p>
                  Benvenuto! Sono Lexora, il tuo assistente legale AI. Descrivimi la tua situazione
                  (es. assenza scolastica, lettera al datore di lavoro) e ti aiuterò a redigere un
                  documento formale.
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
                <Scale className="h-5 w-5 text-[#0f172a]" />
              </div>
              <div className="bg-[#1e293b] text-white p-4 rounded-2xl rounded-tl-none max-w-[80%] border border-[rgba(212,175,55,0.2)]">
                <p className="animate-pulse">Riflettendo...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input field stilizzato */}
        <form onSubmit={handleSubmit} className="bg-[#f5f5dc] rounded-full border border-[#d4af37] flex items-center p-2 mb-4">
          <input
            ref={scanInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleScanFile}
            aria-hidden
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleUploadFile}
            aria-hidden
          />
          <button
            type="button"
            className="w-10 h-10 rounded-full border border-[#d4af37] flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0f172a] transition flex-shrink-0"
            aria-label="Microfono"
          >
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              !canSend
                ? `Limite raggiunto (${DEMO_LIMIT}/giorno). Registrati per continuare.`
                : 'Write here...'
            }
            disabled={disabled}
            className="flex-1 bg-transparent border-none outline-none px-4 text-[#1e293b] placeholder-[#999] min-w-0"
          />
          <button
            type="submit"
            disabled={disabled || !inputValue.trim()}
            className="w-10 h-10 rounded-full bg-[#94a3b8] flex items-center justify-center text-white hover:bg-[#d4af37] transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Invia"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Griglia pulsanti azione */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={handleScan}
            className="bg-[#1e293b] border border-[rgba(212,175,55,0.3)] text-[#d4af37] py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:border-[#d4af37] transition"
          >
            <Camera className="w-5 h-5" />
            Scan document
          </button>

          <button
            type="button"
            onClick={handleUpload}
            className="bg-[#1e293b] border border-[rgba(212,175,55,0.3)] text-[#d4af37] py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:border-[#d4af37] transition"
          >
            <Paperclip className="w-5 h-5" />
            Upload file
          </button>

          <button
            type="button"
            onClick={hasDocument ? handleCopy : undefined}
            disabled={!hasDocument}
            className="bg-[#1e293b] border border-[rgba(212,175,55,0.3)] py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ color: hasDocument ? '#d4af37' : '#64748b' }}
          >
            <Copy className="w-5 h-5" />
            Copy letter
          </button>

          <Link
            to={hasDocument ? '/letter-preview' : '#'}
            target={hasDocument ? '_blank' : undefined}
            rel={hasDocument ? 'noopener noreferrer' : undefined}
            className={`bg-[#1e293b] border border-[rgba(212,175,55,0.3)] py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              hasDocument ? 'text-[#d4af37] hover:border-[#d4af37]' : 'text-[#64748b] opacity-60 cursor-not-allowed pointer-events-none'
            }`}
          >
            <Eye className="w-5 h-5" />
            Preview
          </Link>

          <a
            href={hasDocument ? '/letter-preview' : '#'}
            target={hasDocument ? '_blank' : undefined}
            rel={hasDocument ? 'noopener noreferrer' : undefined}
            className={`bg-[#1e293b] border border-[rgba(212,175,55,0.3)] py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              hasDocument ? 'text-[#d4af37] hover:border-[#d4af37]' : 'text-[#64748b] opacity-60 cursor-not-allowed pointer-events-none'
            }`}
          >
            <Printer className="w-5 h-5" />
            Print
          </a>

          <a
            href={hasDocument ? `mailto:?body=${encodeURIComponent(draftText ?? '')}` : '#'}
            className={`bg-[#1e293b] border border-[rgba(212,175,55,0.3)] py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              hasDocument ? 'text-[#d4af37] hover:border-[#d4af37]' : 'text-[#64748b] opacity-60 cursor-not-allowed pointer-events-none'
            }`}
          >
            <Mail className="w-5 h-5" />
            Email
          </a>
        </div>

        {/* Pulsante Clear */}
        <button
          type="button"
          onClick={handleClear}
          className="w-full bg-gradient-to-b from-[#d4af37] to-[#b8941f] text-[#0f172a] font-semibold py-4 rounded-lg flex items-center justify-center gap-2 hover:from-[#f4d03f] hover:to-[#d4af37] transition shadow-lg border border-[#d4af37]"
        >
          <Trash2 className="w-5 h-5" />
          Clear conversation
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Messaggi oggi: {used}/{DEMO_LIMIT}
      </p>

      {/* Preview bozza - Salva nel Dashboard */}
      {draftText && (
        <div className="bg-[#1e293b] rounded-2xl p-6 space-y-4 border border-[rgba(212,175,55,0.3)] max-w-2xl mx-auto">
          <h3 className="flex items-center gap-2 font-semibold text-[#d4af37]">Anteprima bozza</h3>
          <pre className="whitespace-pre-wrap text-sm max-h-48 overflow-y-auto rounded-lg p-4 bg-[#0f172a] text-white">
            {draftText}
          </pre>
          <div className="flex flex-wrap gap-2">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-[#d4af37] text-[#0f172a] px-4 py-2 rounded-lg font-semibold hover:bg-[#f4d03f] transition"
              >
                Salva nel Dashboard
              </Link>
            ) : (
              <Link
                to="/auth?mode=signup&redirect=/dashboard"
                className="inline-flex items-center gap-2 bg-[#d4af37] text-[#0f172a] px-4 py-2 rounded-lg font-semibold hover:bg-[#f4d03f] transition"
              >
                Registrati per salvare nel Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
