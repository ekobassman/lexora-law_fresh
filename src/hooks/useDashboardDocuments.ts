import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export type DocStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DashboardDocument {
  id: string;
  filename: string;
  mime_type: string | null;
  ocr_status: DocStatus;
  created_at: string;
  updated_at: string;
  ocr_text?: string | null;
  draft_reply?: string | null;
  analysis_json?: unknown;
  storage_path?: string;
}

function mapStatus(s: string): DocStatus {
  if (s === 'done') return 'completed';
  if (s === 'error') return 'failed';
  return s as DocStatus;
}

export function useDashboardDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DashboardDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!user?.id) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('documents')
        .select('id, file_name, mime_type, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);

      if (err) throw err;
      setDocuments(
        (data ?? []).map((r) => ({
          id: r.id,
          filename: r.file_name ?? 'Senza nome',
          mime_type: r.mime_type,
          ocr_status: mapStatus(r.status ?? 'pending'),
          created_at: r.created_at,
          updated_at: r.updated_at,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore caricamento documenti');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const fetchFull = useCallback(
    async (id: string): Promise<DashboardDocument | null> => {
      if (!user?.id) return null;
      const { data, error: err } = await supabase
        .from('documents')
        .select('id, file_name, mime_type, status, ocr_text, draft_reply, analysis_json, path, created_at, updated_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (err || !data) return null;
      return {
        id: data.id,
        filename: data.file_name ?? 'Senza nome',
        mime_type: data.mime_type,
        ocr_status: mapStatus(data.status ?? 'pending'),
        created_at: data.created_at ?? '',
        updated_at: data.updated_at ?? '',
        ocr_text: data.ocr_text,
        draft_reply: data.draft_reply,
        analysis_json: data.analysis_json,
        storage_path: data.path,
      };
    },
    [user?.id]
  );

  const saveDraft = useCallback(
    async (id: string, draftReply: string): Promise<boolean> => {
      if (!user?.id) return false;
      const { error: err } = await supabase
        .from('documents')
        .update({ draft_reply: draftReply, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (err) return false;
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, updated_at: new Date().toISOString() } : d
        )
      );
      return true;
    },
    [user?.id]
  );

  const deleteDocument = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user?.id) return false;
      const { error: err } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (err) return false;
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      return true;
    },
    [user?.id]
  );

  return {
    documents,
    loading,
    error,
    refetch: fetchList,
    fetchFull,
    saveDraft,
    deleteDocument,
  };
}
