import { tiktokPixelId } from "@/lib/clipstitchr/analytics/tiktokPixelId";

export function getTikTokEventsApiPixelId() {
  return process.env.TIKTOK_EVENTS_API_PIXEL_ID ?? tiktokPixelId;
}
