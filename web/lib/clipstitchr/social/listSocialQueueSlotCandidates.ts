import { addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { SocialWeeklySlot } from "./types/SocialWeeklySlot";

export function listSocialQueueSlotCandidates({
  after,
  horizonDays,
  slots,
  timezone,
}: {
  after: string;
  horizonDays: number;
  slots: SocialWeeklySlot[];
  timezone: string;
}) {
  const afterDate = new Date(after);
  const localDate = formatInTimeZone(afterDate, timezone, "yyyy-MM-dd");
  const syntheticStart = new Date(`${localDate}T00:00:00.000Z`);
  const candidates: string[] = [];

  for (let dayOffset = 0; dayOffset <= horizonDays; dayOffset += 1) {
    const syntheticDate = addDays(syntheticStart, dayOffset);
    const dayOfWeek = syntheticDate.getUTCDay();
    const dateValue = formatInTimeZone(syntheticDate, "UTC", "yyyy-MM-dd");

    for (const slot of slots) {
      if (slot.dayOfWeek !== dayOfWeek) {
        continue;
      }

      const hours = Math.floor(slot.minuteOfDay / 60);
      const minutes = slot.minuteOfDay % 60;
      const localDateTime = `${dateValue}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
      const candidate = fromZonedTime(localDateTime, timezone);
      const roundTrip = formatInTimeZone(
        candidate,
        timezone,
        "yyyy-MM-dd'T'HH:mm:ss",
      );

      if (
        roundTrip === localDateTime &&
        candidate.getTime() > afterDate.getTime()
      ) {
        candidates.push(candidate.toISOString());
      }
    }
  }

  return candidates.sort((left, right) => Date.parse(left) - Date.parse(right));
}
