import { addPublishingCalendarDays } from "@/lib/clipstitchr/publishing/client/schedule/addPublishingCalendarDays";

export function getPublishingWeekStart(date: string) {
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (!Number.isFinite(parsed.valueOf())) {
    return "";
  }
  const day = parsed.getUTCDay();
  return addPublishingCalendarDays(date, day === 0 ? -6 : 1 - day);
}
