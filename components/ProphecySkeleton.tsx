import { Skeleton } from "./ui/skeleton";
export function ProphecySkeleton() {
  return (
    <div role="status" aria-label="Researching fixture" className="space-y-4">
      <p className="py-4 text-sm text-gold">
        Gathering the evidence. Opening the scroll.
      </p>
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="mb-5 h-7 w-2/3" />
          <Skeleton className="mb-3 h-3 w-full" />
          <Skeleton className="mb-3 h-3 w-5/6" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}
