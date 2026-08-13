import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import type { ParsedTikTokWebhookContent } from "./ParsedTikTokWebhookContent.js";
import type { TikTokWebhookEnvelope } from "./TikTokWebhookEnvelope.js";
import { hasExactTikTokWebhookContentKeys } from "./hasExactTikTokWebhookContentKeys.js";
import { isTikTokContentPostingWebhookEvent } from "./isTikTokContentPostingWebhookEvent.js";
import { isTikTokWebhookPostId } from "./isTikTokWebhookPostId.js";
import { readTikTokWebhookContentObject } from "./readTikTokWebhookContentObject.js";

const PUBLISH_ID_PATTERN = /^[^\u0000-\u001f\u007f\s]{1,64}$/u;
const REASON_PATTERN = /^[A-Za-z0-9._-]{1,128}$/u;
const PUBLISH_TYPES = new Set(["DIRECT_POST", "INBOX_SHARE"]);

export const parseTikTokWebhookContent = (
  envelope: TikTokWebhookEnvelope,
): ParsedTikTokWebhookContent => {
  const content = readTikTokWebhookContentObject(envelope.content);

  if (envelope.event === "authorization.removed") {
    if (
      !hasExactTikTokWebhookContentKeys(content, ["reason"]) ||
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
    !hasExactTikTokWebhookContentKeys(content, expectedKeys) ||
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
      !isTikTokWebhookPostId(content["post_id"]))
  ) {
    throw new PublishingServiceHttpError(400, "invalid_tiktok_webhook");
  }

  return Object.freeze({
    event: envelope.event,
    kind: "content-posting",
    publishId,
  });
};
