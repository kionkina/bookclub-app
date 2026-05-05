import type { ReadingProgress } from '@/lib/types';
import { UserAvatar } from '@/components/shared/UserAvatar';

interface Props {
  progress: ReadingProgress[];
  totalPages: number | null;
}

export function ProgressList({ progress, totalPages }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-sm">Member progress</h3>
      <div className="space-y-3">
        {progress.map((p) => {
          const name = p.profiles?.display_name || 'Member';
          const pct = totalPages ? Math.min(100, Math.round((p.current_page / totalPages) * 100)) : null;

          return (
            <div key={p.id} className="flex items-center gap-3">
              <UserAvatar name={name} avatarUrl={p.profiles?.avatar_url} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-xs text-muted-foreground">
                    pg {p.current_page}{totalPages ? ` / ${totalPages}` : ''}
                  </span>
                </div>
                {pct !== null && (
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
