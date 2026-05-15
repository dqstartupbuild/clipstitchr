import type { TikTokEventPayload } from "@/lib/clipstitchr/analytics/TikTokEventPayload";

type TikTokQueue = {
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

  window.ttq?.track?.(eventName, payload);
}
