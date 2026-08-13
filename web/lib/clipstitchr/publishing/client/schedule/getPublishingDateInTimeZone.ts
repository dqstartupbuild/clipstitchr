export function getPublishingDateInTimeZone(
  timeZone: string,
  instant = new Date(),
) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
    })
      .formatToParts(instant)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
