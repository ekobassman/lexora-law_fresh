import { FileText } from 'lucide-react';
import type { Document } from '@/types';

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No documents yet.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
        >
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{doc.file_name ?? 'Document'}</span>
          <span className="ml-auto text-xs text-muted-foreground">{doc.status}</span>
        </li>
      ))}
    </ul>
  );
}
