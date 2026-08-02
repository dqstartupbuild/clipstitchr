export type PublishingAnalyticsMetric = {
  key: string;
  label: string;
  unit: "count" | "duration-seconds" | "percent";
  value: number;
};
