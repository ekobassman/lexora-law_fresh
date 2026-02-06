import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatDashboardProps {
  caseId?: string;
}

export function ChatDashboard({ caseId: _caseId }: ChatDashboardProps) {
  const { messages, loading, sendMessage } = useChat();

  return (
    <div className="rounded-2xl border-2 border-[#d4af37] bg-[#0f172a] p-4 sm:p-6 shadow-[0_0_40px_rgba(212,175,55,0.15)] overflow-hidden">
      <div className="flex flex-col min-h-[400px]">
        <div
          className="flex-1 overflow-y-auto rounded-lg min-h-[260px] mb-4 p-4 sm:p-6 space-y-4 bg-[#f5f0e6] border border-[#d4af37]/30"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {messages.length === 0 && (
            <p className="text-sm text-[#1e293b]/70 text-center py-12 font-display font-medium">
              Select a case or describe your situation.
            </p>
          )}
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d4af37]">
                <span className="animate-pulse text-[#0f172a] text-sm">...</span>
              </div>
              <div className="rounded-2xl rounded-tl-none bg-[#e8e4d5] border border-[#d4af37]/20 px-4 py-3 text-sm text-[#1e293b]">Thinking...</div>
            </div>
          )}
        </div>
        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  );
}
