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
    <form onSubmit={handleSubmit}>
      <div className="bg-[#f5f5dc] rounded-full border-2 border-[#d4af37] flex items-center p-2 shadow-inner">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none px-4 text-[#1e293b] placeholder-[#999] min-w-0"
          style={{ fontSize: '16px' }}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className={value.trim() && !disabled
            ? 'w-10 h-10 rounded-full bg-[#d4af37] text-[#0f172a] hover:bg-[#f4d03f] flex items-center justify-center transition flex-shrink-0'
            : 'w-10 h-10 rounded-full bg-[#94a3b8] text-white cursor-not-allowed flex items-center justify-center flex-shrink-0 opacity-70'}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
