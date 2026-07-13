import { ToolMetricCard } from "@/app/_components/tools/ToolMetricCard";
import { Panel } from "@/app/_components/ui/Panel";
import type { ClientContentCapacityResult } from "@/lib/clipstitchr/tools/clientContentCapacity/ClientContentCapacityResult";

type ClientContentCapacityResultsProps = {
  result: ClientContentCapacityResult;
};

export function ClientContentCapacityResults({
  result,
}: ClientContentCapacityResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <p className="text-xs font-bold uppercase text-accent-dark">
        Modeled weekly capacity
      </p>
      <h2 className="mt-2 text-4xl font-bold text-text-primary">
        {result.weeklyDeliverableCapacity === null
          ? "Complete every stage"
          : `${result.weeklyDeliverableCapacity} deliverables`}
      </h2>
      <p className="mt-3 leading-7 text-text-secondary">
        {result.limitingStage === null
          ? "Every stage needs a non-zero effort estimate."
          : `${result.limitingStage.label} is the current limiting stage in your entered workflow.`}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ToolMetricCard
          label="Modeled client capacity"
          value={
            result.clientCapacity === null
              ? "Unavailable"
              : `${result.clientCapacity}`
          }
          description={`${result.deliverablesPerClientPerWeek} deliverables per client each week.`}
        />
        <ToolMetricCard
          label="Current utilization"
          value={
            result.utilizationPercent === null
              ? "Unavailable"
              : `${result.utilizationPercent.toFixed(1)}%`
          }
          description={`${result.currentClientCount} current clients against modeled capacity.`}
        />
        {result.stageResults.map((stage) => (
          <ToolMetricCard
            key={stage.key}
            label={`${stage.label} stage`}
            value={
              stage.deliverableCapacity === null
                ? "Needs effort"
                : `${Math.floor(stage.deliverableCapacity)} per week`
            }
            description={`${stage.effectiveHours.toFixed(1)} effective hours after the productive-time adjustment.`}
          />
        ))}
      </div>
      <div
        className={`mt-6 rounded-lg border p-5 ${result.isOverCapacity ? "border-amber-200 bg-amber-50" : "border-accent/25 bg-accent/10"}`}
      >
        <p className="font-bold text-text-primary">
          {result.weeklyDeliverableCapacity === null
            ? "Complete every stage to compare commitments."
            : result.isOverCapacity
              ? "Your entered commitments exceed modeled capacity."
              : "Your entered commitments fit the modeled capacity."}
        </p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Treat this as a planning baseline. Project complexity, rework, delays,
          and uneven client needs can change the real result.
        </p>
      </div>
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        This calculator is not a staffing guarantee, booking system, or hiring
        recommendation.
      </p>
    </Panel>
  );
}
