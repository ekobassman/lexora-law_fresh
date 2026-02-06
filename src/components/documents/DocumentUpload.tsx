import { useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload } from 'lucide-react';

interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
}

export function DocumentUpload({
  onFileSelect,
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  disabled = false,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload document
      </Button>
    </>
  );
}
