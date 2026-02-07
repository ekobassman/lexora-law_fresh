/**
 * Unified Lexora chat: one component for Demo and Dashboard.
 * - demoMode: process-ocr for upload/scan, limited text replies (or "Sign in for full chat").
 * - dashboardMode: real API (dashboard-chat), full pipeline context, loading/errors/401.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardDocuments } from '@/hooks/useDashboardDocuments';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import {
  MessageCircle,
  Mic,
  Send,
  Camera,
  Paperclip,
  Loader2,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GOLD = '#d4af37';
const GOLD_DARK = '#b8962e';
const CREAM = '#f5f0e6';
const CREAM_INPUT = '#faf8f5';
const NAV_BG = '#0c182b';
const TEXT_DARK = '#3d3629';
const TEXT_MUTED = '#5c5548';

export interface LexoraChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LexoraChatResponse {
  ok: boolean;
  message?: string;
  caseId?: string;
  documentId?: string;
  ocrText?: string;
  analysis?: { risks?: unknown[]; deadlines?: unknown[] };
  draft?: { body: string; format: string };
  assistant_message?: string;
  suggested_draft?: string | null;
}

export interface LexoraChatProps {
  mode: 'demo' | 'dashboard';
  /** Pre-select document for context (dashboard only) */
  documentId?: string | null;
  /** Pre-select case (dashboard only) */
  caseId?: string | null;
  /** Initial user message to send on mount (e.g. from dashboard home) */
  initialMessage?: string | null;
  /** Show "Dashboard Chat (LIVE)" in header */
  showLiveBadge?: boolean;
  /** Compact layout (e.g. embedded in card) */
  compact?: boolean;
  /** Callback when document is uploaded from this chat (dashboard: set documentId) */
  onDocumentUploaded?: (docId: string) => void;
}

const CHAT_STORAGE_KEY = 'lexora_dashboard_chat_v1';

