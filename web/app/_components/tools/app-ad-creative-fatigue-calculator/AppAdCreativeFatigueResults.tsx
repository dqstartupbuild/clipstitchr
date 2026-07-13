import { ToolMetricCard } from "@/app/_components/tools/ToolMetricCard";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppAdCreativeFatigueResult } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/AppAdCreativeFatigueResult";

type AppAdCreativeFatigueResultsProps = {
  result: AppAdCreativeFatigueResult;
};

export function AppAdCreativeFatigueResults({
  result,
}: AppAdCreativeFatigueResultsProps) {
  const hasModel = result.modeledFrequencyInWindow !== null;

  return (
    <Panel className="p-5 md:p-6">
      <p className="text-xs font-bold uppercase text-accent-dark">
        Even-delivery model
      </p>
      <h2 className="mt-2 text-4xl font-bold text-text-primary">
        {hasModel
          ? `${result.modeledFrequencyInWindow?.toFixed(2)}x modeled frequency`
          : "Add an audience and impressions"}
      </h2>
      <p className="mt-3 leading-7 text-text-secondary">
        {hasModel
          ? `Across ${result.windowDays} days, assuming the entered impressions reach the audience evenly.`
          : "The model needs both values before it can divide delivery."}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ToolMetricCard
          label="Days to your ceiling"
          value={
            result.daysToFrequencyCeiling === null
              ? "Unavailable"
              : result.daysToFrequencyCeiling.toFixed(1)
          }
          description="Your ceiling divided by the modeled daily frequency."
        />
        <ToolMetricCard
          label="Impressions per creative"
          value={
            result.impressionsPerCreativeInWindow === null
              ? "Unavailable"
              : Math.round(
                  result.impressionsPerCreativeInWindow,
                ).toLocaleString("en-US")
          }
          description="Window impressions split evenly across active creatives."
        />
        <ToolMetricCard
          label="Per creative at ceiling"
          value={
            result.impressionsPerCreativeAtCeiling === null
              ? "Unavailable"
              : Math.round(
                  result.impressionsPerCreativeAtCeiling,
                ).toLocaleString("en-US")
          }
          description="Audience impressions at your threshold, split evenly."
        />
        <ToolMetricCard
          label="Window status"
          value={
            result.ceilingReachedWithinWindow
              ? "Ceiling crossed"
              : "Below ceiling"
          }
          description="A comparison with your entered threshold, not a refresh recommendation."
        />
      </div>
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        This arithmetic does not detect creative fatigue, predict results, or
        account for uneven platform delivery.
      </p>
    </Panel>
  );
}
