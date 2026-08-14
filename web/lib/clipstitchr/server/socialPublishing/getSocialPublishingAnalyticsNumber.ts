export function getSocialPublishingAnalyticsNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
