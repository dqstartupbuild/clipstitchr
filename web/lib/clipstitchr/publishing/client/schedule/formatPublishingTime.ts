export function formatPublishingTime(value: string, timeZone: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.valueOf())) {
    return "Time unavailable";
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(date);
}
