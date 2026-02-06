import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload } from 'lucide-react';

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  /** Abilita area drag & drop oltre al pulsante */
  dragDrop?: boolean;
}

export function DocumentUpload({
  onFileSelect,
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  disabled = false,
  dragDrop = true,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File troppo grande (max ${MAX_SIZE_MB}MB)`;
    }
    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      return 'Formato non supportato. Usa PDF, JPG, PNG o WebP.';
    }
    if (file.type === 'image/heic') {
      return 'HEIC non supportato. Converti in JPG/PNG.';
    }
    return null;
  };

  const handleFile = (file: File) => {
    setError(null);
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    onFileSelect(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(!disabled);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {dragDrop ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer
            transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gold/50'}
            ${dragOver ? 'border-gold bg-gold/10' : 'border-navy-light'}
          `}
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Trascina un file qui o clicca per caricare
          </p>
          <p className="text-xs text-muted-foreground">PDF, JPG, PNG, WebP (max {MAX_SIZE_MB}MB)</p>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="h-4 w-4 mr-2" />
          Carica documento
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
