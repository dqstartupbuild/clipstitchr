import type { TikTokEventName } from "@/lib/clipstitchr/analytics/TikTokEventName";
import type { TikTokEventPayload } from "@/lib/clipstitchr/analytics/TikTokEventPayload";
import type { TikTokEventsApiClientRequest } from "@/lib/clipstitchr/analytics/TikTokEventsApiClientRequest";
import type { TikTokEventsApiUserIdentifiers } from "@/lib/clipstitchr/analytics/TikTokEventsApiUserIdentifiers";

const allowedEvents = new Set<TikTokEventName>([
  "ClickButton",
  "Lead",
  "Purchase",
  "Search",
  "ViewContent",
]);

function getIsRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : undefined;
}

function getPage(value: unknown) {
  if (!getIsRecord(value)) {
    return undefined;
  }

  return {
    referrer: getString(value.referrer, 1000),
    url: getString(value.url, 1000),
  };
}

function getUser(value: unknown): TikTokEventsApiUserIdentifiers | undefined {
  if (!getIsRecord(value)) {
    return undefined;
  }

  return {
    email: getString(value.email, 320),
    externalId: getString(value.externalId, 200),
    phoneNumber: getString(value.phoneNumber, 40),
  };
}

function getPayload(value: unknown): TikTokEventPayload | undefined {
  if (!getIsRecord(value)) {
    return undefined;
  }

  return value as TikTokEventPayload;
}

export async function readTikTokEventsApiRequest(
  request: Request,
): Promise<TikTokEventsApiClientRequest> {
  const body = (await request.json()) as unknown;

  if (!getIsRecord(body)) {
    throw new Error("Invalid TikTok Events API request.");
  }

  const event = getString(body.event, 40) as TikTokEventName | undefined;
  const eventId = getString(body.eventId, 200);

  if (!event || !allowedEvents.has(event)) {
    throw new Error("Unsupported TikTok event.");
  }

  if (!eventId) {
    throw new Error("Missing TikTok event ID.");
  }

  return {
    event,
    eventId,
    eventTime:
      typeof body.eventTime === "number" && Number.isFinite(body.eventTime)
        ? body.eventTime
        : undefined,
    page: getPage(body.page),
    payload: getPayload(body.payload),
    user: getUser(body.user),
  };
}
