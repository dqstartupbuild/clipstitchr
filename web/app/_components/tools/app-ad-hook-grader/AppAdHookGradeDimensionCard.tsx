import type { AppAdHookGradeDimension } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGradeDimension";

type AppAdHookGradeDimensionCardProps = {
  dimension: AppAdHookGradeDimension;
};

export function AppAdHookGradeDimensionCard({
  dimension,
}: AppAdHookGradeDimensionCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-text-primary">
          {dimension.label}
        </h3>
        <span className="text-lg font-bold text-accent-dark">
          {dimension.score}
        </span>
      </div>
      <div
        aria-label={`${dimension.label}: ${dimension.score} out of 100`}
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"
        role="img"
      >
        <span
          className="block h-full rounded-full bg-accent"
          style={{ width: `${dimension.score}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        {dimension.reason}
      </p>
    </article>
  );
}
