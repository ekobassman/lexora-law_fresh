import { Link, useParams } from 'react-router-dom';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Case } from '@/types';

interface SidebarProps {
  cases?: Case[];
  loading?: boolean;
  error?: string | null;
  onNewCase?: () => void;
  creating?: boolean;
  className?: string;
}

export function Sidebar({
  cases = [],
  loading = false,
  error = null,
  onNewCase,
  creating = false,
  className,
}: SidebarProps) {
  const { id } = useParams();

  return (
    <aside
      className={cn(
        'w-64 shrink-0 border-r border-navy-light bg-navy/30 p-4 flex flex-col',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Pratiche</h3>
        {onNewCase && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNewCase}
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground py-4">Caricamento...</p>
      )}
      {error && (
        <p className="text-sm text-destructive py-2">{error}</p>
      )}

      <ul className="space-y-1 flex-1 overflow-y-auto">
        {!loading &&
          cases.map((c) => (
            <li key={c.id}>
              <Link
                to={`/cases/${c.id}`}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-navy-light transition-colors',
                  id === c.id && 'bg-navy-light font-medium'
                )}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">{c.title}</span>
              </Link>
            </li>
          ))}
      </ul>

      {!loading && cases.length === 0 && !error && (
        <p className="text-sm text-muted-foreground py-4">
          Nessuna pratica. Clicca + per crearne una.
        </p>
      )}
    </aside>
  );
}
