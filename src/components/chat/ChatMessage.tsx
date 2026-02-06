import { cn } from '@/lib/utils';
import type { ChatMessage as Msg } from '@/types';
import { Scale } from 'lucide-react';

interface ChatMessageProps {
  message: Msg;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'hidden' : 'bg-[#d4af37]'
        )}
      >
        {!isUser && <Scale className="h-5 w-5 text-[#0f172a]" />}
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 border border-[rgba(212,175,55,0.2)]',
          isUser
            ? 'bg-[#d4af37] text-[#0f172a] font-medium rounded-tr-none ml-auto'
            : 'bg-[#1e293b] text-white rounded-tl-none'
        )}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-[#1e293b]" />
      )}
    </div>
  );
}
