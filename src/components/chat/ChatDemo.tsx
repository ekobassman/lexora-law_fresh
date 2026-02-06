import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
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
  const [chatStep, setChatStep] = useState<'welcome' | 'collecting' | 'confirming' | 'generated'>('welcome');
  const [collectingField, setCollectingField] = useState<'sender' | 'recipient' | 'subject' | 'details' | null>(null);
  const [documentData, setDocumentData] = useState({
    type: '',
    typeKey: '' as '' | 'employer_letter' | 'landlord_letter' | 'school_absence' | 'other',
    sender: '',
    recipient: '',
    date: '',
    subject: '',
    content: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
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

  const hasDocument = chatStep === 'generated' && !!draftText;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isGenerating]);

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

  const detectDocumentType = (text: string): '' | 'employer_letter' | 'landlord_letter' | 'school_absence' | 'other' => {
    const t = text.toLowerCase();
    if (/\b(lavoro|datore|azienda|dipendente)\b/.test(t)) return 'employer_letter';
    if (/\b(casa|affitto|proprietario|inquilino|locazione)\b/.test(t)) return 'landlord_letter';
    if (/\b(scuola|assenza|scolastica|preside|docente)\b/.test(t)) return 'school_absence';
    return 'other';
  };

  const getTypeLabel = (key: string) => {
    if (key === 'employer_letter') return 'Lettera al datore di lavoro';
    if (key === 'landlord_letter') return 'Lettera al proprietario di casa';
    if (key === 'school_absence') return 'Lettera alle autorità scolastiche';
    return 'Lettera formale';
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

  const generateDocument = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: {
          documentType: documentData.typeKey || 'other',
          data: documentData,
          language: 'it',
        },
        headers: user ? {} : { 'X-Demo-Mode': 'true' },
      });
      const draft = (error || !data?.draftText) ? buildDraftFromData(documentData) : data.draftText;
      saveToPreview(draft);
      setChatStep('generated');
      setMessages((prev) => [
        ...prev,
        { type: 'ai', text: '', documentReady: draft },
      ]);
    } catch {
      const draft = buildDraftFromData(documentData);
      saveToPreview(draft);
      setChatStep('generated');
      setMessages((prev) => [
        ...prev,
        { type: 'ai', text: '', documentReady: draft },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { type: 'user', text }]);
    setInputText('');
    setIsLoading(true);

    const lower = text.toLowerCase();
    const isConfirm = ['sì', 'si', 'confermo', 'conferma', 'ok', 'perfetto', 'va bene', 'sì generare', 'si generare'].some((w) => lower.includes(w));
    const skipDetails = /^(no|niente|salta|skip)$/.test(lower.trim());

    setTimeout(async () => {
      if (chatStep === 'welcome') {
        const typeKey = detectDocumentType(text);
        const typeLabel = typeKey !== 'other' ? getTypeLabel(typeKey) : text;
        setDocumentData((d) => ({ ...d, type: typeLabel, typeKey: typeKey || 'other' }));
        setChatStep('collecting');
        setCollectingField('sender');
        setMessages((prev) => [
          ...prev,
          { type: 'ai', text: `Perfetto, una ${typeLabel.toLowerCase()}. Come ti chiami? (mittente)` },
        ]);
      } else if (chatStep === 'collecting' && collectingField) {
        const updatedData = { ...documentData };
        if (collectingField === 'sender') updatedData.sender = text;
        else if (collectingField === 'recipient') updatedData.recipient = text;
        else if (collectingField === 'subject') updatedData.subject = text;
        else if (collectingField === 'details' && !skipDetails) updatedData.content = text;
        setDocumentData(updatedData);

        const goToConfirm = collectingField === 'details';
        if (goToConfirm) {
          setChatStep('confirming');
          setCollectingField(null);
          const today = new Date().toISOString().slice(0, 10);
          const sender = updatedData.sender;
          const recipient = updatedData.recipient;
          const subject = updatedData.subject;
          const content = (collectingField === 'details' && !skipDetails) ? text : updatedData.content;
          setMessages((prev) => [
            ...prev,
            {
              type: 'ai',
              text: `📄 Tipo: ${updatedData.type || getTypeLabel(updatedData.typeKey)}\n✍️ Da: ${sender || '—'}\n📧 A: ${recipient || '—'}\n📅 Data: ${today}\n📝 Oggetto: ${subject || '—'}\n\nDettagli: ${content || '—'}\n\nTutto corretto? Rispondi "Sì" per generare il documento o dimmi cosa modificare.`,
            },
          ]);
        } else {
          const next: 'sender' | 'recipient' | 'subject' | 'details' = collectingField === 'sender' ? 'recipient' : collectingField === 'recipient' ? 'subject' : 'details';
          setCollectingField(next);
          const question = next === 'recipient'
            ? "A chi è indirizzata la lettera? (nome dell'azienda/datore)"
            : next === 'subject'
              ? "Qual è l'oggetto/il motivo della lettera?"
              : 'Vuoi aggiungere altri dettagli importanti? (rispondi "No" per saltare)';
          setMessages((prev) => [...prev, { type: 'ai', text: question }]);
        }
      } else if (chatStep === 'confirming' && isConfirm) {
        await generateDocument();
      } else if (chatStep === 'confirming' && !isConfirm) {
        setMessages((prev) => [
          ...prev,
          { type: 'ai', text: 'Per generare il documento rispondi "Sì" o "Confermo".' },
        ]);
      } else if (chatStep === 'generated') {
        setMessages((prev) => [
          ...prev,
          { type: 'ai', text: 'Il documento è pronto. Usa Copy, Preview o Print. Per iniziare da capo clicca Clear.' },
        ]);
      }
      setIsLoading(false);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessages((prev) => [...prev, { type: 'user', text: `📎 Ho caricato: ${file.name}` }]);
      setDocumentData((d) => ({ ...d, type: 'Lettera da documento', typeKey: 'other' }));
      setChatStep('collecting');
      setCollectingField('sender');
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: 'ai', text: 'Ho ricevuto il documento. Indicami i dati: come ti chiami? (mittente)' },
        ]);
      }, 600);
    }
    e.target.value = '';
  };

  const compressImage = (file: File, maxSizeKB = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size <= maxSizeKB * 1024) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
        return;
      }
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas error'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Image load failed'));
      };
      img.src = objectUrl;
    });
  };

  const handleCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setMessages((prev) => [
        ...prev,
        { type: 'ai', text: '❌ Formato non supportato. Usa JPG o PNG.' },
      ]);
      e.target.value = '';
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setMessages((prev) => [
      ...prev,
      { type: 'user', text: '📸 Analisi documento in corso...', image: imageUrl },
    ]);
    setIsProcessingOCR(true);

    try {
      const imageBase64 = await compressImage(file);

      const { data: ocrData, error: ocrError } = await supabase.functions.invoke('process-ocr', {
        body: { imageBase64, mimeType: file.type.startsWith('image/') ? file.type : 'image/jpeg' },
        headers: user ? {} : { 'X-Demo-Mode': 'true' },
      });

      if (ocrError) throw ocrError;

      const analysis = ocrData?.analysis ?? ocrData;
      const draft = ocrData?.draft_text ?? ocrData?.draftText ?? SAMPLE_LETTER;
      const docType = analysis?.documentType ?? ocrData?.documentType ?? 'Lettera';
      const sender = analysis?.sender ?? ocrData?.sender ?? 'Non rilevato';
      const recipient = analysis?.recipient ?? ocrData?.recipient ?? 'Non rilevato';
      const date = analysis?.date ?? ocrData?.date ?? 'Non rilevata';
      const subject = analysis?.subject ?? ocrData?.subject ?? 'Non rilevato';

      setDocumentData({ type: docType, typeKey: 'other', sender, recipient, date, subject, content: draft });
      setChatStep('confirming');

      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          text: '✅ Ho analizzato il documento! Ecco cosa ho trovato:',
          ocrData: { documentType: docType, sender, recipient, date, subject },
          ocrDraft: draft,
        },
      ]);
    } catch (err) {
      console.error('OCR Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          text: '❌ Non sono riuscito a leggere il documento. Prova a scattare una foto più nitida.',
        },
      ]);
    } finally {
      setIsProcessingOCR(false);
    }
    e.target.value = '';
  };

  const handleClear = () => {
    setChatStep('welcome');
    setCollectingField(null);
    setDocumentData({ type: '', typeKey: '', sender: '', recipient: '', date: '', subject: '', content: '' });
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
                  <div>
                    <div className="font-semibold text-[#b8941f] mb-2">📄 IL TUO DOCUMENTO È PRONTO</div>
                    <pre className="whitespace-pre-wrap text-sm bg-[#f5f5dc] p-3 rounded border border-[#d4af37]/30 max-h-48 overflow-y-auto">{msg.documentReady}</pre>
                    <div className="mt-2 text-sm text-[#64748b]">---</div>
                    <div className="mt-1 text-sm">✅ Puoi ora copiarlo, stamparlo o inviarlo via email usando i pulsanti qui sotto!</div>
                  </div>
                ) : (
                  msg.text
                )}
                {msg.ocrData && (
                  <div className="mt-3 p-3 rounded-lg border-2 border-[#d4af37] bg-[#fef9e7] text-[#1e293b] space-y-1 text-sm">
                    <div><span className="font-semibold text-[#b8941f]">Tipo:</span> {msg.ocrData.documentType}</div>
                    <div><span className="font-semibold text-[#b8941f]">Mittente:</span> {msg.ocrData.sender}</div>
                    <div><span className="font-semibold text-[#b8941f]">Destinatario:</span> {msg.ocrData.recipient}</div>
                    <div><span className="font-semibold text-[#b8941f]">Data:</span> {msg.ocrData.date}</div>
                    <div><span className="font-semibold text-[#b8941f]">Oggetto:</span> {msg.ocrData.subject}</div>
                    <p className="mt-2">Vuoi generare una risposta a questo documento?</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          const draft = msg.ocrDraft ?? buildDraftFromData(documentData) ?? SAMPLE_LETTER;
                          saveToPreview(draft);
                          setChatStep('generated');
                          setMessages((prev) => [
                            ...prev,
                            { type: 'ai', text: '', documentReady: draft },
                          ]);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-[#0f172a] font-medium hover:bg-[#f4d03f] transition text-sm"
                      >
                        Sì, genera risposta
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCollectingField('sender');
                          setChatStep('collecting');
                          setInputText('');
                          setMessages((prev) => [...prev, { type: 'ai', text: 'Indicherò i dati mancanti. Come ti chiami? (mittente)' }]);
                        }}
                        className="px-3 py-1.5 rounded-lg border-2 border-[#d4af37] text-[#1e293b] font-medium hover:bg-[#d4af37]/20 transition text-sm"
                      >
                        No, indico i dati
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {(isLoading || isGenerating) && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center mr-2">
                <Scale className="w-5 h-5 text-[#0f172a]" />
              </div>
              <div className="bg-[#e8e4d5] p-3 rounded-2xl rounded-tl-none">
                {isGenerating ? (
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
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed'
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
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed'
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
                : 'bg-[#1e293b]/50 border border-[rgba(212,175,55,0.2)] text-[#64748b] cursor-not-allowed'
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
