import {
  TIKTOK_CONTENT_POSTING_WEBHOOK_EVENTS,
  type TikTokContentPostingWebhookEvent,
} from "./TikTokContentPostingWebhookEvent.js";

const CONTENT_POSTING_EVENT_SET = new Set<string>(
  TIKTOK_CONTENT_POSTING_WEBHOOK_EVENTS,
);

export const isTikTokContentPostingWebhookEvent = (
  value: string,
): value is TikTokContentPostingWebhookEvent =>
  CONTENT_POSTING_EVENT_SET.has(value);
