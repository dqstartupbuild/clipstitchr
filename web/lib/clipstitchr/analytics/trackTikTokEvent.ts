import type { TikTokEventPayload } from "@/lib/clipstitchr/analytics/TikTokEventPayload";
import { getHasMarketingConsent } from "@/lib/clipstitchr/analytics/getHasMarketingConsent";

type TikTokQueue = {
  disableCookie?: () => void;
  enableCookie?: () => void;
  grantConsent?: () => void;
  revokeConsent?: () => void;
  track?: (eventName: string, payload?: TikTokEventPayload) => void;
};

declare global {
  interface Window {
    ttq?: TikTokQueue;
  }
}

export function trackTikTokEvent(
  eventName: string,
  payload?: TikTokEventPayload,
) {
  if (typeof window === "undefined") {
    return;
  }

  if (!getHasMarketingConsent()) {
    return;
  }

  window.ttq?.track?.(eventName, payload);
}
