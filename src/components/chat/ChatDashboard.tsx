import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatDashboardProps {
  caseId?: string;
}

export function ChatDashboard({ caseId: _caseId }: ChatDashboardProps) {
  const { messages, loading, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-[500px] rounded-xl border bg-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Select a case or describe your situation.
          </p>
        )}
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20">
              <span className="animate-pulse">...</span>
            </div>
            <div className="rounded-xl bg-muted px-4 py-3 text-sm">Thinking...</div>
          </div>
        )}
      </div>
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}
