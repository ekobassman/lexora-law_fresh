import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Descrivi la tua situazione...',
}: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-[#0f172a] border-t border-[rgba(212,175,55,0.2)]">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-[#1e293b] border border-[rgba(212,175,55,0.3)] rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="bg-[#d4af37] text-[#0f172a] p-3 rounded-lg hover:bg-[#f4d03f] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
