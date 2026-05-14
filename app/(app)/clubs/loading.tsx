import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-16" />
      </div>
      <ul className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center gap-3 p-4 rounded-xl border bg-card"
          >
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
