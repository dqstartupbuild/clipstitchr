import type { TikTokIdentityPayload } from "@/lib/clipstitchr/analytics/TikTokIdentityPayload";
import type { TikTokEventName } from "@/lib/clipstitchr/analytics/TikTokEventName";
import type { TikTokEventPayload } from "@/lib/clipstitchr/analytics/TikTokEventPayload";
import type { TikTokEventsApiUserIdentifiers } from "@/lib/clipstitchr/analytics/TikTokEventsApiUserIdentifiers";
import { createTikTokEventId } from "@/lib/clipstitchr/analytics/createTikTokEventId";
import { getHasMarketingConsent } from "@/lib/clipstitchr/analytics/getHasMarketingConsent";
import { getTikTokPayloadEventId } from "@/lib/clipstitchr/analytics/getTikTokPayloadEventId";
import { trackTikTokEventsApiEvent } from "@/lib/clipstitchr/analytics/trackTikTokEventsApiEvent";

type TikTokQueue = {
  disableCookie?: () => void;
  enableCookie?: () => void;
  grantConsent?: () => void;
  identify?: (payload: TikTokIdentityPayload) => void;
  page?: () => void;
  revokeConsent?: () => void;
  track?: (eventName: string, payload?: TikTokEventPayload) => void;
};

declare global {
  interface Window {
    ttq?: TikTokQueue;
  }
}

type TrackTikTokEventOptions = {
  user?: TikTokEventsApiUserIdentifiers;
};

export function trackTikTokEvent(
  eventName: TikTokEventName,
  payload?: TikTokEventPayload,
  options: TrackTikTokEventOptions = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  if (!getHasMarketingConsent()) {
    return;
  }

  const eventPayload: TikTokEventPayload = {
    ...(payload ?? {}),
    event_id: getTikTokPayloadEventId(payload) ?? createTikTokEventId(eventName),
  };

  window.ttq?.track?.(eventName, eventPayload);
  trackTikTokEventsApiEvent(eventName, eventPayload, options);
}
