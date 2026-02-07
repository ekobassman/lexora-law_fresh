import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import {
  useDashboardDocuments,
  type DashboardDocument,
} from '@/hooks/useDashboardDocuments';
import { useCases } from '@/hooks/useCases';
import { Button } from '@/components/ui/Button';
import {
  Upload,
  Send,
  RefreshCw,
  Search,
  FileText,
  Trash2,
  ExternalLink,
  X,
  Save,
  Printer,
  FolderPlus,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CHAT_STORAGE_KEY = 'lexora_dashboard_chat_v1';
const ACTIVE_CASE_STORAGE_KEY = 'lexora_active_case_id';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

type FilterPill = 'all' | 'processing' | 'completed' | 'error';

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return s;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'completed':
    case 'done':
      return 'Completato';
    case 'processing':
      return 'In lavorazione';
    case 'failed':
    case 'error':
      return 'Errore';
    default:
      return 'In attesa';
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'completed':
    case 'done':
      return 'bg-green-500/20 text-green-400 border-green-500/40';
    case 'processing':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'failed':
    case 'error':
      return 'bg-red-500/20 text-red-400 border-red-500/40';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
  }
}

export function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    documents,
    loading: docsLoading,
    error: docsError,
    refetch: refetchDocs,
    fetchFull,
    saveDraft,
    deleteDocument,
  } = useDashboardDocuments();
  const { cases, createCase } = useCases();
  const navigate = useNavigate();

  const [activeCaseId, setActiveCaseId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_CASE_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [activeCaseTitle, setActiveCaseTitle] = useState<string | null>(null);
  const [newCaseModalOpen, setNewCaseModalOpen] = useState(false);
  const [selectCaseModalOpen, setSelectCaseModalOpen] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState({
    title: '',
    authority: '',
    reference: '',
    deadline: '',
  });
  const [creatingCase, setCreatingCase] = useState(false);

  const [activeDoc, setActiveDoc] = useState<DashboardDocument | null>(null);
  const [modalDoc, setModalDoc] = useState<DashboardDocument | null>(null);
  const [modalDraft, setModalDraft] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterPill>('all');
  const [savingModal, setSavingModal] = useState(false);

  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [lastSuggestedDraft, setLastSuggestedDraft] = useState<string | null>(null);
  const [prevDraftForUndo, setPrevDraftForUndo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  useEffect(() => {
    if (activeCaseId) {
      try {
        localStorage.setItem(ACTIVE_CASE_STORAGE_KEY, activeCaseId);
      } catch {}
      const c = cases.find((x) => x.id === activeCaseId);
      if (c) {
        setActiveCaseTitle(c.title);
      } else {
        setActiveCaseTitle(null);
        supabase
          .from('cases')
          .select('title')
          .eq('id', activeCaseId)
          .eq('user_id', user?.id ?? '')
          .single()
          .then(({ data }) => {
            if (data) setActiveCaseTitle((data as { title: string }).title);
          });
      }
    } else {
      setActiveCaseTitle(null);
    }
  }, [activeCaseId, cases, user?.id]);

  const handleCreateCase = useCallback(async () => {
    const title = newCaseForm.title.trim();
    if (!title) return;
    setCreatingCase(true);
    try {
      const newCase = await createCase(title);
      if (newCase) {
        setActiveCaseId(newCase.id);
        setNewCaseModalOpen(false);
        setNewCaseForm({ title: '', authority: '', reference: '', deadline: '' });
        setToast(t('dashboard.caseCreated'));
      }
    } finally {
      setCreatingCase(false);
    }
  }, [newCaseForm, createCase, t]);

  const handleSelectCase = useCallback((id: string) => {
    setActiveCaseId(id);
    setSelectCaseModalOpen(false);
  }, []);

  const callDashboardChat = useCallback(
    async (msgs: ChatMsg[], mode: 'general' | 'document'): Promise<{
      assistant_message: string;
      suggested_draft?: string | null;
    }> => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Non autenticato');

      const body: Record<string, unknown> = {
        mode,
        documentId: activeDoc?.id ?? null,
        caseId: activeCaseId ?? null,
        messages: msgs.map((m) => ({ role: m.role, content: m.content })),
      };
      if (mode === 'document' && activeDoc) {
        const full = await fetchFull(activeDoc.id);
        body.context = {
          ocr_text: full?.ocr_text ?? '',
          analysis_json: full?.analysis_json ?? {},
          draft_reply: full?.draft_reply ?? '',
        };
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Errore chat');
      return {
        assistant_message: data.assistant_message ?? '',
        suggested_draft: data.suggested_draft ?? null,
      };
    },
    [activeDoc, activeCaseId, fetchFull]
  );

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMsg = { role: 'user', content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setChatLoading(true);

    try {
      const mode = activeDoc ? 'document' : 'general';
      const { assistant_message, suggested_draft } = await callDashboardChat(
        newMsgs,
        mode
      );
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistant_message },
      ]);
      setLastSuggestedDraft(suggested_draft ?? null);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Errore durante l\'invio. Riprova.',
        },
      ]);
      setLastSuggestedDraft(null);
    } finally {
      setChatLoading(false);
    }
  }, [input, messages, activeDoc, chatLoading, callDashboardChat]);

  const handleRegenerate = useCallback(async () => {
    if (messages.length < 2 || chatLoading) return;
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;

    const msgsBeforeLast = messages.slice(0, messages.length - 1);
    setRegenerating(true);

    try {
      const mode = activeDoc ? 'document' : 'general';
      const { assistant_message, suggested_draft } = await callDashboardChat(
        msgsBeforeLast,
        mode
      );
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: assistant_message },
      ]);
      setLastSuggestedDraft(suggested_draft ?? null);
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: 'Errore durante la rigenerazione. Riprova.',
        },
      ]);
      setLastSuggestedDraft(null);
    } finally {
      setRegenerating(false);
    }
  }, [messages, activeDoc, chatLoading, callDashboardChat]);

  const applyToDraft = useCallback(() => {
    if (!activeDoc || !lastSuggestedDraft) return;
    setPrevDraftForUndo(activeDoc.draft_reply ?? null);
    saveDraft(activeDoc.id, lastSuggestedDraft);
    setActiveDoc((d) => (d ? { ...d, draft_reply: lastSuggestedDraft } : null));
    setModalDoc((d) => (d && d.id === activeDoc.id ? { ...d, draft_reply: lastSuggestedDraft } : d));
    setModalDraft(lastSuggestedDraft);
    setLastSuggestedDraft(null);
    setToast('Bozza applicata');
  }, [activeDoc, lastSuggestedDraft, saveDraft]);

  const undoApply = useCallback(() => {
    if (!activeDoc || prevDraftForUndo === null) return;
    saveDraft(activeDoc.id, prevDraftForUndo);
    setActiveDoc((d) => (d ? { ...d, draft_reply: prevDraftForUndo } : null));
    setModalDoc((d) => (d && d.id === activeDoc.id ? { ...d, draft_reply: prevDraftForUndo } : d));
    setModalDraft(prevDraftForUndo);
    setPrevDraftForUndo(null);
  }, [activeDoc, prevDraftForUndo, saveDraft]);

  const openModal = useCallback(
    async (doc: DashboardDocument) => {
      const full = await fetchFull(doc.id);
      setModalDoc(full ?? doc);
      setModalDraft((full ?? doc).draft_reply ?? '');
    },
    [fetchFull]
  );

  const closeModal = useCallback(() => {
    setModalDoc(null);
  }, []);

  const handleSaveDraft = useCallback(async () => {
    if (!modalDoc) return;
    setSavingModal(true);
    const ok = await saveDraft(modalDoc.id, modalDraft);
    setSavingModal(false);
    if (ok) {
      setToast('Bozza salvata');
      setModalDoc((d) => (d ? { ...d, draft_reply: modalDraft } : null));
    }
  }, [modalDoc, modalDraft, saveDraft]);

  const handleExportPdf = useCallback(() => {
    if (!modalDraft.trim()) {
      setToast('Nessuna bozza da esportare');
      return;
    }
    const blob = new Blob([modalDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modalDoc?.filename ?? 'bozza'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('File esportato (TXT). PDF DIN 5008: in sviluppo.');
  }, [modalDraft, modalDoc]);

  const handlePrint = useCallback(() => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      `<!DOCTYPE html><html><head><title>${modalDoc?.filename ?? 'Bozza'}</title></head><body><pre style="white-space:pre-wrap;font-family:system-ui;padding:20px">${(modalDraft || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`
    );
    w.document.close();
    w.print();
    w.close();
  }, [modalDraft, modalDoc]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user?.id) return;
      e.target.value = '';

      const isImage = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type);
      const BUCKET = 'documents';
      const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      setUploading(true);
      try {
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: false });

        if (uploadErr) throw uploadErr;

        const { data: row, error: insertErr } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            bucket: BUCKET,
            path,
            file_name: file.name,
            mime_type: file.type,
            status: 'processing',
          })
          .select('id')
          .single();

        if (insertErr) throw insertErr;

        if (isImage) {
          const reader = new FileReader();
          const imageBase64 = await new Promise<string>((res, rej) => {
            reader.onload = () => {
              const r = reader.result as string;
              res(r?.includes(',') ? r.split(',')[1] ?? '' : r ?? '');
            };
            reader.onerror = rej;
            reader.readAsDataURL(file);
          });

          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          const { data: ocrData, error: ocrErr } = await supabase.functions.invoke(
            'process-ocr',
            {
              body: { imageBase64, mimeType: file.type },
              headers: token
                ? { Authorization: `Bearer ${token}` }
                : undefined,
            }
          );

          if (!ocrErr && ocrData?.ok) {
            const analysis = ocrData.analysis ?? {};
            const draft =
              ocrData.draft_text ??
              `[Bozza]\n\nMittente: ${analysis.sender ?? 'N/A'}\nDestinatario: ${analysis.recipient ?? 'N/A'}\nOggetto: ${analysis.subject ?? 'N/A'}\n\n${analysis.fullText ?? ''}`;

            await supabase
              .from('documents')
              .update({
                ocr_text: analysis.fullText ?? ocrData.draft_text ?? '',
                analysis_json: analysis,
                draft_reply: draft,
                status: 'completed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', row.id);
          } else {
            await supabase
              .from('documents')
              .update({
                status: 'failed',
                error: ocrData?.error ?? ocrErr?.message ?? 'OCR fallito',
                updated_at: new Date().toISOString(),
              })
              .eq('id', row.id);
            setToast(ocrData?.error ?? 'OCR fallito');
          }
        } else {
          setToast('File caricato. OCR per PDF in arrivo.');
        }

        await refetchDocs();
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Errore caricamento');
      } finally {
        setUploading(false);
      }
    },
    [user?.id, refetchDocs]
  );

  const handleDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm('Eliminare questo documento?')) return;
      const ok = await deleteDocument(id);
      if (ok && activeDoc?.id === id) setActiveDoc(null);
    },
    [deleteDocument, activeDoc]
  );

  useEffect(() => {
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredDocs = documents.filter((d) => {
    if (search && !d.filename.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filter === 'processing' && d.ocr_status !== 'processing') return false;
    if (filter === 'completed' && d.ocr_status !== 'completed') return false;
    if (filter === 'error' && d.ocr_status !== 'failed') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* New Case / Open File block */}
        <section className="rounded-xl border-2 border-[#d4af37]/40 bg-[#1e293b] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-serif text-[#d4af37] mb-1">
                {t('dashboard.newCase.title')}
              </h2>
              <p className="text-gray-400 text-sm">{t('dashboard.newCase.subtitle')}</p>
              {activeCaseTitle && (
                <p className="text-xs text-[#d4af37]/80 mt-2">
                  {t('dashboard.activeCase')}: {activeCaseTitle}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                onClick={() => navigate('/dashboard/new')}
                className="bg-[#d4af37] text-[#0f172a] hover:bg-[#b8941d]"
              >
                <FolderPlus className="h-4 w-4 sm:mr-2" />
                {t('dashboard.newCase.cta')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectCaseModalOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                <FolderOpen className="h-4 w-4 sm:mr-2" />
                {t('dashboard.selectCase')}
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 1: Chat */}
        <section className="rounded-xl border-2 border-[#d4af37]/30 bg-[#1e293b] p-4 sm:p-5">
          <h2 className="text-xl font-serif text-[#d4af37] mb-1">Chat</h2>
          <p className="text-gray-400 text-sm mb-4">
            Chiedi, analizza, genera risposta. I tuoi documenti restano salvati sotto.
          </p>

          <div
            className="rounded-lg bg-[#0f172a] border border-[#d4af37]/20 overflow-y-auto mb-4 p-4 space-y-4"
            style={{
              height: typeof window !== 'undefined' && window.innerWidth < 640 ? 280 : 360,
            }}
          >
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">
                Scrivi un messaggio per iniziare.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-4 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-[#d4af37]/20 text-white'
                      : 'bg-[#1e293b] text-gray-200 border border-[#d4af37]/20'
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 text-sm bg-[#1e293b] text-gray-400 border border-[#d4af37]/20">
                  ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Scrivi un messaggio..."
                disabled={chatLoading}
                className="flex-1 min-h-[44px] max-h-[140px] rounded-lg border border-[#d4af37]/40 bg-[#0f172a] text-white px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                rows={2}
              />
              <Button
                onClick={sendMessage}
                disabled={chatLoading || !input.trim()}
                className="shrink-0 bg-[#d4af37] text-[#0f172a] hover:bg-[#b8941d]"
              >
                <Send className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Invia</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={chatLoading || regenerating || messages.length < 2}
                className="shrink-0 border-[#d4af37]/40 text-[#d4af37]"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-gray-500">
                {activeDoc
                  ? `Modalità documento: ${activeDoc.filename}`
                  : 'Modalità generale'}
              </span>
              {activeDoc && lastSuggestedDraft && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={applyToDraft}
                    className="bg-[#d4af37] text-[#0f172a] text-xs"
                  >
                    Applica alla bozza
                  </Button>
                  {prevDraftForUndo !== null && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={undoApply}
                      className="border-[#d4af37]/40 text-[#d4af37] text-xs"
                    >
                      Annulla applicazione
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: Documents */}
        <section className="rounded-xl border-2 border-[#d4af37]/30 bg-[#1e293b] p-4 sm:p-5">
          <h2 className="text-xl font-serif text-[#d4af37] mb-4">I tuoi documenti</h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cerca per nome file..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#d4af37]/30 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'processing', 'completed', 'error'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition',
                    filter === p
                      ? 'bg-[#d4af37] text-[#0f172a]'
                      : 'bg-[#0f172a]/50 text-gray-400 hover:text-white'
                  )}
                >
                  {p === 'all' ? 'Tutti' : p === 'processing' ? 'In lavorazione' : p === 'completed' ? 'Completati' : 'Errore'}
                </button>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="shrink-0 bg-[#d4af37] text-[#0f172a] hover:bg-[#b8941d]"
            >
              {uploading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Carica file</span>
            </Button>
          </div>

          {docsLoading && (
            <p className="text-gray-500 text-sm py-8 text-center">Caricamento...</p>
          )}
          {docsError && (
            <p className="text-red-400 text-sm py-4">{docsError}</p>
          )}

          {!docsLoading && filteredDocs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nessun documento salvato ancora.</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#d4af37] text-[#0f172a] hover:bg-[#b8941d]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Carica il primo file
              </Button>
            </div>
          )}

          {!docsLoading && filteredDocs.length > 0 && (
            <ul className="space-y-2">
              {filteredDocs.map((doc) => (
                <li
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className={cn(
                    'flex flex-wrap items-center gap-4 p-3 rounded-lg border cursor-pointer transition',
                    activeDoc?.id === doc.id
                      ? 'border-[#d4af37] bg-[#d4af37]/10'
                      : 'border-[#d4af37]/20 hover:bg-[#0f172a]/50'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{doc.filename}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(doc.created_at)} • {doc.mime_type?.split('/')[0] ?? 'file'}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs border',
                      getStatusBadgeClass(doc.ocr_status)
                    )}
                  >
                    {getStatusLabel(doc.ocr_status)}
                  </span>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(doc)}
                      className="text-[#d4af37] hover:bg-[#d4af37]/10"
                    >
                      <ExternalLink className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Apri</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Elimina</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Modal */}
      {modalDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={closeModal}
        >
          <div
            className="bg-[#1e293b] border-2 border-[#d4af37]/40 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/20">
              <h3 className="font-serif text-[#d4af37] truncate">{modalDoc.filename}</h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {modalDoc.ocr_text && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Testo OCR</p>
                  <pre className="text-sm text-gray-300 bg-[#0f172a] rounded p-3 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {modalDoc.ocr_text}
                  </pre>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-2">Bozza risposta</p>
                <textarea
                  value={modalDraft}
                  onChange={(e) => setModalDraft(e.target.value)}
                  className="w-full min-h-[120px] rounded-lg border border-[#d4af37]/30 bg-[#0f172a] text-white p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                  placeholder="Inserisci o modifica la bozza..."
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-4 border-t border-[#d4af37]/20">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={savingModal}
                className="border-[#d4af37]/40 text-[#d4af37]"
              >
                <Save className="h-4 w-4 mr-2" />
                Salva bozza
              </Button>
              <Button
                onClick={handleExportPdf}
                className="bg-[#d4af37] text-[#0f172a] hover:bg-[#b8941d]"
              >
                <FileText className="h-4 w-4 mr-2" />
                Esporta PDF DIN 5008
              </Button>
              <Button variant="ghost" onClick={handlePrint} className="text-gray-400">
                <Printer className="h-4 w-4 mr-2" />
                Stampa
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Case Modal */}
      {newCaseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setNewCaseModalOpen(false)}
        >
          <div
            className="bg-[#1e293b] border-2 border-[#d4af37]/40 rounded-xl max-w-md w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-serif text-[#d4af37] mb-4">
              {t('dashboard.newCase.title')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {t('case.title')} *
                </label>
                <input
                  type="text"
                  value={newCaseForm.title}
                  onChange={(e) =>
                    setNewCaseForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder={t('case.title')}
                  className="w-full rounded-lg border border-[#d4af37]/40 bg-[#0f172a] text-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {t('case.authority')}
                </label>
                <input
                  type="text"
                  value={newCaseForm.authority}
                  onChange={(e) =>
                    setNewCaseForm((f) => ({ ...f, authority: e.target.value }))
                  }
                  placeholder={t('case.authority')}
                  className="w-full rounded-lg border border-[#d4af37]/40 bg-[#0f172a] text-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {t('case.reference')}
                </label>
                <input
                  type="text"
                  value={newCaseForm.reference}
                  onChange={(e) =>
                    setNewCaseForm((f) => ({ ...f, reference: e.target.value }))
                  }
                  placeholder={t('case.reference')}
                  className="w-full rounded-lg border border-[#d4af37]/40 bg-[#0f172a] text-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {t('case.deadline')}
                </label>
                <input
                  type="date"
                  value={newCaseForm.deadline}
                  onChange={(e) =>
                    setNewCaseForm((f) => ({ ...f, deadline: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[#d4af37]/40 bg-[#0f172a] text-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setNewCaseModalOpen(false)}
                className="border-[#d4af37]/40 text-[#d4af37]"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleCreateCase}
                disabled={creatingCase || !newCaseForm.title.trim()}
                className="bg-[#d4af37] text-[#0f172a] hover:bg-[#b8941d]"
              >
                {creatingCase ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  t('common.create')
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Select Case Modal */}
      {selectCaseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setSelectCaseModalOpen(false)}
        >
          <div
            className="bg-[#1e293b] border-2 border-[#d4af37]/40 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-serif text-[#d4af37] p-4 border-b border-[#d4af37]/20">
              {t('dashboard.selectCase')}
            </h3>
            <ul className="overflow-y-auto p-4 space-y-2">
              {cases.slice(0, 20).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => handleSelectCase(c.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-lg border transition',
                      activeCaseId === c.id
                        ? 'border-[#d4af37] bg-[#d4af37]/10 text-white'
                        : 'border-[#d4af37]/20 text-gray-300 hover:bg-[#0f172a]/50'
                    )}
                  >
                    <span className="font-medium block">{c.title}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(c.created_at)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1e293b] border border-[#d4af37]/40 rounded-lg px-4 py-2 text-sm text-white shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
