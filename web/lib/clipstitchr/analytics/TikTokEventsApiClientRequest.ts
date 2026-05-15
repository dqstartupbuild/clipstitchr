import type { TikTokEventName } from "@/lib/clipstitchr/analytics/TikTokEventName";
import type { TikTokEventPayload } from "@/lib/clipstitchr/analytics/TikTokEventPayload";
import type { TikTokEventsApiUserIdentifiers } from "@/lib/clipstitchr/analytics/TikTokEventsApiUserIdentifiers";

export type TikTokEventsApiClientRequest = {
  event: TikTokEventName;
  eventId: string;
  eventTime?: number;
  page?: {
    referrer?: string;
    url?: string;
  };
  payload?: TikTokEventPayload;
  user?: TikTokEventsApiUserIdentifiers;
};
