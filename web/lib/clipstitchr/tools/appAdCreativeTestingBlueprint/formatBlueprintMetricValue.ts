export function formatBlueprintMetricValue(value: number | null): string {
  return value === null ? "Not supplied" : value.toLocaleString();
}
