import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Tesseract from 'tesseract.js';
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
import { useLanguageContext } from '@/contexts/LanguageContext';

const DEMO_PREVIEW_KEY = 'lexora_demo_preview';

export function ChatDemo() {
  const { user } = useAuth();
  const { t } = useLanguageContext();
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
  const [ocrResult, setOcrResult] = useState<Record<string, string> | null>(null);
  const [messages, setMessages] = useState<Array<{
    type: 'ai' | 'user';
    text: string;
    image?: string;
    documentReady?: string;
    ocrContent?: string;
    ocrSummary?: string;
    ocrData?: { documentType: string; sender: string; recipient: string; date: string; subject: string };
    ocrDraft?: string;
  }>>([
    {
      type: 'ai',
      text: t('chat.welcome_message') || 'Hello, I\'m Lexora. Briefly describe your legal situation so I can see how I can help you.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [draftText, setDraftText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const lastMessageFromUser = useRef(false);
  useEffect(() => {
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    if (lastMessageFromUser.current) {
      setTimeout(scrollToBottom, 50);
      lastMessageFromUser.current = false;
    } else if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last?.type === 'ai' && (last.ocrContent || last.documentReady)) {
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [messages]);

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
    lastMessageFromUser.current = true;
    const userText = text.toLowerCase();
    setInputText('');
    setIsLoading(true);

    const isYes = ['sì', 'si', 'sì', 'yes'].some((w) => userText === w || userText.trim() === w);
    const isNo = ['no', 'nò'].some((w) => userText === w || userText.trim() === w);
    const isConfirm = ['sì', 'si', 'confermo', 'conferma', 'ok', 'perfetto', 'va bene'].some((w) => userText.includes(w));

    if (chatStep === 'collecting' && ocrResult && collectingField === 'sender') {
      if (isYes) {
        setChatStep('confirming');
        setCollectingField(null);
        const d = documentData;
        const summary = `Ecco i dati che userò:

• Tipo: ${d.type || 'Lettera'}
• Mittente (tu): da indicare
• Destinatario: ${d.recipient || '—'}
• Data: ${d.date || '—'}
• Oggetto: ${d.subject || '—'}

Scrivi il tuo nome per confermare e generare il documento.`;
        setTimeout(() => setMessages((m) => [...m, { type: 'ai', text: summary }]), 500);
      } else if (isNo) {
        setOcrResult(null);
        setDocumentData({ type: '', sender: '', recipient: '', date: '', subject: '', content: '' });
        setCollectingField('sender');
        setTimeout(() => setMessages((m) => [...m, { type: 'ai', text: 'Nessun problema. Come ti chiami? (mittente)' }]), 500);
      } else {
        setDocumentData((prev) => ({ ...prev, sender: text }));
        setChatStep('confirming');
        setCollectingField(null);
        const d = { ...documentData, sender: text };
        const summary = `Ecco il riepilogo:

• Tipo: ${d.type || 'Lettera'}
• Mittente: ${d.sender}
• Destinatario: ${d.recipient || '—'}
• Data: ${d.date || '—'}
• Oggetto: ${d.subject || '—'}

Tutto corretto? Rispondi "Sì" o "Confermo" per generare il documento.`;
        setTimeout(() => setMessages((m) => [...m, { type: 'ai', text: summary }]), 500);
      }
      setIsLoading(false);
      return;
    }

    if (chatStep === 'confirming' && !documentData.sender && ocrResult) {
      setDocumentData((prev) => ({ ...prev, sender: text }));
      const d = { ...documentData, sender: text };
      const summary = `Ecco il riepilogo:

• Tipo: ${d.type || 'Lettera'}
• Mittente: ${d.sender}
• Destinatario: ${d.recipient || '—'}
• Data: ${d.date || '—'}
• Oggetto: ${d.subject || '—'}

Tutto corretto? Rispondi "Sì" o "Confermo" per generare il documento.`;
      setTimeout(() => setMessages((m) => [...m, { type: 'ai', text: summary }]), 500);
      setIsLoading(false);
      return;
    }

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
        const summary = `Ecco il riepilogo:

• Tipo: ${nextData.type}
• Mittente: ${nextData.sender}
• Destinatario: ${nextData.recipient}
• Data: ${nextData.date || new Date().toISOString().split('T')[0]}
• Oggetto: ${nextData.subject}
• Dettagli: ${nextData.content || 'Nessuno'}

Tutto corretto? Rispondi "Sì" per generare il documento.`;
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

  const runTesseractFallback = async (file: File): Promise<{ analysis: Record<string, string>; extractedText: string }> => {
    const result = await Tesseract.recognize(file, 'deu+ita+eng', {
      logger: (m: { status?: string; progress?: number }) => {
        if (m.status === 'recognizing text') {
          const percent = Math.round((m.progress ?? 0) * 100);
          if (percent % 25 === 0) {
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg?.type === 'ai' && lastMsg.text.includes('Analisi')) {
                newMessages[newMessages.length - 1] = {
                  type: 'ai',
                  text: `⏳ Analisi documento (fallback)... ${percent}%`,
                };
              }
              return newMessages;
            });
          }
        }
      },
    });
    const extractedText = result?.data?.text ?? '';
    const lines = extractedText.split('\n').filter((l) => l.trim());
    const sender =
      lines.find((l) => /da:|mittente:|from:|absender/i.test(l))?.replace(/da:|mittente:|from:|absender/i, '').trim() ??
      lines[0]?.substring(0, 30) ??
      'Non rilevato';
    const recipient =
      lines.find((l) => /a:|destinatario:|to:|empfänger|an:/i.test(l))?.replace(/a:|destinatario:|to:|empfänger|an:/i, '').trim() ??
      'Non rilevato';
    const dateMatch = extractedText.match(/\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}/);
    const date = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];
    const subject =
      lines.find((l) => /oggetto:|subject:|re:|betreff/i.test(l))?.replace(/oggetto:|subject:|re:|betreff/i, '').trim() ??
      lines[0]?.substring(0, 50) ??
      'Non rilevato';
    return {
      analysis: { documentType: 'Lettera', sender, recipient, date, subject, fullText: extractedText },
      extractedText,
    };
  };

  const handleCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingOCR(true);
    setMessages((prev) => [
      ...prev,
      { type: 'user', text: '📸 Documento scannerizzato' },
      { type: 'ai', text: '⏳ Analisi documento con AI...' },
    ]);

    try {
      const mimeType = file.type || 'image/jpeg';
      const reader = new FileReader();
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result?.includes(',') ? result.split(',')[1] : result;
          resolve(base64 ?? '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      let analysis: Record<string, string>;
      let draft_text: string;
      let usedApi = false;
      let ocrQuality: 'HIGH_QUALITY' | 'LOW_QUALITY' | undefined;

      try {
        const { data, error } = await supabase.functions.invoke('process-ocr', {
          body: { imageBase64, mimeType },
        });
        if (error) {
          console.warn('[ChatDemo] process-ocr error:', error);
          throw new Error(error.message ?? 'process-ocr failed');
        }
        if (!data?.ok || !data?.draft_text) {
          console.warn('[ChatDemo] process-ocr bad response:', data);
          throw new Error(data?.error ?? 'Risposta non valida');
        }
        analysis = {
          documentType: data.documentType ?? data.analysis?.documentType ?? 'Lettera',
          sender: data.sender ?? data.analysis?.sender ?? 'Non rilevato',
          recipient: data.recipient ?? data.analysis?.recipient ?? 'Non rilevato',
          date: data.date ?? data.analysis?.date ?? new Date().toISOString().split('T')[0],
          subject: data.subject ?? data.analysis?.subject ?? 'Non rilevato',
          fullText: data.analysis?.fullText ?? data.draft_text ?? '',
        };
        draft_text = data.draft_text;
        usedApi = true;
        ocrQuality = data.ocr_quality ?? 'HIGH_QUALITY';
      } catch {
        const { analysis: tessAnalysis, extractedText } = await runTesseractFallback(file);
        analysis = tessAnalysis;
        draft_text = `[Bozza estratta da documento]\n\nMittente: ${tessAnalysis.sender}\nDestinatario: ${tessAnalysis.recipient}\nData: ${tessAnalysis.date}\nOggetto: ${tessAnalysis.subject}\n\n${extractedText || 'Testo da completare.'}`;
        ocrQuality = undefined;
      }

      saveToPreview(draft_text);
      setHasDocument(true);
      setOcrResult(analysis);
      setDocumentData({
        type: 'response_letter',
        sender: '',
        recipient: analysis.sender !== 'Non rilevato' ? analysis.sender : analysis.recipient,
        date: analysis.date,
        subject: `Risposta a: ${analysis.subject !== 'Non rilevato' ? analysis.subject : 'documento'}`,
        content: '',
      });
      setChatStep('collecting');
      setCollectingField('sender');

      const lowQualityNote = ocrQuality === 'LOW_QUALITY'
        ? '\n\n⚠️ Some text could not be read clearly (□). Please check the transcription.'
        : '';
      const fullText = analysis.fullText ?? draft_text ?? '';
      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          text: '',
          ocrContent: fullText,
          ocrSummary: `Documento analizzato${usedApi ? ' (GPT-4o Vision)' : ''}!\n\nDATI ESTRATTI:\n• Mittente: ${analysis.sender || 'Non rilevato'}\n• Destinatario: ${analysis.recipient || 'Non rilevato'}\n• Data: ${analysis.date}\n• Oggetto: ${analysis.subject || 'Non rilevato'}\n\n${lowQualityNote}Puoi usare Copy, Preview o Print subito. Vuoi preparare una risposta? Scrivi SI per usare questi dati, oppure NO per inserirli manualmente.`,
        },
      ]);
    } catch (err) {
      console.error('OCR error:', err);
      setMessages((prev) => [
        ...prev,
        { type: 'ai', text: '❌ Impossibile leggere il documento. Prova con una foto più nitida e ben illuminata.' },
      ]);
    } finally {
      setIsProcessingOCR(false);
    }
    e.target.value = '';
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
        text: t('chat.welcome_message') || 'Hello, I\'m Lexora. Briefly describe your legal situation so I can see how I can help you.',
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
    <div className="flex flex-col gap-6 w-full min-w-0 max-w-full">
      <div className="bg-[#0f172a] rounded-2xl border-2 border-[#d4af37] p-3 sm:p-6 w-full max-w-2xl mx-auto shadow-[0_0_40px_rgba(212,175,55,0.15)] box-border overflow-hidden touch-pan-y">
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
        <div 
          className="bg-[#f5f0e6] rounded-lg min-h-[260px] max-h-[55vh] sm:max-h-[600px] mb-4 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pt-6 space-y-4 border border-[#d4af37]/30 overscroll-contain min-w-0 break-words"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex min-w-0 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center mr-2 flex-shrink-0">
                  <Scale className="w-5 h-5 text-[#0f172a]" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[90%] min-w-0 p-3 rounded-2xl text-sm sm:text-base whitespace-pre-wrap break-words overflow-y-auto overflow-x-hidden ${
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
                  <pre className="whitespace-pre-wrap break-words text-sm bg-[#f5f5dc] p-3 rounded border border-[#d4af37]/30 max-h-[320px] overflow-y-auto overflow-x-hidden overscroll-contain">{msg.documentReady}</pre>
                ) : msg.ocrContent ? (
                  <div className="space-y-3 min-w-0">
                    <div className="text-xs font-medium text-[#1e293b]/80">CONTENUTO DELLA LETTERA:</div>
                    <pre className="whitespace-pre-wrap break-words text-sm bg-[#f5f5dc] p-3 rounded border border-[#d4af37]/30 max-h-[360px] overflow-y-auto overflow-x-hidden overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>{msg.ocrContent}</pre>
                    <pre className="whitespace-pre-wrap break-words text-xs border-t border-[#d4af37]/20 pt-2 mt-2">{msg.ocrSummary}</pre>
                  </div>
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
            placeholder={t('chat.placeholder') || 'Type here...'}
            className="flex-1 bg-transparent border-none outline-none px-4 text-[#1e293b] placeholder-[#999] min-w-0"
            style={{ fontSize: '16px' }}
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
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 min-w-0">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessingOCR}
            className={`bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] py-3 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 hover:border-[#d4af37] hover:bg-[#1e293b]/80 transition min-w-0 text-sm sm:text-base ${isProcessingOCR ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isProcessingOCR ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
            {isProcessingOCR ? '...' : (t('chat.button_scan') || 'Scan document')}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] py-3 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 hover:border-[#d4af37] hover:bg-[#1e293b]/80 transition min-w-0 text-sm sm:text-base"
          >
            <Paperclip className="w-5 h-5" />
            {t('chat.button_upload') || 'Upload file'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!hasDocument || !draftText}
            className={`py-3 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition min-w-0 text-sm sm:text-base ${
              hasDocument && draftText
                ? 'bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] hover:border-[#d4af37]'
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed opacity-50'
            }`}
          >
            <Copy className="w-5 h-5" />
            {t('chat.button_copy') || 'Copy letter'}
          </button>

          <button
            type="button"
            onClick={handlePreview}
            disabled={!hasDocument}
            className={`py-3 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition min-w-0 text-sm sm:text-base ${
              hasDocument
                ? 'bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] hover:border-[#d4af37]'
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed opacity-50'
            }`}
          >
            <Eye className="w-5 h-5 flex-shrink-0" />
            {t('chat.button_preview') || 'Preview'}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!hasDocument}
            className={`py-3 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition min-w-0 text-sm sm:text-base ${
              hasDocument
                ? 'bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] hover:border-[#d4af37]'
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed opacity-50'
            }`}
          >
            <Printer className="w-5 h-5 flex-shrink-0" />
            {t('chat.button_print') || 'Print'}
          </button>

          {hasDocument ? (
            <a
              href={`mailto:?body=${encodeURIComponent(draftText ?? '')}`}
              className="py-3 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition min-w-0 text-sm sm:text-base bg-[#1e293b] border border-[rgba(212,175,55,0.4)] text-[#d4af37] hover:border-[#d4af37]"
            >
              <Mail className="w-5 h-5 flex-shrink-0" />
              {t('chat.button_email') || 'Email'}
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="py-3 px-2 sm:px-4 rounded-lg flex items-center justify-center gap-1 sm:gap-2 min-w-0 text-sm sm:text-base bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed opacity-50"
            >
              <Mail className="w-5 h-5 flex-shrink-0" />
              {t('chat.button_email') || 'Email'}
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
          {t('chat.button_delete') || 'Clear conversation'}
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
