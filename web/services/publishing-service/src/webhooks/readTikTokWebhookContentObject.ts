import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

export const readTikTokWebhookContentObject = (
  content: string,
): Record<string, unknown> => {
  let value: unknown;
  try {
    value = JSON.parse(content) as unknown;
  } catch {
    throw new PublishingServiceHttpError(400, "invalid_tiktok_webhook");
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new PublishingServiceHttpError(400, "invalid_tiktok_webhook");
  }
  return value as Record<string, unknown>;
};
