import type { ShortFormAuditResult } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditResult";

type ShortFormAuditPrioritiesProps = {
  result: ShortFormAuditResult;
};

export function ShortFormAuditPriorities({
  result,
}: ShortFormAuditPrioritiesProps) {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <div>
        <h3 className="text-lg font-bold text-text-primary">
          Lost-point priorities
        </h3>
        <ol className="mt-3 grid gap-3">
          {result.priorities.length > 0 ? (
            result.priorities.map((priority, index) => (
              <li
                className="rounded-lg border border-border bg-surface-elevated p-4"
                key={priority.dimension}
              >
                <p className="text-sm font-bold text-text-primary">
                  {index + 1}. {priority.label} · {priority.lostPoints} points
                </p>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {priority.action}
                </p>
              </li>
            ))
          ) : (
            <li className="text-sm leading-6 text-text-secondary">
              Every answer is at full points. Document what works and look for
              the next real bottleneck.
            </li>
          )}
        </ol>
      </div>
      <div>
        <h3 className="text-lg font-bold text-text-primary">Asset gaps</h3>
        <ul className="mt-3 grid gap-3">
          {result.assetGaps.length > 0 ? (
            result.assetGaps.map((gap) => (
              <li
                className="rounded-lg border border-border bg-surface-elevated p-4 text-sm leading-6 text-text-secondary"
                key={gap}
              >
                {gap}
              </li>
            ))
          ) : (
            <li className="text-sm leading-6 text-text-secondary">
              No asset gap was flagged by these self-reported answers.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
