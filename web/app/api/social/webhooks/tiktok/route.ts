import { randomUUID } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { createSocialSecretHash } from "@/lib/clipstitchr/server/social/createSocialSecretHash";
import { encryptSocialToken } from "@/lib/clipstitchr/server/social/encryptSocialToken";
import { readSocialRequestBody } from "@/lib/clipstitchr/server/social/readSocialRequestBody";
import { readTikTokWebhookContent } from "@/lib/clipstitchr/server/social/readTikTokWebhookContent";
import { redactSocialDiagnosticString } from "@/lib/clipstitchr/server/social/redactSocialDiagnosticString";
import { verifyTikTokWebhookSignature } from "@/lib/clipstitchr/server/social/verifyTikTokWebhookSignature";
import { assertInHouseSocialPublishingEnabled } from "@/lib/clipstitchr/social/assertInHouseSocialPublishingEnabled";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let eventRecordId: string | undefined;

  try {
    assertInHouseSocialPublishingEnabled();

    const body = await readSocialRequestBody(request);

    if (
      !verifyTikTokWebhookSignature({
        body,
        header: request.headers.get("TikTok-Signature"),
      })
    ) {
      return Response.json({ error: "Invalid signature." }, { status: 401 });
    }

    const payload = JSON.parse(body) as Record<string, unknown>;
    const eventType =
      typeof payload.event === "string" ? payload.event : "unknown";
    const externalAccountId =
      typeof payload.user_openid === "string" ? payload.user_openid : undefined;
    const content = readTikTokWebhookContent(payload.content);
    const payloadHash = createSocialSecretHash(body);
    const signatureHeader = request.headers.get("TikTok-Signature");
    const signatureTimestamp = signatureHeader
      ?.split(",")
      .find((part) => part.trim().startsWith("t="))
      ?.trim()
      .slice(2);
    const externalEventId =
      typeof payload.event_id === "string"
        ? payload.event_id
        : [
            eventType,
            String(payload.create_time ?? ""),
            externalAccountId ?? "",
            payloadHash.slice(0, 16),
          ].join(":");
    const now = new Date().toISOString();
    const secret = getRateLimitApiSecret();
    const convex = createConvexHttpClient();

    await convex.mutation(api.rateLimits.consumeSocialWebhook, {
      platform: "tiktok",
      secret,
    });

    const candidateEventRecordId = `social-webhook:tiktok:${randomUUID()}`;
    const recorded = await convex.mutation(
      api.socialWebhooks.recordSocialWebhookEvent.recordSocialWebhookEvent,
      {
        secret,
        platform: "tiktok",
        id: candidateEventRecordId,
        externalEventId,
        eventType,
        externalAccountId,
        signatureTimestamp,
        payloadHash,
        now,
      },
    );
    eventRecordId = recorded.id;

    if (recorded.duplicate && recorded.disposition === "processed") {
      return Response.json({ received: true });
    }

    if (eventType === "authorization.removed" && externalAccountId) {
      const redacted = encryptSocialToken(
        `revoked:tiktok:${externalAccountId}`,
      );
      await convex.mutation(
        api.socialAccounts.revokeSocialAccountFromWebhook
          .revokeSocialAccountFromWebhook,
        {
          secret,
          platform: "tiktok",
          externalAccountId,
          redactedAccessTokenCiphertext: redacted.ciphertext,
          tokenEncryptionVersion: redacted.version,
          reason: "TikTok removed this account's authorization.",
          now,
        },
      );
    }

    const publishId =
      typeof content.publish_id === "string" ? content.publish_id : undefined;

    if (publishId) {
      const publicationIds = [
        content.publicly_available_post_id,
        content.publicaly_available_post_id,
      ]
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .filter((value): value is string => typeof value === "string");
      const status = eventType.includes("failed")
        ? "failed"
        : eventType.includes("complete") ||
            eventType.includes("inbox_delivered")
          ? "complete"
          : "pending";

      if (status !== "pending") {
        await convex.mutation(
          api.socialWebhooks.applyTikTokPublishWebhook
            .applyTikTokPublishWebhook,
          {
            secret,
            publishId,
            status,
            publicationIds,
            errorMessage:
              typeof content.fail_reason === "string"
                ? redactSocialDiagnosticString(content.fail_reason)
                : undefined,
            now,
          },
        );
      }
    }

    await convex.mutation(
      api.socialWebhooks.finishSocialWebhookEvent.finishSocialWebhookEvent,
      {
        secret,
        id: eventRecordId,
        disposition: "processed",
        now: new Date().toISOString(),
      },
    );

    return Response.json({ received: true });
  } catch (error) {
    if (eventRecordId) {
      try {
        const convex = createConvexHttpClient();
        await convex.mutation(
          api.socialWebhooks.finishSocialWebhookEvent.finishSocialWebhookEvent,
          {
            secret: getRateLimitApiSecret(),
            id: eventRecordId,
            disposition: "failed",
            errorMessage:
              error instanceof Error
                ? redactSocialDiagnosticString(error.message).slice(0, 500)
                : "Webhook processing failed.",
            now: new Date().toISOString(),
          },
        );
      } catch {
        // The provider retry remains the recovery path.
      }
    }

    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      { error: "Unable to process this TikTok update." },
      { status: 500 },
    );
  }
}
