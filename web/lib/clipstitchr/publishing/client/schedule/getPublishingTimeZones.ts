import { getSupportedPublishingTimeZones } from "./getSupportedPublishingTimeZones";

export function getPublishingTimeZones(currentTimeZone: string) {
  const values = getSupportedPublishingTimeZones();
  return Array.from(new Set([currentTimeZone, ...values])).sort();
}
