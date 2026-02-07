import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardDocuments } from '@/hooks/useDashboardDocuments';
import { Camera, Upload, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const GOLD = '#d4af37';
const CONTENT_BG = '#f5f2ee';
const CARD_BG = '#f8f7f4';
const TEXT_DARK = '#1a2b3c';
const TEXT_MUTED = '#555555';

export function DashboardNew() {
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refetch } = useDashboardDocuments();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const doUpload = useCallback(
    async (file: File) => {
      if (!user?.id) return;
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
                error: ocrData?.error ?? ocrErr?.message ?? 'OCR failed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', row.id);
          }
        }
        await refetch();
        setToast(t('dashboardNew.uploadSuccess'));
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [user?.id, refetch, navigate, t]
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

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: CONTENT_BG }}>
      <div className="px-4 pt-4 pb-8">
        {/* Back button - light beige, gold border */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border-2 mb-6 no-underline"
          style={{
            backgroundColor: CARD_BG,
            borderColor: GOLD,
            color: TEXT_DARK,
          }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: GOLD }} />
          <span className="font-medium">{t('dashboardNew.back')}</span>
        </Link>

        {/* Title - serif, dark */}
        <h1
          className="text-center text-2xl font-bold mb-2"
          style={{
            color: TEXT_DARK,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {t('dashboardNew.pageTitle')}
        </h1>
        <p
          className="text-center text-sm mb-8"
          style={{ color: GOLD }}
        >
          {t('dashboardNew.pageSubtitle')}
        </p>

        {/* Hidden inputs: camera (opens camera on mobile), file (opens file/gallery picker) */}
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

        {/* Card 1: Foto aufnehmen */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          aria-label={t('dashboardNew.camera.aria')}
          className={cn(
            'w-full block text-left rounded-2xl border-2 p-6 mb-6 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37]/50',
            uploading && 'opacity-70 pointer-events-none'
          )}
          style={{
            backgroundColor: CARD_BG,
            borderColor: GOLD,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <Camera className="w-12 h-12" style={{ color: GOLD }} />
            </div>
            <span
              className="text-lg font-bold block text-center mb-2"
              style={{ color: GOLD }}
            >
              {t('dashboardNew.takePhoto')}
            </span>
            <span
              className="text-sm text-center block"
              style={{ color: TEXT_MUTED }}
            >
              {t('dashboardNew.takePhotoDesc')}
            </span>
          </div>
        </button>

        {/* Card 2: Datei hochladen */}
        <button
          type="button"
          onClick={() => uploadInputRef.current?.click()}
          disabled={uploading}
          aria-label={t('dashboardNew.upload.aria')}
          className={cn(
            'w-full block text-left rounded-2xl border-2 p-6 mb-6 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37]/50',
            uploading && 'opacity-70 pointer-events-none'
          )}
          style={{
            backgroundColor: CARD_BG,
            borderColor: GOLD,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <Upload className="w-12 h-12" style={{ color: GOLD }} />
            </div>
            <span
              className="text-lg font-bold block text-center mb-2"
              style={{ color: GOLD }}
            >
              {t('dashboardNew.uploadFile')}
            </span>
            <span
              className="text-sm text-center block"
              style={{ color: TEXT_MUTED }}
            >
              {t('dashboardNew.uploadFileDesc')}
            </span>
          </div>
        </button>

        {/* Supported formats */}
        <p
          className="text-center text-sm"
          style={{ color: TEXT_MUTED }}
        >
          {t('dashboardNew.supportedFormats')}
        </p>
      </div>

      {/* Footer: legal links + copyright + website (second reference image) */}
      <footer className="mt-auto px-4 pt-8 pb-24" style={{ backgroundColor: CONTENT_BG }}>
        <div className="flex flex-col gap-3 text-sm mb-6" style={{ color: TEXT_MUTED }}>
          <Link to="/disclaimer" className="flex items-center gap-2 no-underline" style={{ color: TEXT_MUTED }}>
            <span className="text-base">🛡</span> {t('legal.disclaimerTitle')}
          </Link>
          <Link to="/privacy" className="flex items-center gap-2 no-underline" style={{ color: TEXT_MUTED }}>
            <span className="text-base">🛡</span> {t('legal.privacyTitle')}
          </Link>
          <Link to="/terms" className="flex items-center gap-2 no-underline" style={{ color: TEXT_MUTED }}>
            <span className="text-base">📄</span> {t('legal.termsTitle')}
          </Link>
          <Link to="/help" className="flex items-center gap-2 no-underline" style={{ color: TEXT_MUTED }}>
            <span className="text-base">🎧</span> {t('dashboardShell.support')}
          </Link>
          <Link to="/imprint" className="flex items-center gap-2 no-underline" style={{ color: TEXT_MUTED }}>
            <span className="text-base">⚖</span> {t('legal.imprintTitle')}
          </Link>
        </div>
        <p className="text-center text-sm mb-4" style={{ color: TEXT_DARK, fontFamily: "'Playfair Display', Georgia, serif" }}>
          LEXORA © 2026
        </p>
        <a
          href="https://lexora-law.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center py-3 px-6 rounded-full bg-white border border-[#e5e2dd] text-sm no-underline font-medium"
          style={{ color: TEXT_DARK }}
        >
          lexora-law.com
        </a>
      </footer>

      {toast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2 text-sm text-white shadow-lg z-50"
          style={{ backgroundColor: '#1e293b', border: `1px solid ${GOLD}40` }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
