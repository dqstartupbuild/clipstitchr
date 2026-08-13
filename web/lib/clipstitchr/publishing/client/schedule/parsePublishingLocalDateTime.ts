import type { PublishingLocalDateTimeParts } from "@/lib/clipstitchr/publishing/client/schedule/PublishingLocalDateTimeParts";

export function parsePublishingLocalDateTime(
  value: string,
): PublishingLocalDateTimeParts | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const [year, month, day, hour, minute] = match
    .slice(1)
    .map((part) => Number(part));
  const roundTrip = new Date(Date.UTC(year, month - 1, day, hour, minute));

  if (
    roundTrip.getUTCFullYear() !== year ||
    roundTrip.getUTCMonth() !== month - 1 ||
    roundTrip.getUTCDate() !== day ||
    roundTrip.getUTCHours() !== hour ||
    roundTrip.getUTCMinutes() !== minute
  ) {
    return null;
  }

  return { day, hour, minute, month, year };
}
