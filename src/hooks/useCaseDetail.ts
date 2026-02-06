import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Case, Document } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export function useCaseDetail(caseId: string | undefined) {
  const { user } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCase = useCallback(async () => {
    if (!caseId || !user?.id) {
      setCaseData(null);
      setDocuments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: caseRes, error: caseErr } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .eq('user_id', user.id)
        .single();

      if (caseErr) throw caseErr;
      setCaseData(caseRes as Case);

      const { data: docs, error: docsErr } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (!docsErr) setDocuments((docs as Document[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore caricamento pratica');
      setCaseData(null);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [caseId, user?.id]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const updateCase = useCallback(
    async (updates: Partial<Case>): Promise<boolean> => {
      if (!caseId || !user?.id) return false;
      try {
        const { error: err } = await supabase
          .from('cases')
          .update(updates)
          .eq('id', caseId)
          .eq('user_id', user.id);

        if (err) throw err;
        setCaseData((prev) => (prev ? { ...prev, ...updates } : null));
        return true;
      } catch {
        return false;
      }
    },
    [caseId, user?.id]
  );

  return { caseData, documents, loading, error, updateCase, refetch: fetchCase };
}
