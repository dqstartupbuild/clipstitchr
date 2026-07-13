import { Trash2 } from "lucide-react";
import { CreativeTestingMetricCell } from "@/app/_components/tools/creative-testing-tracker/CreativeTestingMetricCell";
import { calculateCreativeTestingMetrics } from "@/lib/clipstitchr/tools/creativeTestingTracker/calculateCreativeTestingMetrics";
import type { CreativeTestingExperiment } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingExperiment";
import { creativeTestingChannels } from "@/lib/clipstitchr/tools/creativeTestingTracker/creativeTestingChannels";

type CreativeTestingExperimentRowProps = {
  canRemove: boolean;
  experiment: CreativeTestingExperiment;
  onChange: (experiment: CreativeTestingExperiment) => void;
  onRemove: () => void;
};

export function CreativeTestingExperimentRow({
  canRemove,
  experiment,
  onChange,
  onRemove,
}: CreativeTestingExperimentRowProps) {
  const metrics = calculateCreativeTestingMetrics(experiment);
  const updateNumber = (
    field: "clicks" | "conversions" | "impressions" | "installs" | "spend",
    value: string,
  ) => {
    const number = Number(value);
    onChange({
      ...experiment,
      [field]: Number.isFinite(number) ? Math.max(0, number) : 0,
    });
  };

  return (
    <tr>
      <td className="min-w-40 border-t border-border px-3 py-3 align-top">
        <select
          aria-label="Channel"
          className="h-10 w-full rounded-lg border border-border bg-surface px-2 text-sm font-semibold text-text-primary"
          value={experiment.channel}
          onChange={(event) =>
            onChange({
              ...experiment,
              channel: event.currentTarget
                .value as CreativeTestingExperiment["channel"],
            })
          }
        >
          {creativeTestingChannels.map((channel) => (
            <option key={channel}>{channel}</option>
          ))}
        </select>
      </td>
      {(["hook", "visual", "cta"] as const).map((field) => (
        <td
          className="min-w-48 border-t border-border px-3 py-3 align-top"
          key={field}
        >
          <input
            aria-label={
              field === "cta" ? "CTA" : field[0]?.toUpperCase() + field.slice(1)
            }
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
            maxLength={160}
            placeholder={
              field === "hook"
                ? "Opening line or angle"
                : field === "visual"
                  ? "First visual or demo"
                  : "Viewer next step"
            }
            value={experiment[field]}
            onChange={(event) =>
              onChange({ ...experiment, [field]: event.currentTarget.value })
            }
          />
        </td>
      ))}
      {(
        [
          ["spend", "Spend", "0.01"],
          ["impressions", "Impressions", "1"],
          ["clicks", "Clicks", "1"],
          ["installs", "Installs", "1"],
          ["conversions", "Conversions", "1"],
        ] as const
      ).map(([field, label, step]) => (
        <td
          className="min-w-32 border-t border-border px-3 py-3 align-top"
          key={field}
        >
          <input
            aria-label={label}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text-primary"
            min={0}
            max={1000000000}
            step={step}
            type="number"
            value={experiment[field]}
            onChange={(event) => updateNumber(field, event.currentTarget.value)}
          />
        </td>
      ))}
      <CreativeTestingMetricCell kind="percentage" metric={metrics.ctr} />
      <CreativeTestingMetricCell
        kind="percentage"
        metric={metrics.installRate}
      />
      <CreativeTestingMetricCell kind="currency" metric={metrics.cpi} />
      <CreativeTestingMetricCell kind="currency" metric={metrics.cpa} />
      <td className="border-t border-border px-3 py-3 align-top">
        <button
          aria-label="Remove experiment"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-red-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canRemove}
          onClick={onRemove}
          type="button"
        >
          <Trash2 aria-hidden className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
