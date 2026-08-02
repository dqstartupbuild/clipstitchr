import { createHash } from "node:crypto";

import type { TikTokWebhookEnvelope } from "./TikTokWebhookEnvelope.js";

export const createTikTokWebhookDedupeKey = (
  envelope: TikTokWebhookEnvelope,
): string =>
  createHash("sha256")
    .update(
      JSON.stringify({
        clientKey: envelope.clientKey,
        content: envelope.content,
        createTimeEpochSeconds: envelope.createTimeEpochSeconds,
        event: envelope.event,
        userOpenId: envelope.userOpenId,
      }),
      "utf8",
    )
    .digest("base64url");
