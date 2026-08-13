import type { ProviderAnalyticsMetric } from "../provider-runtime/contracts/ProviderAnalyticsMetric.js";
import type { PublishingApiAnalyticsMetric } from "./PublishingApiAnalyticsMetric.js";

const DEFINITIONS = new Map<
  string,
  Readonly<{
    key: string;
    label: string;
    unit?: PublishingApiAnalyticsMetric["unit"];
    factor?: number;
  }>
>([
  ["views", { key: "views", label: "Views" }],
  ["view_count", { key: "views", label: "Views" }],
  ["reach", { key: "reach", label: "Reach" }],
  ["likes", { key: "likes", label: "Likes" }],
  ["like_count", { key: "likes", label: "Likes" }],
  ["comments", { key: "comments", label: "Comments" }],
  ["comment_count", { key: "comments", label: "Comments" }],
  ["shares", { key: "shares", label: "Shares" }],
  ["share_count", { key: "shares", label: "Shares" }],
  ["saved", { key: "saves", label: "Saves" }],
  ["saves", { key: "saves", label: "Saves" }],
  ["total_interactions", { key: "interactions", label: "Interactions" }],
  ["favorites", { key: "favorites", label: "Favorites" }],
  ["favorite_count", { key: "favorites", label: "Favorites" }],
  [
    "estimatedminuteswatched",
    {
      key: "watch_time",
      label: "Watch time",
      unit: "duration-seconds",
      factor: 60,
    },
  ],
  [
    "averageviewduration",
    {
      key: "average_view_duration",
      label: "Average view duration",
      unit: "duration-seconds",
    },
  ],
  [
    "averageviewpercentage",
    {
      key: "average_view_percentage",
      label: "Average viewed",
      unit: "percent",
    },
  ],
  ["subscribersgained", { key: "subscribers_gained", label: "Subscribers gained" }],
  ["subscriberslost", { key: "subscribers_lost", label: "Subscribers lost" }],
]);

export const normalizePublishingApiAnalyticsMetrics = (
  metrics: readonly ProviderAnalyticsMetric[],
): readonly PublishingApiAnalyticsMetric[] => {
  const values = new Map<string, PublishingApiAnalyticsMetric>();
  for (const metric of metrics) {
    const normalizedName = metric.name.trim().toLowerCase().replaceAll(" ", "_");
    const definition = DEFINITIONS.get(normalizedName);
    if (
      definition === undefined ||
      metric.value === undefined ||
      !Number.isFinite(metric.value) ||
      metric.value < 0
    ) {
      continue;
    }
    values.set(
      definition.key,
      Object.freeze({
        key: definition.key,
        label: definition.label,
        unit: definition.unit ?? "count",
        value: metric.value * (definition.factor ?? 1),
      }),
    );
  }
  return Object.freeze([...values.values()].slice(0, 100));
};