export function LexoraChat({
  mode,
  documentId: propDocumentId,
  caseId: propCaseId,
  initialMessage,
  showLiveBadge = false,
  compact = false,
  onDocumentUploaded,
}: LexoraChatProps) {
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    documents,
    refetch: refetchDocs,
    fetchFull,
  } = useDashboardDocuments();

  const stateMessage =
    (location.state as { initialMessage?: string } | null)?.initialMessage ??
    initialMessage ??
    null;

  const [messages, setMessages] = useState<LexoraChatMessage[]>(() => {
    if (mode === 'dashboard') {
      try {
        const raw = localStorage.getItem(CHAT_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(
    propDocumentId ?? null
  );
  const [activeCaseId] = useState<string | null>(propCaseId ?? null);
  const [uploading, setUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const documentId = propDocumentId ?? activeDocumentId;
  const caseId = propCaseId ?? activeCaseId;

  useEffect(() => {
    if (mode === 'dashboard' && messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch {}
    }
  }, [mode, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const callDashboardChatApi = useCallback(
    async (
      msgs: LexoraChatMessage[]
    ): Promise<LexoraChatResponse & { assistant_message?: string }> => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Unauthorized');

      const activeDoc =
        documentId && user
          ? await fetchFull(documentId)
          : null;
      const body: Record<string, unknown> = {
        mode: activeDoc ? 'document' : 'general',
        documentId: documentId ?? null,
        caseId: caseId ?? null,
        messages: msgs.map((m) => ({ role: m.role, content: m.content })),
      };
      if (activeDoc && body.mode === 'document') {
        body.context = {
          ocr_text: activeDoc.ocr_text ?? '',
          analysis_json: activeDoc.analysis_json ?? {},
          draft_reply: activeDoc.draft_reply ?? '',
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

      if (res.status === 401) {
        setSessionExpired(true);
        throw new Error('Invalid JWT');
      }
      if (!res.ok) {
        throw new Error(data?.error ?? 'Chat error');
      }
      return data as LexoraChatResponse & { assistant_message?: string };
    },
    [documentId, caseId, user, fetchFull]
  );

  // Send initial message on mount if provided (dashboard only)
  const initialSent = useRef(false);
  useEffect(() => {
    if (
      mode !== 'dashboard' ||
      !stateMessage?.trim() ||
      initialSent.current ||
      !user
    )
      return;
    initialSent.current = true;
    const userMsg: LexoraChatMessage = { role: 'user', content: stateMessage.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    callDashboardChatApi([userMsg])
      .then((res) => {
        const text =
          res.message ??
          res.assistant_message ??
          (res.ok ? '' : 'Error');
        if (text)
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: text },
          ]);
      })
      .catch((err: Error) => {
        if (err?.message?.includes('401') || err?.message?.toLowerCase().includes('jwt'))
          setSessionExpired(true);
        else setToast(err?.message ?? t('dashboard.chatError'));
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('dashboard.chatError') },
        ]);
      })
      .finally(() => setLoading(false));
  }, [mode, stateMessage, user, callDashboardChatApi, t]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: LexoraChatMessage = { role: 'user', content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    setToast(null);
    setSessionExpired(false);

    if (mode === 'demo') {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            t('chat.demo_sign_in') ??
            'Sign in to use the full Lexora chat and save documents.',
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const data = await callDashboardChatApi(newMsgs);
      const reply =
        data.message ??
        data.assistant_message ??
        '';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('dashboard.chatError');
      if (
        msg.includes('401') ||
        msg.toLowerCase().includes('jwt') ||
        msg.toLowerCase().includes('unauthorized')
      )
        setSessionExpired(true);
      else setToast(msg);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('dashboard.chatError') },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, mode, callDashboardChatApi, t]);

  const doUpload = useCallback(
    async (file: File) => {
      if (mode !== 'dashboard' || !user?.id) return;
      const isImage = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type);
      const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      setUploading(true);
      try {
        const { error: uploadErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { upsert: false });
        if (uploadErr) throw uploadErr;
        const { data: row, error: insertErr } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            bucket: STORAGE_BUCKET,
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
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }
          );
          if (!ocrErr && ocrData?.ok) {
            const analysis = ocrData.analysis ?? {};
            const draft =
              ocrData.draft_text ??
              `[Bozza]\n\n${(analysis as { fullText?: string }).fullText ?? ''}`;
            await supabase
              .from('documents')
              .update({
                ocr_text: (analysis as { fullText?: string }).fullText ?? ocrData.draft_text ?? '',
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
                error: ocrData?.error ?? ocrErr?.message ?? 'OCR failed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', row.id);
          }
        }
        await refetchDocs();
        setActiveDocumentId(row.id);
        onDocumentUploaded?.(row.id);
        setToast(t('dashboardNew.uploadSuccess'));
        setTimeout(() => setToast(null), 2500);
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [mode, user?.id, refetchDocs, onDocumentUploaded, t]
  );

  const handleCameraChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (file) doUpload(file);
    },
    [doUpload]
  );
  const handleUploadChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (file) doUpload(file);
    },
    [doUpload]
  );

  const activeDoc = documentId
    ? documents.find((d) => d.id === documentId)
    : null;

  return (
    <div
      className={cn(
        'flex flex-col',
        compact ? 'rounded-xl border-2' : 'min-h-[400px]'
      )}
      style={
        compact
          ? { backgroundColor: CREAM, borderColor: GOLD_DARK }
          : { backgroundColor: CREAM }
      }
    >
      {showLiveBadge && (
        <div
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-t-xl text-sm font-semibold"
          style={{ backgroundColor: GOLD_DARK, color: 'white' }}
        >
          <span>Dashboard Chat (LIVE)</span>
        </div>
      )}

      <div className={cn('flex flex-col flex-1 p-4', compact && 'p-3')}>
        {/* Session expired */}
        {sessionExpired && (
          <div
            className="mb-3 py-3 px-4 rounded-lg text-sm"
            style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}
          >
            <p className="font-medium">Session expired, please re-login.</p>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="mt-2 underline"
            >
              Go to login
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className="mb-3 py-2 px-3 rounded-lg text-sm"
            style={{ backgroundColor: NAV_BG, color: GOLD }}
          >
            {toast}
          </div>
        )}

        {/* Messages */}
        <div
          className={cn(
            'flex-1 overflow-y-auto space-y-3 mb-3 min-h-0',
            compact ? 'max-h-[220px]' : 'min-h-[200px] max-h-[320px]'
          )}
        >
          {messages.length === 0 && !stateMessage && (
            <div className="text-center py-6" style={{ color: TEXT_MUTED }}>
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-60" />
              <p className="text-sm">{t('dashboardRef.helloPrompt')}</p>
              <p className="text-xs mt-1">{t('dashboardRef.describePrompt')}</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-2',
                m.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {m.role === 'assistant' && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: GOLD_DARK }}
                >
                  <Scale className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'bg-[#d4af37] text-[#0f172a] rounded-tr-none'
                    : 'bg-[#e8e4d5] text-[#1e293b] rounded-tl-none border border-[#d4af37]/20'
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 justify-start">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: GOLD_DARK }}
              >
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div
                className="rounded-2xl rounded-tl-none px-4 py-2 text-sm flex items-center gap-2"
                style={{
                  backgroundColor: '#e8e4d5',
                  color: TEXT_MUTED,
                  border: '1px solid rgba(212,175,55,0.2)',
                }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input row */}
        <div
          className="flex items-center gap-2 rounded-full border-2 pl-3 pr-3 py-2 mb-3"
          style={{ backgroundColor: CREAM_INPUT, borderColor: GOLD_DARK }}
        >
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            aria-label="Microphone"
          >
            <Mic className="w-4 h-4" style={{ color: GOLD_DARK }} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={t('dashboardRef.writeHere')}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm px-2"
            style={{ color: TEXT_DARK }}
            disabled={loading || sessionExpired}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim() || sessionExpired}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50"
            style={{ backgroundColor: GOLD_DARK }}
            aria-label="Send"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Scan / Upload - dashboard only */}
        {mode === 'dashboard' && (
          <>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraChange}
              className="hidden"
              aria-hidden
            />
            <input
              ref={uploadInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,image/*"
              onChange={handleUploadChange}
              className="hidden"
              aria-hidden
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading || sessionExpired}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 min-h-[44px] text-sm font-medium disabled:opacity-50"
                style={{
                  backgroundColor: NAV_BG,
                  borderColor: GOLD_DARK,
                  color: GOLD,
                }}
              >
                <Camera className="w-4 h-4" />
                {t('dashboardRef.scanDocument')}
              </button>
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                disabled={uploading || sessionExpired}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 min-h-[44px] text-sm font-medium disabled:opacity-50"
                style={{
                  backgroundColor: NAV_BG,
                  borderColor: GOLD_DARK,
                  color: GOLD,
                }}
              >
                <Paperclip className="w-4 h-4" />
                {t('dashboardRef.uploadFile')}
              </button>
            </div>
            {activeDoc && (
              <p className="text-xs mt-2" style={{ color: TEXT_MUTED }}>
                {t('dashboard.chatModeDoc')}: {activeDoc.filename}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
