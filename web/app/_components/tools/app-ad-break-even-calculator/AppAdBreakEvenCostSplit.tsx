import type { AppAdBreakEvenResult } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenResult";
import { formatUsd } from "@/lib/clipstitchr/tools/numbers/formatUsd";

type AppAdBreakEvenCostSplitProps = {
  result: AppAdBreakEvenResult;
};

export function AppAdBreakEvenCostSplit({
  result,
}: AppAdBreakEvenCostSplitProps) {
  return (
    <section className="mt-6">
      <h3 className="text-sm font-bold text-text-primary">
        Entered cost split
      </h3>
      <dl className="mt-3 divide-y divide-border rounded-lg border border-border">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-text-secondary">
            Media spend
            {result.mediaCostSharePercentage === null
              ? ""
              : ` (${result.mediaCostSharePercentage.toFixed(1)}%)`}
          </dt>
          <dd className="text-sm font-bold text-text-primary">
            {formatUsd(result.mediaSpend)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-text-secondary">
            Creative production
            {result.creativeCostSharePercentage === null
              ? ""
              : ` (${result.creativeCostSharePercentage.toFixed(1)}%)`}
          </dt>
          <dd className="text-sm font-bold text-text-primary">
            {formatUsd(result.creativeProductionCost)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
