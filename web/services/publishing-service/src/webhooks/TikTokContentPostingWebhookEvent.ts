export const TIKTOK_CONTENT_POSTING_WEBHOOK_EVENTS = [
  "post.publish.failed",
  "post.publish.complete",
  "post.publish.inbox_delivered",
  "post.publish.publicly_available",
  "post.publish.no_longer_publicaly_available",
] as const;

export type TikTokContentPostingWebhookEvent =
  (typeof TIKTOK_CONTENT_POSTING_WEBHOOK_EVENTS)[number];
