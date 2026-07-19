export function formatHookLabMetric(value: number | undefined) {
  return value === undefined
    ? "Not available"
    : new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}
