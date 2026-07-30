import {
  SOCIAL_ANALYTICS_METRIC_NAMES,
  type SocialAnalyticsMetricName,
} from "./SocialAnalyticsMetricName";

export function sumSocialAnalyticsMetricValues(
  values: Array<Record<SocialAnalyticsMetricName, number | null>>,
) {
  return Object.fromEntries(
    SOCIAL_ANALYTICS_METRIC_NAMES.map((metric) => {
      const available = values
        .map((set) => set[metric])
        .filter((value): value is number => value !== null);

      return [
        metric,
        {
          value:
            available.length > 0
              ? available.reduce((sum, value) => sum + value, 0)
              : null,
          availableCount: available.length,
          totalCount: values.length,
        },
      ];
    }),
  );
}
