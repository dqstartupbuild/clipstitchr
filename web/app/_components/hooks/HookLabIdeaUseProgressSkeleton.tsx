export function HookLabIdeaUseProgressSkeleton() {
  return (
    <div
      aria-label="Loading current use progress"
      className="mt-4 rounded-lg border border-border bg-surface-muted p-3"
    >
      <div className="h-4 w-24 rounded bg-border" />
      <div className="mt-3 h-3 w-full rounded bg-border" />
      <div className="mt-2 h-10 w-full rounded bg-white" />
    </div>
  );
}
