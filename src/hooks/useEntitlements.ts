import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import type { PlanType } from '@/types';

interface Entitlements {
  plan: PlanType;
  role: 'user' | 'admin';
  limits: { messages: number | null; cases: number | null };
  isAdmin: boolean;
  isPaid: boolean;
  isUnlimited: boolean;
}

const PLAN_LIMITS: Record<PlanType, { messages: number; cases: number }> = {
  free: { messages: 3, cases: 1 },
  starter: { messages: 15, cases: 10 },
  pro: { messages: 50, cases: 50 },
  unlimited: { messages: 999999, cases: 999999 },
};

export function useEntitlements(): Entitlements {
  const { user } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlements>({
    plan: 'free',
    role: 'user',
    limits: { messages: 3, cases: 1 },
    isAdmin: false,
    isPaid: false,
    isUnlimited: false,
  });

  useEffect(() => {
    if (!user) {
      setEntitlements({
        plan: 'free',
        role: 'user',
        limits: { messages: 3, cases: 1 },
        isAdmin: false,
        isPaid: false,
        isUnlimited: false,
      });
      return;
    }

    const fetchEntitlements = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, plan_override, is_admin')
        .eq('id', user.id)
        .single();

      const plan = (profile?.plan_override ?? profile?.plan ?? 'free') as PlanType;
      const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
      const isAdmin = profile?.is_admin ?? false;
      const isPaid = plan !== 'free';
      const isUnlimited = plan === 'unlimited';

      setEntitlements({
        plan,
        role: isAdmin ? 'admin' : 'user',
        limits: { messages: limits.messages, cases: limits.cases },
        isAdmin,
        isPaid,
        isUnlimited,
      });
    };

    fetchEntitlements();
  }, [user]);

  return entitlements;
}
