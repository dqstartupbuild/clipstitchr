import {
  SOCIAL_ANALYTICS_METRIC_NAMES,
  type SocialAnalyticsMetricName,
} from "./SocialAnalyticsMetricName";
import type { SocialAnalyticsSnapshotLike } from "./SocialAnalyticsSnapshotLike";
import { getLatestSocialAnalyticsMetricSet } from "./getLatestSocialAnalyticsMetricSet";

export function getSocialAnalyticsGrowthMetricSet({
  platform,
  snapshots,
  rangeStart,
  rangeEnd,
}: {
  platform: "tiktok" | "instagram";
  snapshots: SocialAnalyticsSnapshotLike[];
  rangeStart: string;
  rangeEnd: string;
}) {
  const current = getLatestSocialAnalyticsMetricSet({
    platform,
    snapshots,
    capturedAtOrBefore: rangeEnd,
  });
  const baseline = getLatestSocialAnalyticsMetricSet({
    platform,
    snapshots,
    capturedAtOrBefore: rangeStart,
  });

  return Object.fromEntries(
    SOCIAL_ANALYTICS_METRIC_NAMES.map((metric) => {
      const currentPoint = current[metric as SocialAnalyticsMetricName];
      const baselinePoint = baseline[metric as SocialAnalyticsMetricName];
      const value =
        currentPoint.value !== null && baselinePoint.value !== null
          ? currentPoint.value - baselinePoint.value
          : null;

      return [
        metric,
        {
          value,
          currentValue: currentPoint.value,
          baselineValue: baselinePoint.value,
          capturedAt: currentPoint.capturedAt,
          baselineCapturedAt: baselinePoint.capturedAt,
          source: currentPoint.source,
        },
      ];
    }),
  );
}
