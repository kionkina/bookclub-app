import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-4 space-y-4">
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border bg-card space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
