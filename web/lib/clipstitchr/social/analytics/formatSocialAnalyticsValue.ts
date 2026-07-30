export function formatSocialAnalyticsValue(
  value: number | null,
  showSign = false,
) {
  if (value === null) {
    return "Not available";
  }

  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(value);

  return showSign && value > 0 ? `+${formatted}` : formatted;
}
