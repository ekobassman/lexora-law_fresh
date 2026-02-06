import { useState, useCallback } from 'react';
import type { ChatMessage, ChatRole } from '@/types';

interface UseChatOptions {
  onSend?: (message: string) => Promise<string>;
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string, role: ChatRole = 'user') => {
      if (!content.trim()) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: '',
        user_id: '',
        role: 'user',
        content: content.trim(),
        attachment_type: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const reply = options.onSend
          ? await options.onSend(content)
          : 'Chat not connected.';
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          session_id: '',
          user_id: '',
          role: 'assistant',
          content: reply,
          attachment_type: null,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          session_id: '',
          user_id: '',
          role: 'assistant',
          content: 'An error occurred. Please try again.',
          attachment_type: null,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [options.onSend]
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, loading, sendMessage, clearMessages };
}
