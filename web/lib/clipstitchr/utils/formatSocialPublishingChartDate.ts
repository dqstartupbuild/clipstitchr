export function formatSocialPublishingChartDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);

  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}
