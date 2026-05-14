import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-4 space-y-4">
      <div className="p-4 rounded-xl border bg-card flex gap-4">
        <Skeleton className="w-16 h-24 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-2 w-full mt-3" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl border bg-card"
          >
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
