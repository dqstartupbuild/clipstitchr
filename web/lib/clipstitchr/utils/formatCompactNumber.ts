export function formatCompactNumber(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return "";
  }

  return new Intl.NumberFormat("en", {
    compactDisplay: "short",
    notation: "compact",
  }).format(value);
}
