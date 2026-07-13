import type { CreativeTestingMetric } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingMetric";

export function formatCreativeTestingMetric(
  metric: CreativeTestingMetric,
  kind: "currency" | "percentage",
) {
  if (metric.value === null) {
    return `Unavailable: ${metric.unavailableReason}`;
  }

  return kind === "currency"
    ? `$${metric.value.toFixed(2)}`
    : `${metric.value.toFixed(2)}%`;
}
