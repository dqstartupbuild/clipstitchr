export function normalizeAppMarketingCalendarValues(
  values: readonly string[],
  fallback: string,
) {
  const normalized = values.map((value) => value.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : [fallback];
}
