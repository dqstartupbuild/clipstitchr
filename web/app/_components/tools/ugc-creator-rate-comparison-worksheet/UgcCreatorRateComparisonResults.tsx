import { ToolMetricCard } from "@/app/_components/tools/ToolMetricCard";
import { UgcCreatorRateResultCard } from "@/app/_components/tools/ugc-creator-rate-comparison-worksheet/UgcCreatorRateResultCard";
import { Panel } from "@/app/_components/ui/Panel";
import { formatUsd } from "@/lib/clipstitchr/tools/numbers/formatUsd";
import type { UgcCreatorRateComparisonResult } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/UgcCreatorRateComparisonResult";

type UgcCreatorRateComparisonResultsProps = {
  result: UgcCreatorRateComparisonResult;
};

export function UgcCreatorRateComparisonResults({
  result,
}: UgcCreatorRateComparisonResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <p className="text-xs font-bold uppercase text-accent-dark">
        Your entered set
      </p>
      <h2 className="mt-2 text-3xl font-bold text-text-primary">
        {result.rows.length > 0
          ? `${result.rows.length} quotes normalized`
          : "Enter at least one priced quote"}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ToolMetricCard
          label="Median total"
          value={
            result.medianTotalCost === null
              ? "Unavailable"
              : formatUsd(result.medianTotalCost)
          }
          description="Median of only the quote totals entered above."
        />
        <ToolMetricCard
          label="Median per deliverable"
          value={
            result.medianCostPerDeliverable === null
              ? "Unavailable"
              : formatUsd(result.medianCostPerDeliverable)
          }
          description="Excludes rows without a deliverable count."
        />
        <ToolMetricCard
          label="Median per usable clip"
          value={
            result.medianCostPerUsableClip === null
              ? "Unavailable"
              : formatUsd(result.medianCostPerUsableClip)
          }
          description="Excludes rows without your usable-clip estimate."
        />
      </div>
      <div className="mt-6 grid gap-4">
        {result.rows.map((row) => (
          <UgcCreatorRateResultCard key={row.label} row={row} />
        ))}
      </div>
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        This is not a market benchmark, hiring recommendation, contract review,
        or legal advice. Compare scope and fit as well as normalized cost.
      </p>
    </Panel>
  );
}
