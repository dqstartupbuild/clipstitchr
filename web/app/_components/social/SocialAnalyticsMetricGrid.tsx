import type { SocialAnalyticsReport } from "@/lib/clipstitchr/social/types/SocialAnalyticsReport";
import { formatSocialAnalyticsValue } from "@/lib/clipstitchr/social/analytics/formatSocialAnalyticsValue";

type SocialAnalyticsMetricGridProps = {
  metrics: SocialAnalyticsReport["allProducts"]["metrics"];
  showSign: boolean;
};

const metricLabels = [
  ["views", "Views"],
  ["likes", "Likes"],
  ["comments", "Comments"],
  ["shares", "Shares"],
  ["saves", "Saves"],
] as const;

export function SocialAnalyticsMetricGrid({
  metrics,
  showSign,
}: SocialAnalyticsMetricGridProps) {
  return (
    <section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      aria-label="Analytics totals"
    >
      {metricLabels.map(([metric, label]) => {
        const summary = metrics[metric];

        return (
          <div key={metric} className="rounded-lg bg-surface p-4">
            <p className="text-sm font-semibold text-text-secondary">{label}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">
              {formatSocialAnalyticsValue(summary.value, showSign)}
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Available for {summary.availableCount} of {summary.totalCount}
            </p>
          </div>
        );
      })}
    </section>
  );
}
