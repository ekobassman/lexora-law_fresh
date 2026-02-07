import { useLocation } from 'react-router-dom';
import { LexoraChat } from '@/components/ai/LexoraChat';

/**
 * Dashboard "Explain" page: real chat (same as /dashboard/chat).
 * No fake static content; reuses LexoraChat with full pipeline.
 */
export function DashboardExplain() {
  const location = useLocation();
  const initialMessage = (location.state as { initialMessage?: string } | null)?.initialMessage ?? null;

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: '#f8f6f0' }}>
      <div className="px-4 pt-4 pb-6 flex-1 flex flex-col">
        <LexoraChat
          mode="dashboard"
          initialMessage={initialMessage}
          showLiveBadge
        />
      </div>
    </div>
  );
}
