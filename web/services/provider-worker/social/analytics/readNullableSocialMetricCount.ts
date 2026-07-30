export function readNullableSocialMetricCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}
