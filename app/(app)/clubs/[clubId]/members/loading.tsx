import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-4 space-y-3">
      <Skeleton className="h-4 w-24" />
      <ul className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl border bg-card"
          >
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </li>
        ))}
      </ul>
    </div>
  );
}
