import type { AppUgcCostResult } from "@/lib/clipstitchr/tools/appUgcCostCalculator/AppUgcCostResult";
import { formatAppUgcCostUsd } from "@/lib/clipstitchr/tools/appUgcCostCalculator/formatAppUgcCostUsd";

type AppUgcCostBreakdownProps = {
  result: AppUgcCostResult;
};

export function AppUgcCostBreakdown({ result }: AppUgcCostBreakdownProps) {
  const rows = [
    ["Creator cost", result.creatorCost],
    ["Editing cost", result.editingCost],
    ["Revision cost", result.revisionCost],
    ["Internal coordination cost", result.internalCost],
  ] as const;

  return (
    <section className="mt-6">
      <h3 className="text-sm font-bold text-text-primary">Cost breakdown</h3>
      <dl className="mt-3 divide-y divide-border rounded-lg border border-border">
        {rows.map(([label, value]) => (
          <div
            className="flex items-center justify-between gap-4 px-4 py-3"
            key={label}
          >
            <dt className="text-sm text-text-secondary">{label}</dt>
            <dd className="text-sm font-bold text-text-primary">
              {formatAppUgcCostUsd(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
