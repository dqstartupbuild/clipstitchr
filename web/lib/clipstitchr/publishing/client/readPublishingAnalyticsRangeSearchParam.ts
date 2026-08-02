export function readPublishingAnalyticsRangeSearchParam(
  value: string | string[] | undefined,
) {
  return value === "7d" || value === "90d" ? value : "30d";
}
