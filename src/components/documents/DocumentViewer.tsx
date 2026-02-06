import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  content: string;
  className?: string;
}

export function DocumentViewer({ content, className }: DocumentViewerProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-background p-6 whitespace-pre-wrap text-sm font-mono',
        className
      )}
    >
      {content || <span className="text-muted-foreground">No content</span>}
    </div>
  );
}
