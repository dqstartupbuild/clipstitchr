import type { SocialPublishingBestTimeSlot } from "@/lib/clipstitchr/types/SocialPublishingBestTimeSlot";

const weekdayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function getSocialPublishingBestTimeLabel(
  slot: SocialPublishingBestTimeSlot,
) {
  const date = new Date(Date.UTC(2026, 0, 5 + slot.dayOfWeek, slot.hour));
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    timeZone: "UTC",
  }).format(date);

  return `${weekdayNames[slot.dayOfWeek] ?? "Unknown day"}, ${time} UTC`;
}
