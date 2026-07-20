import type { HookLabPostPerformanceAnalysis } from "@/lib/clipstitchr/types/HookLabPostPerformanceAnalysis";

export function HookLabPostScoreRow({
  performance,
}: {
  performance: HookLabPostPerformanceAnalysis;
}) {
  const scores = [
    ["Overall", performance.overallScore],
    ["Opening", performance.hookScore],
    ["Pacing", performance.pacingScore],
    ["Platform fit", performance.platformFitScore],
  ] as const;

  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {scores.map(([label, value]) => (
        <div key={label} className="border-t-2 border-border pt-3">
          <dt className="text-sm text-text-secondary">{label}</dt>
          <dd className="mt-1 text-3xl font-bold tracking-tight text-text-primary">
            {value}
            <span className="ml-1 text-sm font-medium text-text-tertiary">
              /100
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
