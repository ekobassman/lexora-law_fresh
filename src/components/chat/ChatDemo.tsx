import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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

const SAMPLE_LETTER = `[Nome mittente]
[Indirizzo]
[Data]

[Destinatario]
[Indirizzo]

Oggetto: Lettera generata da Lexora

Egregi Signori,

La presente per comunicarVi quanto richiesto.

Cordiali saluti,
[Firma]`;

export function ChatDemo() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{ type: 'ai' | 'user'; text: string }>>([
    {
      type: 'ai',
      text: 'Benvenuto! Sono Lexora, il tuo assistente legale AI. Descrivimi la tua situazione (es. assenza scolastica, lettera al datore di lavoro) e ti aiuterò a redigere un documento formale.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [draftText, setDraftText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasDocument = !!draftText;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const saveToPreview = (text: string) => {
    setDraftText(text);
    try {
      sessionStorage.setItem(
        DEMO_PREVIEW_KEY,
        JSON.stringify({ text, createdAt: new Date().toISOString() })
      );
    } catch {
      /* ignore */
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    setMessages((prev) => [...prev, { type: 'user', text: inputText }]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      const reply =
        inputText.toLowerCase().includes('conferma') || inputText.toLowerCase().includes('sì') || inputText.toLowerCase().includes('ok')
          ? `Ecco la bozza del documento:\n\n${SAMPLE_LETTER}\n\nRegistrati per salvarla nel Dashboard.`
          : 'Ho capito la tua richiesta. Per procedere con la redazione del documento, ho bisogno di alcune informazioni specifiche. Potresti indicarmi: 1) Il tuo nome completo, 2) Il destinatario, 3) La data di riferimento? Per generare la bozza rispondi con "Conferma" o "Ok".';

      const hasDraft = reply.includes('Ecco la bozza');
      if (hasDraft) saveToPreview(SAMPLE_LETTER);

      setMessages((prev) => [...prev, { type: 'ai', text: reply }]);
      setIsLoading(false);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessages((prev) => [...prev, { type: 'user', text: `📎 Ho caricato: ${file.name}` }]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: 'ai', text: 'Ho ricevuto il documento. Ecco la bozza estratta:' },
        ]);
        saveToPreview(SAMPLE_LETTER);
      }, 800);
    }
    e.target.value = '';
  };

  const handleCamera = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessages((prev) => [...prev, { type: 'user', text: '📸 Documento scannerizzato' }]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: 'ai', text: 'Sto elaborando l\'immagine. Ecco la bozza estratta:' },
        ]);
        saveToPreview(SAMPLE_LETTER);
      }, 800);
    }
    e.target.value = '';
  };

  const handleClear = () => {
    setMessages([
      {
        type: 'ai',
        text: 'Benvenuto! Sono Lexora, il tuo assistente legale AI. Descrivimi la tua situazione (es. assenza scolastica, lettera al datore di lavoro) e ti aiuterò a redigere un documento formale.',
      },
    ]);
    setDraftText(null);
    setInputText('');
    try {
      sessionStorage.removeItem(DEMO_PREVIEW_KEY);
    } catch {
      /* ignore */
    }
  };

  const handleCopy = () => {
    if (draftText) {
      navigator.clipboard.writeText(draftText);
      alert('Lettera copiata negli appunti!');
    }
  };

  const handlePreview = () => {
    if (hasDocument) window.open('/letter-preview', '_blank');
  };

  const handlePrint = () => {
    if (hasDocument) window.open('/letter-preview', '_blank');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#0f172a] rounded-2xl border-2 border-[#d4af37] p-6 max-w-2xl mx-auto shadow-[0_0_40px_rgba(212,175,55,0.15)]">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
        />
        <input
          type="file"
          ref={cameraInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleCamera}
        />

        {/* Area messaggi */}
        <div className="bg-[#f5f5dc] rounded-lg h-80 mb-4 overflow-y-auto p-4 space-y-4 border border-[#d4af37]/30">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center mr-2 flex-shrink-0">
                  <Scale className="w-5 h-5 text-[#0f172a]" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.type === 'user'
                    ? 'bg-[#d4af37] text-[#0f172a] rounded-tr-none font-medium'
                    : 'bg-[#e8e4d5] text-[#1e293b] rounded-tl-none border border-[#d4af37]/20'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center mr-2">
                <Scale className="w-5 h-5 text-[#0f172a]" />
              </div>
              <div className="bg-[#e8e4d5] p-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce [animation-delay:100ms]" />
                  <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce [animation-delay:200ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input field */}
        <div className="bg-[#f5f5dc] rounded-full border-2 border-[#d4af37] flex items-center p-2 mb-4 shadow-inner">
          <button
            type="button"
            className="w-10 h-10 rounded-full border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0f172a] transition flex-shrink-0"
            onClick={() => alert('Funzione microfono in arrivo...')}
          >
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
            placeholder="Write here..."
            className="flex-1 bg-transparent border-none outline-none px-4 text-[#1e293b] placeholder-[#999] text-base min-w-0"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 ${
              inputText.trim()
                ? 'bg-[#d4af37] text-[#0f172a] hover:bg-[#f4d03f]'
                : 'bg-[#94a3b8] text-white cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Griglia pulsanti */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:border-[#d4af37] hover:bg-[#1e293b]/80 transition"
          >
            <Camera className="w-5 h-5" />
            Scan document
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:border-[#d4af37] hover:bg-[#1e293b]/80 transition"
          >
            <Paperclip className="w-5 h-5" />
            Upload file
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!hasDocument}
            className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              hasDocument
                ? 'bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] hover:border-[#d4af37]'
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed'
            }`}
          >
            <Copy className="w-5 h-5" />
            Copy letter
          </button>

          <button
            type="button"
            onClick={handlePreview}
            disabled={!hasDocument}
            className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              hasDocument
                ? 'bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] hover:border-[#d4af37]'
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed'
            }`}
          >
            <Eye className="w-5 h-5" />
            Preview
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!hasDocument}
            className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              hasDocument
                ? 'bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] hover:border-[#d4af37]'
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed'
            }`}
          >
            <Printer className="w-5 h-5" />
            Print
          </button>

          {hasDocument ? (
            <a
              href={`mailto:?body=${encodeURIComponent(draftText ?? '')}`}
              className="py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] hover:border-[#d4af37]"
            >
              <Mail className="w-5 h-5" />
              Email
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="py-3 px-4 rounded-lg flex items-center justify-center gap-2 bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed"
            >
              <Mail className="w-5 h-5" />
              Email
            </button>
          )}
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

      {/* Salva nel Dashboard */}
      {hasDocument && (
        <div className="max-w-2xl mx-auto flex justify-center">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-[#d4af37] text-[#0f172a] px-6 py-3 rounded-lg font-semibold hover:bg-[#f4d03f] transition"
            >
              Salva nel Dashboard
            </Link>
          ) : (
            <Link
              to="/auth?mode=signup&redirect=/dashboard"
              className="inline-flex items-center gap-2 bg-[#d4af37] text-[#0f172a] px-6 py-3 rounded-lg font-semibold hover:bg-[#f4d03f] transition"
            >
              Registrati per salvare nel Dashboard
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
