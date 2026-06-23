function getPart(parts: Intl.DateTimeFormatPart[], type: string) {
  return parts.find((part) => part.type === type)?.value;
}

function getDateInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-iso8601-nu-latn", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const year = getPart(parts, "year");
  const month = getPart(parts, "month");
  const day = getPart(parts, "day");

  return year && month && day ? `${year}-${month}-${day}` : undefined;
}

export function getStitchrBatchDate(now: string, timeZone?: string) {
  const timestamp = Date.parse(now);

  if (!Number.isFinite(timestamp)) {
    throw new Error("Stitchr batch date requires a valid timestamp.");
  }

  const date = new Date(timestamp);
  const normalizedTimeZone = timeZone?.trim();

  if (normalizedTimeZone) {
    try {
      const timeZoneDate = getDateInTimeZone(date, normalizedTimeZone);

      if (timeZoneDate) {
        return timeZoneDate;
      }
    } catch {
      return date.toISOString().slice(0, 10);
    }
  }

  return date.toISOString().slice(0, 10);
}
