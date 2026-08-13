export function readPublishingCalendarDateSearchParam(
  value: string | string[] | undefined,
  fallback: string,
) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return fallback;
  }
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
    ? value
    : fallback;
}
