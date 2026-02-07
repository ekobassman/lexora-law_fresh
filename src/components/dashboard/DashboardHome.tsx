import { useNavigate, Link } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardDocuments } from '@/hooks/useDashboardDocuments';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import {
  Lock,
  Mail,
  Scale,
  Brain,
  ChevronDown,
  FileText,
  MessageCircle,
  Mic,
  Send,
  Camera,
  Paperclip,
  Copy,
  Eye,
  Printer,
  Check,
} from 'lucide-react';
import { useCases } from '@/hooks/useCases';
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

/* Original luxury: cream (crema), not yellow. Same frames and sizes. */
const GOLD = '#d4af37';
const GOLD_DARK = '#b8962e';
const CONTENT_BG = '#f8f6f0';
const CARD_BG = '#ffffff';
const CREAM = '#f5f0e6';
const CREAM_INPUT = '#faf8f5';
const NAV_BG = '#0c182b';
const TEXT_DARK = '#3d3629';
const TEXT_MUTED = '#5c5548';

const cards = [
  { key: 'cardUrgent', icon: Lock, iconColor: '#7dd3fc' },
  { key: 'cardReadLetter', icon: Mail, iconColor: '#7dd3fc' },
  { key: 'cardObjection', icon: Scale, iconColor: '#c084fc' },
  { key: 'cardExplainDoc', icon: Brain, iconColor: '#86efac' },
] as const;

const SIX_ACTIONS = [
  { key: 'scanDocument' as const, icon: Camera },
  { key: 'uploadFile' as const, icon: Paperclip },
  { key: 'copyLetter' as const, icon: Copy },
  { key: 'preview' as const, icon: Eye },
  { key: 'print' as const, icon: Printer },
  { key: 'email' as const, icon: Mail },
] as const;

const PLANS = [
  { id: 'starter' as const, price: '3,99', casesKey: 'upTo10Cases', f1: 'starterF1', f2: 'starterF2', f3: 'starterF3', badgeGold: false },
  { id: 'pro' as const, price: '9,99', casesKey: '10to50Cases', f1: 'proF1', f2: 'proF2', f3: 'proF3', badgeGold: true },
  { id: 'unlimited' as const, price: '19,99', casesKey: 'unlimitedCases', f1: 'unlimitedF1', f2: 'unlimitedF2', f3: 'unlimitedF3', badgeGold: false },
] as const;

