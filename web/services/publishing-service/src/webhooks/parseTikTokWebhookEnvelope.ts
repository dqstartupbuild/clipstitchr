import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import type { TikTokWebhookEnvelope } from "./TikTokWebhookEnvelope.js";

const ENVELOPE_KEYS = [
  "client_key",
  "content",
  "create_time",
  "event",
  "user_openid",
] as const;
const SAFE_TEXT_PATTERN = /^[^\u0000-\u001f\u007f\s]+$/u;

export const parseTikTokWebhookEnvelope = (
  value: unknown,
): TikTokWebhookEnvelope => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new PublishingServiceHttpError(400, "invalid_tiktok_webhook");
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  if (
    keys.length !== ENVELOPE_KEYS.length ||
    keys.some((key, index) => key !== ENVELOPE_KEYS[index])
  ) {
    throw new PublishingServiceHttpError(400, "invalid_tiktok_webhook");
  }

  const clientKey = record["client_key"];
  const content = record["content"];
  const createTime = record["create_time"];
  const event = record["event"];
  const userOpenId = record["user_openid"];
  if (
    typeof clientKey !== "string" ||
    clientKey.length < 1 ||
    clientKey.length > 256 ||
    !SAFE_TEXT_PATTERN.test(clientKey) ||
    typeof content !== "string" ||
    content.length < 2 ||
    content.length > 32_768 ||
    typeof createTime !== "number" ||
    !Number.isSafeInteger(createTime) ||
    createTime < 1 ||
    typeof event !== "string" ||
    event.length < 1 ||
    event.length > 128 ||
    !SAFE_TEXT_PATTERN.test(event) ||
    typeof userOpenId !== "string" ||
    userOpenId.length < 1 ||
    userOpenId.length > 256 ||
    !SAFE_TEXT_PATTERN.test(userOpenId)
  ) {
    throw new PublishingServiceHttpError(400, "invalid_tiktok_webhook");
  }

  return Object.freeze({
    clientKey,
    content,
    createTimeEpochSeconds: createTime,
    event,
    userOpenId,
  });
};
