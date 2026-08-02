import { parsePublishingLocalDateTime } from "@/lib/clipstitchr/publishing/client/schedule/parsePublishingLocalDateTime";

export function getPublishingScheduleOffsetOptions(
  localDateTime: string,
  timeZone: string,
) {
  const parts = parsePublishingLocalDateTime(localDateTime);
  if (!parts) {
    return [];
  }

  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      month: "2-digit",
      timeZone,
      year: "numeric",
    });
  } catch {
    return [];
  }

  const localEpoch = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );
  const matches: number[] = [];

  for (let offset = -840; offset <= 840; offset += 15) {
    const instant = new Date(localEpoch - offset * 60_000);
    const formatted = Object.fromEntries(
      formatter
        .formatToParts(instant)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );
    const formattedHour = formatted.hour === "24" ? "00" : formatted.hour;

    if (
      formatted.year === String(parts.year).padStart(4, "0") &&
      formatted.month === String(parts.month).padStart(2, "0") &&
      formatted.day === String(parts.day).padStart(2, "0") &&
      formattedHour === String(parts.hour).padStart(2, "0") &&
      formatted.minute === String(parts.minute).padStart(2, "0")
    ) {
      matches.push(offset);
    }
  }

  return matches;
}
