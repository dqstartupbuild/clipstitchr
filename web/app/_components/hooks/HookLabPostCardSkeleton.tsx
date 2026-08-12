export function HookLabPostCardSkeleton() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-xl bg-surface"
    >
      <div className="aspect-[9/12] animate-pulse bg-surface-muted" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-surface-muted" />
      </div>
    </div>
  );
}
