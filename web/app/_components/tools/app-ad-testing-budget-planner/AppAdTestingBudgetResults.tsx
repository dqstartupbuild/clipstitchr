import { ToolMetricCard } from "@/app/_components/tools/ToolMetricCard";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppAdTestingBudgetResult } from "@/lib/clipstitchr/tools/appAdTestingBudget/AppAdTestingBudgetResult";
import { formatUsd } from "@/lib/clipstitchr/tools/numbers/formatUsd";

type AppAdTestingBudgetResultsProps = {
  result: AppAdTestingBudgetResult;
};

export function AppAdTestingBudgetResults({
  result,
}: AppAdTestingBudgetResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <p className="text-xs font-bold uppercase text-accent-dark">
        Your entered allocation
      </p>
      <h2 className="mt-2 text-4xl font-bold text-text-primary">
        {formatUsd(result.mediaBudget)} for active media
      </h2>
      <p className="mt-3 leading-7 text-text-secondary">
        {result.mediaPercent.toFixed(1)}% remains after your production and
        reserve shares.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ToolMetricCard
          label="Production"
          value={formatUsd(result.productionBudget)}
          description={`${result.productionPercent.toFixed(1)}% of the entered total.`}
        />
        <ToolMetricCard
          label="Reserve"
          value={formatUsd(result.reserveBudget)}
          description={`${result.reservePercent.toFixed(1)}% intentionally unassigned.`}
        />
        <ToolMetricCard
          label="Media per active cell"
          value={
            result.mediaSpendPerActiveCell === null
              ? "Add cells"
              : formatUsd(result.mediaSpendPerActiveCell)
          }
          description="Even split across the active cell count."
        />
        <ToolMetricCard
          label="Cells meeting your floor"
          value={`${result.fundedActiveCellCount} of ${result.activeCellCount}`}
          description={`${result.backlogCellCount} additional cells remain in the backlog.`}
        />
      </div>
      <div
        className={`mt-6 rounded-lg border p-5 ${result.evidenceGap > 0 ? "border-amber-200 bg-amber-50" : "border-accent/25 bg-accent/10"}`}
      >
        <p className="font-bold text-text-primary">
          {result.evidenceGap > 0
            ? `${formatUsd(result.evidenceGap)} below your entered evidence floor`
            : "Your active cells fit the evidence floor you entered"}
        </p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Required media for all active cells:{" "}
          {formatUsd(result.requiredEvidenceSpend)}. This is a comparison with
          your rule, not a recommendation.
        </p>
      </div>
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        The planner does not recommend spend, predict results, set bids, or
        launch campaigns.
      </p>
    </Panel>
  );
}
