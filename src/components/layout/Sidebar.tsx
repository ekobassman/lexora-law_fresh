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
        'w-64 shrink-0 border-r-2 border-gold/20 bg-graphite p-4 flex flex-col',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-ivory">Pratiche</h3>
        {onNewCase && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNewCase}
            disabled={creating}
            className="border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60"
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
        <p className="text-sm text-ivory/60 py-4">Caricamento...</p>
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
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ivory/90 hover:bg-gold/10 hover:text-ivory border border-transparent hover:border-gold/20 transition-all',
                  id === c.id && 'bg-gold/20 text-ivory font-medium border-gold/30'
                )}
              >
                <FileText className="h-4 w-4 shrink-0 text-gold" />
                <span className="truncate">{c.title}</span>
              </Link>
            </li>
          ))}
      </ul>

      {!loading && cases.length === 0 && !error && (
        <p className="text-sm text-ivory/60 py-4">
          Nessuna pratica. Clicca + per crearne una.
        </p>
      )}
    </aside>
  );
}
