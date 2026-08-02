import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import type { ParsedTikTokWebhookContent } from "./ParsedTikTokWebhookContent.js";
import type { TikTokWebhookEnvelope } from "./TikTokWebhookEnvelope.js";
import { isTikTokContentPostingWebhookEvent } from "./isTikTokContentPostingWebhookEvent.js";

const PUBLISH_ID_PATTERN = /^[^\u0000-\u001f\u007f\s]{1,64}$/u;
const REASON_PATTERN = /^[A-Za-z0-9._-]{1,128}$/u;
const POST_ID_PATTERN = /^\d{1,32}$/u;
const PUBLISH_TYPES = new Set(["DIRECT_POST", "INBOX_SHARE"]);

const readContentObject = (content: string): Record<string, unknown> => {
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

const hasExactKeys = (
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean => {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return (
    actual.length === sortedExpected.length &&
    actual.every((key, index) => key === sortedExpected[index])
  );
};

const isPostId = (value: unknown): boolean =>
  (typeof value === "string" && POST_ID_PATTERN.test(value)) ||
  (typeof value === "number" && Number.isSafeInteger(value) && value >= 0);

export const parseTikTokWebhookContent = (
  envelope: TikTokWebhookEnvelope,
): ParsedTikTokWebhookContent => {
  const content = readContentObject(envelope.content);

  if (envelope.event === "authorization.removed") {
    if (
      !hasExactKeys(content, ["reason"]) ||
      typeof content["reason"] !== "number" ||
      !Number.isInteger(content["reason"]) ||
      content["reason"] < 0 ||
      content["reason"] > 5
    ) {
      throw new PublishingServiceHttpError(400, "invalid_tiktok_webhook");
    }
    return Object.freeze({ kind: "authorization-removed" });
  }

  if (!isTikTokContentPostingWebhookEvent(envelope.event)) {
    return Object.freeze({ kind: "ignored" });
  }

  const expectedKeys =
    envelope.event === "post.publish.failed"
      ? ["publish_id", "publish_type", "reason"]
      : envelope.event === "post.publish.publicly_available" ||
          envelope.event === "post.publish.no_longer_publicaly_available"
        ? ["post_id", "publish_id", "publish_type"]
        : ["publish_id", "publish_type"];
  const publishId = content["publish_id"];
  const publishType = content["publish_type"];
  if (
    !hasExactKeys(content, expectedKeys) ||
    typeof publishId !== "string" ||
    !PUBLISH_ID_PATTERN.test(publishId) ||
    typeof publishType !== "string" ||
    !PUBLISH_TYPES.has(publishType) ||
    (envelope.event === "post.publish.inbox_delivered" &&
      publishType !== "INBOX_SHARE") ||
    (envelope.event === "post.publish.failed" &&
      (typeof content["reason"] !== "string" ||
        !REASON_PATTERN.test(content["reason"]))) ||
    ((envelope.event === "post.publish.publicly_available" ||
      envelope.event === "post.publish.no_longer_publicaly_available") &&
      !isPostId(content["post_id"]))
  ) {
    throw new PublishingServiceHttpError(400, "invalid_tiktok_webhook");
  }

  return Object.freeze({
    event: envelope.event,
    kind: "content-posting",
    publishId,
  });
};