export function DashboardHome() {
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cases } = useCases();
  const { refetch } = useDashboardDocuments();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const hasCases = cases.length > 0;

  const doUpload = useCallback(
    async (file: File) => {
      if (!user?.id) return;
      const isImage = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type);
      const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      setUploading(true);
      try {
        const { error: uploadErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: false });
        if (uploadErr) throw uploadErr;
        const { data: row, error: insertErr } = await supabase
          .from('documents')
          .insert({ user_id: user.id, bucket: STORAGE_BUCKET, path, file_name: file.name, mime_type: file.type, status: 'processing' })
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        if (isImage) {
          const reader = new FileReader();
          const imageBase64 = await new Promise<string>((res, rej) => {
            reader.onload = () => { const r = reader.result as string; res(r?.includes(',') ? r.split(',')[1] ?? '' : r ?? ''); };
            reader.onerror = rej;
            reader.readAsDataURL(file);
          });
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          const { data: ocrData, error: ocrErr } = await supabase.functions.invoke('process-ocr', {
            body: { imageBase64, mimeType: file.type },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (!ocrErr && ocrData?.ok) {
            const analysis = ocrData.analysis ?? {};
            const draft = ocrData.draft_text ?? `[Bozza]\n\n${analysis.fullText ?? ''}`;
            await supabase.from('documents').update({
              ocr_text: analysis.fullText ?? ocrData.draft_text ?? '',
              analysis_json: analysis,
              draft_reply: draft,
              status: 'completed',
              updated_at: new Date().toISOString(),
            }).eq('id', row.id);
          } else {
            await supabase.from('documents').update({
              status: 'failed',
              error: ocrData?.error ?? ocrErr?.message ?? 'OCR failed',
              updated_at: new Date().toISOString(),
            }).eq('id', row.id);
          }
        }
        await refetch();
        setToast(t('dashboardNew.uploadSuccess'));
        setTimeout(() => setToast(null), 2500);
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [user?.id, refetch, t]
  );

  const handleCameraChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) doUpload(file);
  }, [doUpload]);

  const handleUploadChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) doUpload(file);
  }, [doUpload]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) setSelectOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendChat = () => {
    if (chatInput.trim()) navigate('/dashboard/explain', { state: { initialMessage: chatInput.trim() } });
  };

  return (
    <div className="min-h-full" style={{ backgroundColor: CONTENT_BG }}>
      <div className="px-4 pt-6 pb-6">
        {/* Title */}
        <h1
          className="text-center text-2xl font-bold tracking-wide uppercase mb-4"
          style={{ color: GOLD, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t('dashboardRef.title')}
        </h1>

        {/* Vorgang auswählen */}
        <div className="relative mb-4" ref={selectRef}>
          <button
            type="button"
            onClick={() => setSelectOpen(!selectOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left"
            style={{
              backgroundColor: CREAM,
              borderColor: GOLD_DARK,
              color: TEXT_DARK,
            }}
          >
            <span className="text-sm">{t('dashboardRef.selectProcess')}</span>
            <ChevronDown
              className={cn('w-5 h-5 transition', selectOpen && 'rotate-180')}
              style={{ color: GOLD_DARK }}
            />
          </button>
          {selectOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-1 rounded-xl border shadow-lg py-2 z-50 max-h-56 overflow-auto"
              style={{ backgroundColor: CARD_BG, borderColor: GOLD_DARK }}
            >
              {!hasCases ? (
                <div className="px-4 py-3 text-sm" style={{ color: TEXT_MUTED }}>
                  {t('dashboardRef.noProcesses')}
                </div>
              ) : (
                cases.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-black/5"
                    style={{ color: TEXT_DARK }}
                    onClick={() => setSelectOpen(false)}
                  >
                    {c.title || c.aktenzeichen || c.id}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Hidden: Scan → camera, Upload → files/gallery */}
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

        {/* Luxury chat card - cream background, gold frame, same sizes */}
        <div
          className="rounded-2xl border-2 p-0 mb-4 overflow-hidden shadow-md"
          style={{ backgroundColor: CREAM, borderColor: GOLD }}
        >
          {/* Gold header strip */}
          <div
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-t-[14px]"
            style={{ backgroundColor: GOLD_DARK }}
          >
            <span className="opacity-90">✨</span>
            <h2 className="font-bold text-sm text-white">
              {t('dashboardRef.explainTitle')}
            </h2>
            <MessageCircle className="w-4 h-4 shrink-0 text-white" />
          </div>
          <div className="p-5">
            <div className="flex flex-col items-center text-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-3 border-2"
                style={{ backgroundColor: CREAM_INPUT, borderColor: GOLD_DARK }}
              >
                <MessageCircle className="w-8 h-8" style={{ color: GOLD_DARK }} />
              </div>
              <p className="font-medium text-sm mb-1" style={{ color: TEXT_DARK }}>
                {t('dashboardRef.helloPrompt')}
              </p>
              <p className="text-sm italic" style={{ color: TEXT_MUTED }}>
                {t('dashboardRef.describePrompt')}
              </p>
            </div>
            {/* Input row - cream */}
            <div
              className="flex items-center gap-2 rounded-full border-2 pl-3 pr-3 py-2.5 mb-4"
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
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder={t('dashboardRef.writeHere')}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm px-2"
              style={{ color: TEXT_DARK }}
            />
            <button
              type="button"
              onClick={handleSendChat}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: GOLD_DARK }}
              aria-label="Send"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          {/* Two primary buttons: Scan → camera, Upload → files/gallery. Same size, same frame. */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 min-h-[48px]"
              style={{ backgroundColor: NAV_BG, borderColor: GOLD_DARK, color: GOLD }}
              aria-label={t('dashboardRef.scanDocument')}
            >
              <Camera className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{t('dashboardRef.scanDocument')}</span>
            </button>
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 min-h-[48px]"
              style={{ backgroundColor: NAV_BG, borderColor: GOLD_DARK, color: GOLD }}
              aria-label={t('dashboardRef.uploadFile')}
            >
              <Paperclip className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{t('dashboardRef.uploadFile')}</span>
            </button>
          </div>
          {/* 6 action buttons - Scan/Upload open camera or file picker */}
          <div className="grid grid-cols-2 gap-2">
            {SIX_ACTIONS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'scanDocument') cameraInputRef.current?.click();
                  else if (key === 'uploadFile') uploadInputRef.current?.click();
                }}
                className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border-2 min-h-[56px]"
                style={{ backgroundColor: NAV_BG, borderColor: GOLD_DARK, color: '#fff' }}
              >
                <Icon className="w-5 h-5" style={{ color: GOLD }} />
                <span className="text-xs font-medium">{t(`dashboardRef.${key}`)}</span>
              </button>
            ))}
          </div>
          </div>
        </div>

        {/* Your legal matters + 4 cards */}
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: TEXT_DARK, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t('dashboardRef.yourProcesses')}
        </h2>
        <p className="text-sm mb-4" style={{ color: TEXT_MUTED }}>
          {t('dashboardRef.manageSubtitle')}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {cards.map(({ key, icon: Icon, iconColor }) => (
            <button
              key={key}
              type="button"
              onClick={() => key === 'cardExplainDoc' && navigate('/dashboard/explain')}
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-[#e5e2dd] shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37]/50"
              style={{ backgroundColor: CARD_BG, color: TEXT_DARK }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg mb-3"
                style={{ backgroundColor: `${iconColor}20` }}
              >
                <Icon className="w-6 h-6" style={{ color: iconColor }} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-center">{t(`dashboardRef.${key}`)}</span>
            </button>
          ))}
        </div>

        {/* Empty state when no cases */}
        {!hasCases && (
          <div
            className="mb-8 flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed text-center"
            style={{ backgroundColor: CARD_BG, borderColor: '#d3d3d3' }}
          >
            <div className="w-16 h-16 flex items-center justify-center mb-4" style={{ color: '#9ca3af' }}>
              <FileText className="w-12 h-12" strokeWidth={1.2} />
            </div>
            <p className="font-semibold mb-2" style={{ color: TEXT_DARK }}>
              {t('dashboardRef.noProcesses')}
            </p>
            <p className="text-sm mb-4" style={{ color: TEXT_MUTED }}>
              {t('dashboardRef.startNewProcess')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard/new')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: GOLD }}
            >
              {t('dashboardShell.upload')}
            </button>
          </div>
        )}

        {/* Support section + Monthly plan cards */}
        <div className="text-center mb-6">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: TEXT_DARK, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t('dashboardRef.needMoreSupport')}
          </h3>
          <p className="text-sm text-left max-w-xl mx-auto leading-relaxed mb-6" style={{ color: TEXT_MUTED }}>
            {t('dashboardRef.supportParagraph')}
          </p>
        </div>

        {/* Monthly plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
              style={{ borderColor: '#e5e2dd' }}
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                style={{
                  backgroundColor: plan.badgeGold ? `${GOLD}30` : '#e5e7eb',
                  color: TEXT_DARK,
                }}
              >
                {t(`dashboardRef.${plan.id}`)}
              </span>
              <p className="text-2xl font-bold mb-0.5" style={{ color: TEXT_DARK }}>
                {plan.price}€<span className="text-sm font-normal" style={{ color: TEXT_MUTED }}>{t('dashboardRef.perMonth')}</span>
              </p>
              <p className="text-xs mb-3" style={{ color: TEXT_MUTED }}>
                {t(`dashboardRef.${plan.casesKey}`)}
              </p>
              <ul className="space-y-1.5 mb-4 text-left">
                <li className="flex items-center gap-2 text-xs" style={{ color: TEXT_DARK }}>
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                  {t(`dashboardRef.${plan.f1}`)}
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: TEXT_DARK }}>
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                  {t(`dashboardRef.${plan.f2}`)}
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: TEXT_DARK }}>
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                  {t(`dashboardRef.${plan.f3}`)}
                </li>
              </ul>
              <Link
                to="/pricing"
                className="block w-full py-2 rounded-lg text-center text-sm font-medium border"
                style={{ backgroundColor: CARD_BG, borderColor: '#e5e2dd', color: TEXT_DARK }}
              >
                {t('dashboardRef.selectPlan')}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs mb-2" style={{ color: TEXT_MUTED }}>
          {t('dashboardRef.pricesLocalCurrency')}
        </p>
        <p className="text-center mb-6">
          <Link to="/pricing" className="text-sm underline" style={{ color: '#2563eb' }}>
            {t('dashboardRef.comparePlans')}
          </Link>
        </p>
      </div>

      {/* Footer pill */}
      <div className="px-4 pb-8 flex justify-center">
        <a
          href="https://lexora-law.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-full text-sm text-white no-underline"
          style={{ backgroundColor: '#282828' }}
        >
          {t('dashboardRef.lexoraWebsite')}
        </a>
      </div>

      {/* Toast: upload success / error */}
      {toast && (
        <div
          className="fixed bottom-20 left-4 right-4 z-50 py-3 px-4 rounded-xl text-center text-sm font-medium shadow-lg"
          style={{ backgroundColor: NAV_BG, color: GOLD }}
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
