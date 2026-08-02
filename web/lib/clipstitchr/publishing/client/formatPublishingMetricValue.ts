import type { PublishingAnalyticsMetric } from "@/lib/clipstitchr/publishing/client/contracts/PublishingAnalyticsMetric";

export function formatPublishingMetricValue(metric: PublishingAnalyticsMetric) {
  if (metric.unit === "percent") {
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(metric.value)}%`;
  }
  if (metric.unit === "duration-seconds") {
    const totalSeconds = Math.round(metric.value);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }
  return new Intl.NumberFormat().format(metric.value);
}
