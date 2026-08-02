import { parsePublishingLocalDateTime } from "@/lib/clipstitchr/publishing/client/schedule/parsePublishingLocalDateTime";

export function getPublishingScheduleEpochMilliseconds(
  localDateTime: string,
  utcOffsetMinutes: number,
) {
  const parts = parsePublishingLocalDateTime(localDateTime);
  if (!parts || !Number.isInteger(utcOffsetMinutes)) {
    return null;
  }
  return (
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
    ) -
    utcOffsetMinutes * 60_000
  );
}
