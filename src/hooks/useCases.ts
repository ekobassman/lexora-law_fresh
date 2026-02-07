import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Case } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export function useCases() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    if (!user?.id) {
      setCases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (err) throw err;
      setCases((data as Case[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore caricamento pratiche');
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const createCase = useCallback(
    async (
      title: string,
      letterText?: string,
      draftResponse?: string,
      extra?: { authority?: string; aktenzeichen?: string; deadline?: string }
    ): Promise<Case | null> => {
      if (!user?.id) return null;
      try {
        const payload: Record<string, unknown> = {
          user_id: user.id,
          title: title || 'Nuova pratica',
          letter_text: letterText ?? null,
          draft_response: draftResponse ?? null,
          status: 'new',
        };
        if (extra?.authority != null) payload.authority = extra.authority;
        if (extra?.aktenzeichen != null) payload.aktenzeichen = extra.aktenzeichen;
        if (extra?.deadline != null) payload.deadline = extra.deadline;

        const { data, error: err } = await supabase
          .from('cases')
          .insert(payload)
          .select()
          .single();

        if (err) throw err;
        const newCase = data as Case;
        setCases((prev) => [newCase, ...prev]);
        return newCase;
      } catch {
        return null;
      }
    },
    [user?.id]
  );

  return { cases, loading, error, createCase, refetch: fetchCases };
}
