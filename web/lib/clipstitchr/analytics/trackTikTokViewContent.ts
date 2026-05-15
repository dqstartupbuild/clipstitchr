import { createTikTokViewContentPayload } from "@/lib/clipstitchr/analytics/createTikTokViewContentPayload";
import { trackTikTokEvent } from "@/lib/clipstitchr/analytics/trackTikTokEvent";

export function trackTikTokViewContent(pathname: string) {
  trackTikTokEvent("ViewContent", createTikTokViewContentPayload(pathname));
}
