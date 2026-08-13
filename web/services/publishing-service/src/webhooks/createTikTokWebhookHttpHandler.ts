import { verifyTikTokWebhook } from "../provider-runtime/tiktok/verifyTikTokWebhook.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import { enforcePublishingRateLimit } from "../rate-limits/enforcePublishingRateLimit.js";
import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import type { CreateTikTokWebhookHttpHandlerOptions } from "./CreateTikTokWebhookHttpHandlerOptions.js";
import type { TikTokWebhookHttpHandler } from "./TikTokWebhookHttpHandler.js";
import { claimTikTokWebhookDelivery } from "./claimTikTokWebhookDelivery.js";
import { createTikTokWebhookDedupeKey } from "./createTikTokWebhookDedupeKey.js";
import { matchesTikTokWebhookClientKey } from "./matchesTikTokWebhookClientKey.js";
import { parseTikTokWebhookContent } from "./parseTikTokWebhookContent.js";
import { parseTikTokWebhookEnvelope } from "./parseTikTokWebhookEnvelope.js";
import { readBoundedTikTokWebhookBody } from "./readBoundedTikTokWebhookBody.js";
import { readTikTokSignatureHeader } from "./readTikTokSignatureHeader.js";

const FIVE_MINUTES_IN_SECONDS = 300;
const ACCEPTED_RESPONSE = Object.freeze({ body: { status: "accepted" }, status: 200 });

export const createTikTokWebhookHttpHandler = (
  options: CreateTikTokWebhookHttpHandlerOptions,
): TikTokWebhookHttpHandler => {
  if (
    options.clientKey.length < 1 ||
    options.clientKey.length > 256 ||
    /[\u0000-\u001f\u007f\s]/u.test(options.clientKey) ||
    options.clientSecret.length < 12
  ) {
    throw new TypeError("TikTok webhook configuration is invalid.");
  }
  const now = options.now ?? Date.now;

  return async (request) => {
    const nowEpochMilliseconds = now();
    if (!Number.isSafeInteger(nowEpochMilliseconds)) {
      throw new PublishingServiceHttpError(500, "invalid_server_configuration");
    }
    const rawBody = await readBoundedTikTokWebhookBody(request);
    const signatureHeader = readTikTokSignatureHeader(request);
    let verified;
    try {
      verified = verifyTikTokWebhook(
        rawBody,
        signatureHeader,
        options.clientSecret,
        nowEpochMilliseconds,
        FIVE_MINUTES_IN_SECONDS,
      );
    } catch (error) {
      throw new PublishingServiceHttpError(
        error instanceof ProviderRuntimeError && error.code === "invalid_response"
          ? 400
          : 401,
        "invalid_tiktok_webhook",
      );
    }

    const envelope = parseTikTokWebhookEnvelope(verified.body);
    if (!matchesTikTokWebhookClientKey(envelope.clientKey, options.clientKey)) {
      throw new PublishingServiceHttpError(401, "invalid_tiktok_webhook");
    }
    const parsedContent = parseTikTokWebhookContent(envelope);
    const dedupeKey = createTikTokWebhookDedupeKey(envelope);

    if (parsedContent.kind !== "content-posting") {
      await claimTikTokWebhookDelivery(dedupeKey, options.replayProtector);
      return ACCEPTED_RESPONSE;
    }

    const attempt = await options.attemptResolver(parsedContent.publishId);
    if (attempt === null) {
      await claimTikTokWebhookDelivery(dedupeKey, options.replayProtector);
      return ACCEPTED_RESPONSE;
    }

    await enforcePublishingRateLimit(options.rateLimiter, {
      action: "webhook.process",
      tenantKey: attempt.tenantKey,
    });
    if (!(await claimTikTokWebhookDelivery(dedupeKey, options.replayProtector))) {
      return ACCEPTED_RESPONSE;
    }

    await options.outboxNudger(attempt, new Date(nowEpochMilliseconds));
    return ACCEPTED_RESPONSE;
  };
};
