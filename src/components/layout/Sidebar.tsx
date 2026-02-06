import { Link, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  cases?: Array<{ id: string; title: string }>;
  className?: string;
}

export function Sidebar({ cases = [], className }: SidebarProps) {
  const { id } = useParams();

  return (
    <aside className={cn('w-64 border-r p-4', className)}>
      <h3 className="font-semibold mb-4">Cases</h3>
      <ul className="space-y-1">
        {cases.map((c) => (
          <li key={c.id}>
            <Link
              to={`/cases/${c.id}`}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent',
                id === c.id && 'bg-accent font-medium'
              )}
            >
              <FileText className="h-4 w-4 shrink-0" />
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
