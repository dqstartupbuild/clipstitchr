import type { CreativeTestingMetric } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingMetric";
import { formatCreativeTestingMetric } from "@/lib/clipstitchr/tools/creativeTestingTracker/formatCreativeTestingMetric";

type CreativeTestingMetricCellProps = {
  kind: "currency" | "percentage";
  metric: CreativeTestingMetric;
};

export function CreativeTestingMetricCell({
  kind,
  metric,
}: CreativeTestingMetricCellProps) {
  return (
    <td className="min-w-36 border-t border-border px-3 py-3 align-top text-sm">
      {metric.value === null ? (
        <span className="block max-w-36 text-xs leading-5 text-text-tertiary">
          {metric.unavailableReason}
        </span>
      ) : (
        <span className="font-bold text-text-primary">
          {formatCreativeTestingMetric(metric, kind)}
        </span>
      )}
    </td>
  );
}
