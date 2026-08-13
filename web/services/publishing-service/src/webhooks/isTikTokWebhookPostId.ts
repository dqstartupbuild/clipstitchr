const TIKTOK_WEBHOOK_POST_ID_PATTERN = /^\d{1,32}$/u;

export const isTikTokWebhookPostId = (value: unknown): boolean =>
  (typeof value === "string" && TIKTOK_WEBHOOK_POST_ID_PATTERN.test(value)) ||
  (typeof value === "number" && Number.isSafeInteger(value) && value >= 0);
