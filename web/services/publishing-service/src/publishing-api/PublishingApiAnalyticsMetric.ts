export type PublishingApiAnalyticsMetric = Readonly<{
  key: string;
  label: string;
  unit: "count" | "duration-seconds" | "percent";
  value: number;
}>;
