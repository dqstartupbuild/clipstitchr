import {
  SOCIAL_ANALYTICS_METRIC_NAMES,
  type SocialAnalyticsMetricName,
} from "./SocialAnalyticsMetricName";
import type { SocialAnalyticsMetricSet } from "./SocialAnalyticsMetricSet";
import type { SocialAnalyticsSnapshotLike } from "./SocialAnalyticsSnapshotLike";

export function getLatestSocialAnalyticsMetricSet({
  platform,
  snapshots,
  capturedAtOrBefore,
}: {
  platform: "tiktok" | "instagram";
  snapshots: SocialAnalyticsSnapshotLike[];
  capturedAtOrBefore?: string;
}): SocialAnalyticsMetricSet {
  const eligible = snapshots
    .filter(
      (snapshot) =>
        !capturedAtOrBefore ||
        Date.parse(snapshot.capturedAt) <= Date.parse(capturedAtOrBefore),
    )
    .sort((left, right) => right.capturedAt.localeCompare(left.capturedAt));
  const official = eligible.find((snapshot) =>
    snapshot.source.endsWith("_official"),
  );
  const apify = eligible.find((snapshot) => snapshot.source === "apify_public");

  return Object.fromEntries(
    SOCIAL_ANALYTICS_METRIC_NAMES.map((metric) => {
      const sourceSnapshot =
        metric === "saves" && platform === "tiktok" ? apify : official;
      const value = sourceSnapshot?.[metric as SocialAnalyticsMetricName];

      return [
        metric,
        {
          value: typeof value === "number" ? value : null,
          capturedAt: sourceSnapshot?.capturedAt ?? null,
          source: sourceSnapshot?.source ?? null,
        },
      ];
    }),
  ) as SocialAnalyticsMetricSet;
}
