import { cn } from '@/lib/utils';
import type { ChatMessage as Msg } from '@/types';
import { Scale } from 'lucide-react';

interface ChatMessageProps {
  message: Msg;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2 min-w-0', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d4af37]">
          <Scale className="h-5 w-5 text-[#0f172a]" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] min-w-0 rounded-2xl px-4 py-3 overflow-visible',
          isUser
            ? 'bg-[#d4af37] text-[#0f172a] font-medium rounded-tr-none'
            : 'bg-[#e8e4d5] text-[#1e293b] rounded-tl-none border border-[#d4af37]/20'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
