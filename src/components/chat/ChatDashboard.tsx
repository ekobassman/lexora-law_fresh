import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatDashboardProps {
  caseId?: string;
}

export function ChatDashboard({ caseId: _caseId }: ChatDashboardProps) {
  const { messages, loading, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ivory/50">
        {messages.length === 0 && (
          <p className="text-sm text-navy/60 text-center py-8 font-medium">
            Select a case or describe your situation.
          </p>
        )}
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold/40">
              <span className="animate-pulse text-gold text-sm">...</span>
            </div>
            <div className="rounded-xl bg-white border border-gold/20 px-4 py-3 text-sm text-navy/80 shadow-sm">Thinking...</div>
          </div>
        )}
      </div>
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}
