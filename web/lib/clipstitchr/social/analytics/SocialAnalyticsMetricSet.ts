import type { SocialAnalyticsMetricName } from "./SocialAnalyticsMetricName";
import type { SocialAnalyticsMetricPoint } from "./SocialAnalyticsMetricPoint";

export type SocialAnalyticsMetricSet = Record<
  SocialAnalyticsMetricName,
  SocialAnalyticsMetricPoint
>;
