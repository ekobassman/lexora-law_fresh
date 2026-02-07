import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardDocuments } from '@/hooks/useDashboardDocuments';
import { Camera, Upload, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ORNAMENT_SVG = (
  <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
    <path
      d="M0 60 Q30 20 60 60 Q90 100 120 60"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      opacity="0.4"
    />
    <path
      d="M20 100 Q50 60 80 100"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.3"
    />
    <path
      d="M60 0 Q100 30 60 60 Q20 90 60 120"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.25"
    />
    <path
      d="M0 30 Q40 50 60 30 Q80 10 120 30"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="none"
      opacity="0.35"
    />
    <path
      d="M10 10 Q50 50 90 10"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.2"
    />
  </svg>
);

export function DashboardNew() {
  const { t } = useTranslation();
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
    <div className="min-h-screen flex flex-col bg-[#f5f5f0]">
      {/* Top bar */}
      <header
        className="h-[84px] shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-[#d4af37]"
        style={{
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#d4af37] shrink-0">
            <span className="font-serif text-lg font-semibold text-[#d4af37]" style={{ fontFamily: 'Georgia, serif' }}>
              L
            </span>
          </div>
          <span className="font-serif text-2xl font-medium tracking-widest text-[#d4af37] uppercase">
            LEXORA
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full border border-[#d4af37]/60 text-[#d4af37]">
            <ChevronDown className="h-4 w-4" />
          </div>
          <Link
            to="/dashboard"
            className="p-2 rounded-full border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
            aria-label="User menu"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Background with ornaments */}
      <main
        className="flex-1 relative overflow-hidden flex flex-col items-center justify-center px-4 py-12 sm:py-16"
        style={{
          background: 'radial-gradient(ellipse at center, #f8f7f2 0%, #f5f5f0 50%, #e8e6df 100%)',
        }}
      >
        {/* Ornaments */}
        <div className="pointer-events-none absolute inset-0 text-[#d4af37]/50">
          <div className="absolute top-4 left-4 w-24 h-24 sm:w-32 sm:h-32 opacity-60 transform -scale-x-100">
            {ORNAMENT_SVG}
          </div>
          <div className="absolute top-4 right-4 w-24 h-24 sm:w-32 sm:h-32 opacity-60">
            {ORNAMENT_SVG}
          </div>
          <div className="absolute bottom-4 left-4 w-24 h-24 sm:w-32 sm:h-32 opacity-60 transform -scale-100">
            {ORNAMENT_SVG}
          </div>
          <div className="absolute bottom-4 right-4 w-24 h-24 sm:w-32 sm:h-32 opacity-60 transform scale-x-[-1]">
            {ORNAMENT_SVG}
          </div>
        </div>

        {/* Tiles */}
        <div className="relative z-10 w-full max-w-2xl mx-auto space-y-8 sm:space-y-12">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraChange}
            className="hidden"
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleUploadChange}
            className="hidden"
          />

          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            aria-label={t('dashboardNew.camera.aria')}
            className={cn(
              'w-full block group rounded-2xl overflow-hidden transition-all duration-200',
              'hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(212,175,55,0.25)]',
              'focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50'
            )}
          >
            <div
              className="relative rounded-2xl p-6 sm:p-10"
              style={{
                border: '3px solid #0f172a',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
                background: 'linear-gradient(180deg, #f8f7f2 0%, #f0eee6 100%)',
              }}
            >
              <div
                className="absolute inset-[3px] rounded-[13px] pointer-events-none"
                style={{ border: '2px solid #d4af37' }}
              />
              <div className="relative flex items-center justify-center min-h-[120px] sm:min-h-[160px]">
                <span className="sr-only">{t('dashboardNew.camera.aria')}</span>
                <Camera
                  className="w-20 h-20 sm:w-24 sm:h-24 text-[#d4af37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                  style={{
                    filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.5))',
                  }}
                />
              </div>
            </div>
          </button>

          <button
            onClick={() => uploadInputRef.current?.click()}
            disabled={uploading}
            aria-label={t('dashboardNew.upload.aria')}
            className={cn(
              'w-full block group rounded-2xl overflow-hidden transition-all duration-200',
              'hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(212,175,55,0.25)]',
              'focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50'
            )}
          >
            <div
              className="relative rounded-2xl p-6 sm:p-10"
              style={{
                border: '3px solid #0f172a',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
                background: 'linear-gradient(180deg, #f8f7f2 0%, #f0eee6 100%)',
              }}
            >
              <div
                className="absolute inset-[3px] rounded-[13px] pointer-events-none"
                style={{ border: '2px solid #d4af37' }}
              />
              <div className="relative flex items-center justify-center min-h-[120px] sm:min-h-[160px]">
                <span className="sr-only">{t('dashboardNew.upload.aria')}</span>
                <Upload
                  className="w-20 h-20 sm:w-24 sm:h-24 text-[#d4af37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                  style={{
                    filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.5))',
                  }}
                />
              </div>
            </div>
          </button>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1e293b] border border-[#d4af37]/40 rounded-lg px-4 py-2 text-sm text-white shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
