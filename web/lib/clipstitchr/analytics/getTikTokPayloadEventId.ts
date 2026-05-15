import type { TikTokEventPayload } from "@/lib/clipstitchr/analytics/TikTokEventPayload";

export function getTikTokPayloadEventId(payload?: TikTokEventPayload) {
  const eventId = payload?.event_id;

  return typeof eventId === "string" && eventId ? eventId : null;
}
