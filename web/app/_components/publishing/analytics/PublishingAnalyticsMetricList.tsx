import type { PublishingAnalyticsMetric } from "@/lib/clipstitchr/publishing/client/contracts/PublishingAnalyticsMetric";
import { formatPublishingMetricValue } from "@/lib/clipstitchr/publishing/client/formatPublishingMetricValue";

type PublishingAnalyticsMetricListProps = {
  metrics: PublishingAnalyticsMetric[];
};

export function PublishingAnalyticsMetricList({
  metrics,
}: PublishingAnalyticsMetricListProps) {
  return (
    <dl className="publishing-analytics-metrics">
      {metrics.map((metric) => (
        <div key={metric.key}>
          <dt>{metric.label}</dt>
          <dd>{formatPublishingMetricValue(metric)}</dd>
        </div>
      ))}
    </dl>
  );
}
