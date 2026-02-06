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
    <form onSubmit={handleSubmit} className="p-4 bg-graphite border-t-2 border-gold/20">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-navy/50 border-2 border-gold/30 rounded-lg px-4 py-3 text-ivory placeholder-ivory/50 focus:outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="bg-gold text-navy p-3 rounded-lg hover:bg-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
