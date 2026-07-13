import type { ShortFormAuditDimensionResult } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditDimensionResult";

type ShortFormAuditDimensionCardProps = {
  dimension: ShortFormAuditDimensionResult;
};

export function ShortFormAuditDimensionCard({
  dimension,
}: ShortFormAuditDimensionCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-text-primary">{dimension.label}</p>
        <p className="text-sm font-bold text-accent-dark">
          {dimension.score}/20
        </p>
      </div>
      <div
        aria-label={`${dimension.label}: ${dimension.score} out of 20`}
        className="mt-3 h-2 overflow-hidden rounded-full bg-border"
        role="img"
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${(dimension.score / 20) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-text-tertiary">
        {dimension.lostPoints} points still available
      </p>
    </div>
  );
}
