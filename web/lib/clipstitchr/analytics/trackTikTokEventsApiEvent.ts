import type { TikTokEventName } from "@/lib/clipstitchr/analytics/TikTokEventName";
import type { TikTokEventPayload } from "@/lib/clipstitchr/analytics/TikTokEventPayload";
import type { TikTokEventsApiClientRequest } from "@/lib/clipstitchr/analytics/TikTokEventsApiClientRequest";
import type { TikTokEventsApiUserIdentifiers } from "@/lib/clipstitchr/analytics/TikTokEventsApiUserIdentifiers";
import { getHasMarketingConsent } from "@/lib/clipstitchr/analytics/getHasMarketingConsent";
import { getTikTokPayloadEventId } from "@/lib/clipstitchr/analytics/getTikTokPayloadEventId";

type TrackTikTokEventsApiEventOptions = {
  user?: TikTokEventsApiUserIdentifiers;
};

export function trackTikTokEventsApiEvent(
  event: TikTokEventName,
  payload: TikTokEventPayload,
  options: TrackTikTokEventsApiEventOptions = {},
) {
  if (typeof window === "undefined" || !getHasMarketingConsent()) {
    return;
  }

  const eventId = getTikTokPayloadEventId(payload);

  if (!eventId) {
    return;
  }

  const requestPayload: TikTokEventsApiClientRequest = {
    event,
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    page: {
      referrer: document.referrer || undefined,
      url: window.location.href,
    },
    payload,
    user: options.user,
  };

  void fetch("/api/analytics/tiktok/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestPayload),
    credentials: "same-origin",
    keepalive: true,
  });
}
