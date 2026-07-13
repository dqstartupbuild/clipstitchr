import { ToolMetricCard } from "@/app/_components/tools/ToolMetricCard";
import { Panel } from "@/app/_components/ui/Panel";
import type { ClipStitchrSavingsResult } from "@/lib/clipstitchr/tools/clipStitchrSavings/ClipStitchrSavingsResult";
import { formatUsd } from "@/lib/clipstitchr/tools/numbers/formatUsd";

type ClipStitchrSavingsResultsProps = {
  result: ClipStitchrSavingsResult;
};

export function ClipStitchrSavingsResults({
  result,
}: ClipStitchrSavingsResultsProps) {
  const costsLess = result.costDifference >= 0;
  const takesLessTime = result.timeDifferenceHours >= 0;

  return (
    <Panel className="p-5 md:p-6">
      <p className="text-xs font-bold uppercase text-accent-dark">
        Your modeled monthly difference
      </p>
      <h2 className="mt-2 text-4xl font-bold text-text-primary">
        {formatUsd(Math.abs(result.costDifference))}{" "}
        {costsLess ? "less" : "more"}
      </h2>
      <p className="mt-3 leading-7 text-text-secondary">
        The entered {result.clipstitchrPlanName} scenario costs{" "}
        {formatUsd(result.modeledTotalCost)}
        versus {formatUsd(result.currentTotalCost)} in the entered current
        workflow.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ToolMetricCard
          label="Current cost per creative"
          value={
            result.currentCostPerCreative === null
              ? "Add output"
              : formatUsd(result.currentCostPerCreative)
          }
          description={`${result.currentMonthlyCreativeCount} current monthly creatives.`}
        />
        <ToolMetricCard
          label="Modeled cost per creative"
          value={
            result.modeledCostPerCreative === null
              ? "Add output"
              : formatUsd(result.modeledCostPerCreative)
          }
          description={`${result.modeledMonthlyCreativeCount} modeled monthly creatives.`}
        />
        <ToolMetricCard
          label="Current labor"
          value={`${result.currentLaborHours.toFixed(1)} hours`}
          description={`${formatUsd(result.currentLaborCost)} at the entered hourly cost.`}
        />
        <ToolMetricCard
          label="Modeled labor"
          value={`${result.modeledLaborHours.toFixed(1)} hours`}
          description={`${formatUsd(result.modeledLaborCost)} at the same hourly cost.`}
        />
        <ToolMetricCard
          label="Current footage use"
          value={
            result.currentFootageUtilizationPercent === null
              ? "Add inventory"
              : `${result.currentFootageUtilizationPercent.toFixed(1)}%`
          }
          description="Entered used clips divided by usable source clips."
        />
        <ToolMetricCard
          label="Modeled footage use"
          value={
            result.modeledFootageUtilizationPercent === null
              ? "Add inventory"
              : `${result.modeledFootageUtilizationPercent.toFixed(1)}%`
          }
          description="Modeled used clips divided by the same source inventory."
        />
      </div>
      <div className="mt-6 rounded-lg border border-accent/25 bg-accent/10 p-5">
        <p className="font-bold text-text-primary">
          {Math.abs(result.timeDifferenceHours).toFixed(1)} hours{" "}
          {takesLessTime ? "less" : "more"} in your scenario
        </p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Both scenarios include {formatUsd(result.monthlySourceFootageCost)} in
          source-footage cost. The modeled workflow includes the exact{" "}
          {formatUsd(result.clipstitchrMonthlyPrice)} monthly plan price.
        </p>
      </div>
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        These are user-entered scenarios, not guaranteed savings or output. The
        report does not include ad spend, revenue, or performance.
      </p>
    </Panel>
  );
}
