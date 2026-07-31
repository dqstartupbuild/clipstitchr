export const SOCIAL_ANALYTICS_METRIC_NAMES = [
  "views",
  "reach",
  "likes",
  "comments",
  "shares",
  "saves",
  "watchTimeSeconds",
] as const;

export type SocialAnalyticsMetricName =
  (typeof SOCIAL_ANALYTICS_METRIC_NAMES)[number];
