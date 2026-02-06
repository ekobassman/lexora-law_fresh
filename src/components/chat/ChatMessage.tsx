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
          isUser ? 'hidden' : 'bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold/40'
        )}
      >
        {!isUser && <Scale className="h-5 w-5 text-gold" />}
      </div>
      <div
        className={cn(
          'max-w-[80%] min-w-0 rounded-2xl px-4 py-3 border-2 overflow-visible',
          isUser
            ? 'bg-gold text-navy font-medium rounded-tr-none ml-auto border-gold/40'
            : 'bg-graphite text-ivory rounded-tl-none border-gold/20'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-graphite" />
      )}
    </div>
  );
}
