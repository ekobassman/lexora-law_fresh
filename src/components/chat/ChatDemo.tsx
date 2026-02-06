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
  Loader2,
} from 'lucide-react';

const DEMO_PREVIEW_KEY = 'lexora_demo_preview';

export function ChatDemo() {
  const { user } = useAuth();
  const [chatStep, setChatStep] = useState<'welcome' | 'collecting' | 'confirming' | 'generating' | 'generated'>('welcome');
  const [collectingField, setCollectingField] = useState<'sender' | 'recipient' | 'subject' | 'content' | null>(null);
  const [hasDocument, setHasDocument] = useState(false);
  const [documentData, setDocumentData] = useState({
    type: '',
    sender: '',
    recipient: '',
    date: '',
    subject: '',
    content: '',
  });
  const [, setOcrResult] = useState<Record<string, string> | null>(null);
  const [messages, setMessages] = useState<Array<{
    type: 'ai' | 'user';
    text: string;
    image?: string;
    documentReady?: string;
    ocrData?: { documentType: string; sender: string; recipient: string; date: string; subject: string };
    ocrDraft?: string;
  }>>([
    {
      type: 'ai',
      text: 'Ciao! Sono Lexora, il tuo assistente legale AI.\n\nPosso aiutarti a creare:\n• Lettere formali al datore di lavoro\n• Lettere al proprietario di casa\n• Lettere alle autorità scolastiche\n• Reclami e richieste ufficiali\n\nChe tipo di documento ti serve? Descrivimi la tua situazione.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [draftText, setDraftText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, chatStep]);

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

  const buildDraftFromData = (data: typeof documentData) => {
    const today = new Date().toISOString().slice(0, 10);
    return `${data.sender || '[Mittente]'}
[Indirizzo]
${data.date || today}

${data.recipient || '[Destinatario]'}
[Indirizzo]

Oggetto: ${data.subject || '[Oggetto]'}

Egregi Signori,

${data.content || 'La presente per comunicarVi quanto richiesto.'}

Cordiali saluti,
[Firma]`;
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { type: 'user', text }]);
    const userText = text.toLowerCase();
    setInputText('');
    setIsLoading(true);

    const isConfirm = ['sì', 'si', 'confermo', 'conferma', 'ok', 'perfetto', 'va bene'].some((w) => userText.includes(w));

    if (chatStep === 'welcome') {
      let docType = 'generic';
      if (userText.includes('lavoro') || userText.includes('datore') || userText.includes('azienda')) docType = 'employer_letter';
      else if (userText.includes('casa') || userText.includes('affitto') || userText.includes('proprietario')) docType = 'landlord_letter';
      else if (userText.includes('scuola') || userText.includes('assenze')) docType = 'school_absence';

      setDocumentData((prev) => ({ ...prev, type: docType, date: new Date().toISOString().split('T')[0] }));
      setChatStep('collecting');
      setCollectingField('sender');
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: 'ai', text: 'Perfetto! Come ti chiami? (mittente)' }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    if (chatStep === 'collecting' && collectingField) {
      const nextData = { ...documentData };
      let nextField: 'sender' | 'recipient' | 'subject' | 'content' | null = null;
      let nextQuestion = '';

      if (collectingField === 'sender') {
        nextData.sender = text;
        nextField = 'recipient';
        nextQuestion = "A chi è indirizzata la lettera? (nome azienda/persona)";
      } else if (collectingField === 'recipient') {
        nextData.recipient = text;
        nextField = 'subject';
        nextQuestion = "Qual è l'oggetto/motivo della lettera?";
      } else if (collectingField === 'subject') {
        nextData.subject = text;
        nextField = 'content';
        nextQuestion = 'Vuoi aggiungere altri dettagli? (scrivi il contenuto o "No" per saltare)';
      } else if (collectingField === 'content') {
        nextData.content = userText === 'no' ? '' : text;
        nextField = null;
      }

      setDocumentData(nextData);
      setCollectingField(nextField);

      if (nextField === null) {
        setChatStep('confirming');
        const summary = `Ecco il riepilogo:\n\n📄 Tipo: ${nextData.type}\n✍️ Da: ${nextData.sender}\n📧 A: ${nextData.recipient}\n📅 Data: ${nextData.date || new Date().toISOString().split('T')[0]}\n📝 Oggetto: ${nextData.subject}\nDettagli: ${nextData.content || 'Nessuno'}\n\nTutto corretto? Rispondi "Sì" per generare il documento.`;
        setTimeout(() => {
          setMessages((m) => [...m, { type: 'ai', text: summary }]);
        }, 500);
      } else {
        setTimeout(() => {
          setMessages((m) => [...m, { type: 'ai', text: nextQuestion }]);
        }, 500);
      }
      setIsLoading(false);
      return;
    }

    if (chatStep === 'confirming') {
      if (isConfirm) {
        setChatStep('generating');
        setMessages((prev) => [...prev, { type: 'ai', text: '⏳ Sto generando il tuo documento...' }]);
        setIsLoading(false);

        const d = documentData;
        const draft = buildDraftFromData(d);

        setTimeout(() => {
          saveToPreview(draft);
          setMessages((prev) => prev.slice(0, -1));
          setMessages((prev) => [
            ...prev,
            {
              type: 'ai',
              text: '',
              documentReady: `📄 IL TUO DOCUMENTO È PRONTO:\n\n${draft}\n\n---\n✅ Puoi ora copiarlo, stamparlo o inviarlo via email usando i pulsanti qui sotto!`,
            },
          ]);
          setChatStep('generated');
          setHasDocument(true);
        }, 1500);
      } else {
        setTimeout(() => {
          setMessages((prev) => [...prev, { type: 'ai', text: 'Dimmi cosa modificare o scrivi "Sì" per confermare.' }]);
          setIsLoading(false);
        }, 500);
      }
      return;
    }

    if (chatStep === 'generated') {
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: 'ai', text: 'Il documento è pronto. Usa Copy, Preview o Print. Per iniziare da capo clicca Clear.' }]);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessages((prev) => [...prev, { type: 'user', text: `📎 Ho caricato: ${file.name}` }]);
      setDocumentData({ type: 'generic', sender: '', recipient: '', date: new Date().toISOString().split('T')[0], subject: '', content: '' });
      setChatStep('collecting');
      setCollectingField('sender');
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: 'ai', text: 'Ho ricevuto il documento. Come ti chiami? (mittente)' }]);
      }, 600);
    }
    e.target.value = '';
  };

  const handleCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setMessages((prev) => [...prev, { type: 'ai', text: '❌ Formato non supportato. Usa JPG o PNG.' }]);
      e.target.value = '';
      return;
    }

    setIsProcessingOCR(true);
    setMessages((prev) => [...prev, { type: 'user', text: '📸 Analisi documento in corso...' }]);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        if (!base64 || !base64.startsWith('data:image')) {
          setMessages((prev) => [...prev, { type: 'ai', text: '❌ Errore nel caricamento immagine' }]);
          setIsProcessingOCR(false);
          e.target.value = '';
          return;
        }

        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          setMessages((prev) => [...prev, { type: 'ai', text: '❌ VITE_OPENAI_API_KEY non configurata nel .env' }]);
          setIsProcessingOCR(false);
          e.target.value = '';
          return;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Estrai da questo documento: documentType (tipo), sender (mittente), recipient (destinatario), date (data), subject (oggetto). Rispondi SOLO in JSON valido.',
              },
              {
                role: 'user',
                content: [{ type: 'image_url', image_url: { url: base64 } }],
              },
            ],
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('OpenAI error:', errorData);
          setMessages((prev) => [...prev, { type: 'ai', text: '❌ Errore analisi. Riprova.' }]);
          setIsProcessingOCR(false);
          e.target.value = '';
          return;
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content ?? '';

        let analysis: Record<string, string>;
        try {
          const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/{[\s\S]*?}/);
          analysis = jsonMatch
            ? JSON.parse(jsonMatch[1] || jsonMatch[0])
            : {
                documentType: 'Lettera',
                sender: 'Non rilevato',
                recipient: 'Non rilevato',
                date: new Date().toISOString().split('T')[0],
                subject: 'Non rilevato',
              };
        } catch {
          analysis = {
            documentType: 'Lettera',
            sender: 'Non rilevato',
            recipient: 'Non rilevato',
            date: new Date().toISOString().split('T')[0],
            subject: 'Non rilevato',
            fullText: content,
          };
        }

        setOcrResult(analysis);
        setDocumentData({
          type: 'response_letter',
          sender: '',
          recipient: analysis.recipient ?? analysis.sender ?? '',
          date: analysis.date ?? new Date().toISOString().split('T')[0],
          subject: `Risposta a: ${analysis.subject || 'Documento'}`,
          content: '',
        });
        setChatStep('collecting');
        setCollectingField('sender');

        setMessages((prev) => [
          ...prev,
          {
            type: 'ai',
            text: `✅ Documento analizzato!\n\n📄 Tipo: ${analysis.documentType ?? 'Lettera'}\n✍️ Da: ${analysis.sender ?? 'Non rilevato'}\n📧 A: ${analysis.recipient ?? 'Non rilevato'}\n📅 Data: ${analysis.date ?? '—'}\n📝 Oggetto: ${analysis.subject ?? 'Non rilevato'}\n\nVuoi generare una risposta? Indicami i dati mancanti: come ti chiami? (mittente)`,
          },
        ]);
      } catch (err) {
        console.error('OCR Error:', err);
        setMessages((prev) => [...prev, { type: 'ai', text: '❌ Errore imprevisto. Riprova.' }]);
      } finally {
        setIsProcessingOCR(false);
        e.target.value = '';
      }
    };

    reader.onerror = () => {
      setMessages((prev) => [...prev, { type: 'ai', text: '❌ Errore nel caricamento del file.' }]);
      setIsProcessingOCR(false);
      e.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setChatStep('welcome');
    setCollectingField(null);
    setHasDocument(false);
    setDocumentData({ type: '', sender: '', recipient: '', date: '', subject: '', content: '' });
    setOcrResult(null);
    setMessages([
      {
        type: 'ai',
        text: 'Ciao! Sono Lexora, il tuo assistente legale AI.\n\nPosso aiutarti a creare:\n• Lettere formali al datore di lavoro\n• Lettere al proprietario di casa\n• Lettere alle autorità scolastiche\n• Reclami e richieste ufficiali\n\nChe tipo di documento ti serve? Descrivimi la tua situazione.',
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
          accept="image/jpeg,image/jpg,image/png"
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
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Documento"
                    className="max-w-full h-auto rounded-lg mb-2 max-h-32 object-cover"
                    onLoad={() => URL.revokeObjectURL(msg.image!)}
                  />
                )}
                {msg.documentReady ? (
                  <pre className="whitespace-pre-wrap text-sm bg-[#f5f5dc] p-3 rounded border border-[#d4af37]/30 max-h-64 overflow-y-auto">{msg.documentReady}</pre>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {(isLoading || chatStep === 'generating') && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center mr-2">
                <Scale className="w-5 h-5 text-[#0f172a]" />
              </div>
              <div className="bg-[#e8e4d5] p-3 rounded-2xl rounded-tl-none">
                {chatStep === 'generating' ? (
                  <span className="text-sm">Sto generando il tuo documento...</span>
                ) : (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce [animation-delay:100ms]" />
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce [animation-delay:200ms]" />
                  </div>
                )}
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
            disabled={isProcessingOCR}
            className={`bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:border-[#d4af37] hover:bg-[#1e293b]/80 transition ${isProcessingOCR ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isProcessingOCR ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
            {isProcessingOCR ? 'Analisi...' : 'Scan document'}
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
            disabled={chatStep !== 'generated'}
            className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              chatStep === 'generated'
                ? 'bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] hover:border-[#d4af37]'
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed opacity-50'
            }`}
          >
            <Copy className="w-5 h-5" />
            Copy letter
          </button>

          <button
            type="button"
            onClick={handlePreview}
            disabled={chatStep !== 'generated'}
            className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              chatStep === 'generated'
                ? 'bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] hover:border-[#d4af37]'
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed opacity-50'
            }`}
          >
            <Eye className="w-5 h-5" />
            Preview
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={chatStep !== 'generated'}
            className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              chatStep === 'generated'
                ? 'bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] hover:border-[#d4af37]'
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed opacity-50'
            }`}
          >
            <Printer className="w-5 h-5" />
            Print
          </button>

          {chatStep === 'generated' ? (
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
              className="py-3 px-4 rounded-lg flex items-center justify-center gap-2 bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed opacity-50"
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
      {chatStep === 'generated' && (
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
