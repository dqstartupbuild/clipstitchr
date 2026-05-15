import type { TikTokEventsApiClientRequest } from "@/lib/clipstitchr/analytics/TikTokEventsApiClientRequest";
import { tiktokPixelId } from "@/lib/clipstitchr/analytics/tiktokPixelId";
import type { TikTokEventsApiPayload } from "@/lib/clipstitchr/server/analytics/TikTokEventsApiPayload";
import { createTikTokEventsApiProperties } from "@/lib/clipstitchr/server/analytics/createTikTokEventsApiProperties";
import { getServerCookieValue } from "@/lib/clipstitchr/server/analytics/getServerCookieValue";
import { getTikTokClickId } from "@/lib/clipstitchr/server/analytics/getTikTokClickId";
import { getTikTokEventsApiClientIp } from "@/lib/clipstitchr/server/analytics/getTikTokEventsApiClientIp";
import { hashTikTokEventsApiIdentifier } from "@/lib/clipstitchr/server/analytics/hashTikTokEventsApiIdentifier";

type CreateTikTokEventsApiPayloadOptions = {
  clientRequest: TikTokEventsApiClientRequest;
  cookieHeader: string | null;
  pixelId?: string;
  request: Request;
  testEventCode?: string | null;
};

function getEventTime(value: number | undefined) {
  if (!value || !Number.isFinite(value) || value <= 0) {
    return Math.floor(Date.now() / 1000);
  }

  return Math.floor(value);
}

export function createTikTokEventsApiPayload({
  clientRequest,
  cookieHeader,
  pixelId = tiktokPixelId,
  request,
  testEventCode,
}: CreateTikTokEventsApiPayloadOptions): TikTokEventsApiPayload {
  const pageUrl = clientRequest.page?.url;
  const user = {
    email: hashTikTokEventsApiIdentifier(clientRequest.user?.email),
    external_id: hashTikTokEventsApiIdentifier(clientRequest.user?.externalId),
    ip: getTikTokEventsApiClientIp(request),
    phone: hashTikTokEventsApiIdentifier(clientRequest.user?.phoneNumber),
    ttclid: getTikTokClickId({ cookieHeader, pageUrl }),
    ttp: getServerCookieValue(cookieHeader, "_ttp") ?? undefined,
    user_agent: request.headers.get("user-agent") ?? undefined,
  };
  const page = {
    referrer: clientRequest.page?.referrer || undefined,
    url: pageUrl || undefined,
  };
  const payload: TikTokEventsApiPayload = {
    data: [
      {
        event: clientRequest.event,
        event_id: clientRequest.eventId,
        event_time: getEventTime(clientRequest.eventTime),
        page: page.referrer || page.url ? page : undefined,
        properties: createTikTokEventsApiProperties(clientRequest.payload),
        user,
      },
    ],
    event_source: "web",
    event_source_id: pixelId,
  };

  if (testEventCode?.trim()) {
    payload.test_event_code = testEventCode.trim();
  }

  return payload;
}
