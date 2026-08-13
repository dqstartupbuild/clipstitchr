import { createHmac } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { InMemoryServiceAssertionReplayProtector } from "../src/assertions/InMemoryServiceAssertionReplayProtector.js";
import { createServiceAssertionSigningKey } from "../src/assertions/createServiceAssertionSigningKey.js";
import { resolveClerkTenantIdentity } from "../src/identity/resolveClerkTenantIdentity.js";
import type { PublishingRateLimitAction } from "../src/rate-limits/PublishingRateLimitAction.js";
import type { PublishingRateLimiter } from "../src/rate-limits/PublishingRateLimiter.js";
import type { TikTokWebhookReplayProtector } from "../src/provider-runtime/tiktok/TikTokWebhookReplayProtector.js";
import { createExactPublishingServiceRouteMatcher } from "../src/server/createExactPublishingServiceRouteMatcher.js";
import { createPublishingServiceRequestHandler } from "../src/server/createPublishingServiceRequestHandler.js";
import { createTikTokWebhookHttpHandler } from "../src/webhooks/createTikTokWebhookHttpHandler.js";
import type { TikTokWebhookAttemptResolver } from "../src/webhooks/TikTokWebhookAttemptResolver.js";
import type { TikTokWebhookOutboxNudger } from "../src/webhooks/TikTokWebhookOutboxNudger.js";

const NOW_EPOCH_MILLISECONDS = 1_785_600_000_000;
const TIMESTAMP = Math.floor(NOW_EPOCH_MILLISECONDS / 1_000);
const CLIENT_KEY = "tiktok-client-key";
const CLIENT_SECRET = "tiktok-client-secret-placeholder";
const identity = resolveClerkTenantIdentity({ actorUserId: "user_webhook" });
const signingKey = createServiceAssertionSigningKey(
  Buffer.alloc(32, 7).toString("base64"),
);

const createRateLimitDecision = (
  action: PublishingRateLimitAction,
  allowed = true,
) => ({
  action,
  allowed,
  observedAtEpochMilliseconds: NOW_EPOCH_MILLISECONDS,
  retryAfterSeconds: allowed ? 0 : 17,
  global: {
    remaining: allowed ? 99 : 0,
    resetAtEpochMilliseconds: NOW_EPOCH_MILLISECONDS + 60_000,
  },
  tenant: {
    remaining: allowed ? 9 : 0,
    resetAtEpochMilliseconds: NOW_EPOCH_MILLISECONDS + 60_000,
  },
});

const createEnvelopeBody = (
  event: string,
  content: Record<string, unknown>,
  clientKey = CLIENT_KEY,
) =>
  JSON.stringify({
    client_key: clientKey,
    event,
    create_time: TIMESTAMP,
    user_openid: "act.creator-open-id",
    content: JSON.stringify(content),
  });

const createSignature = (body: string, timestamp = TIMESTAMP) =>
  `t=${timestamp},s=${createHmac("sha256", CLIENT_SECRET)
    .update(Buffer.concat([Buffer.from(`${timestamp}.`), Buffer.from(body)]))
    .digest("hex")}`;

const withServer = async (
  webhookHandler: ReturnType<typeof createTikTokWebhookHttpHandler>,
  callback: (origin: string) => Promise<void>,
) => {
  const server = createServer(
    createPublishingServiceRequestHandler({
      authentication: {
        audience: "publishing-service",
        issuer: "clipstitchr-web",
        replayProtector: new InMemoryServiceAssertionReplayProtector(),
        signingKey,
      },
      rateLimiter: {
        consume: async (request) => createRateLimitDecision(request.action),
      },
      readinessDependencies: [],
      routes: [
        {
          action: "publishing.posts.read",
          body: "none",
          handle: async () => ({ body: { ok: true }, status: 200 }),
          match: createExactPublishingServiceRouteMatcher("/v1/private-test"),
          method: "GET",
          rateLimitAction: "status.poll",
        },
      ],
      studioBetaEnabled: true,
      tikTokWebhookHandler: webhookHandler,
    }),
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new TypeError("Expected an IP listener.");
    }
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
};

const postWebhook = (
  origin: string,
  body: string,
  signature = createSignature(body),
) =>
  fetch(`${origin}/v1/webhooks/tiktok`, {
    body,
    headers: {
      "Content-Type": "application/json",
      "TikTok-Signature": signature,
    },
    method: "POST",
  });

describe("TikTok Content Posting webhook route", () => {
  const attempt = Object.freeze({
    attemptId: "attempt_123",
    postStateId: "post_state_123",
    tenantId: "tenant_123",
    tenantKey: identity.tenantKey,
  });
  let attemptResolver: Mock<TikTokWebhookAttemptResolver>;
  let outboxNudger: Mock<TikTokWebhookOutboxNudger>;
  let rateLimitConsume: Mock<PublishingRateLimiter["consume"]>;
  let replayClaim: Mock<TikTokWebhookReplayProtector["claim"]>;
  let callOrder: string[];

  beforeEach(() => {
    callOrder = [];
    attemptResolver = vi.fn<TikTokWebhookAttemptResolver>(async () => attempt);
    outboxNudger = vi.fn<TikTokWebhookOutboxNudger>(async () => {
      callOrder.push("outbox");
    });
    rateLimitConsume = vi.fn<PublishingRateLimiter["consume"]>(async (request) => {
      callOrder.push("rate-limit");
      return createRateLimitDecision(request.action);
    });
    replayClaim = vi.fn<TikTokWebhookReplayProtector["claim"]>(async () => {
      callOrder.push("replay");
      return true;
    });
  });

  const createHandler = () =>
    createTikTokWebhookHttpHandler({
      attemptResolver,
      clientKey: CLIENT_KEY,
      clientSecret: CLIENT_SECRET,
      now: () => NOW_EPOCH_MILLISECONDS,
      outboxNudger,
      rateLimiter: { consume: rateLimitConsume },
      replayProtector: { claim: replayClaim },
    });

  it("accepts a signed official event and only nudges polling after protection", async () => {
    const body = createEnvelopeBody("post.publish.complete", {
      publish_id: "v_pub_url~v2.123456789",
      publish_type: "DIRECT_POST",
    });

    await withServer(createHandler(), async (origin) => {
      const response = await postWebhook(origin, body);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ status: "accepted" });
    });

    expect(attemptResolver).toHaveBeenCalledWith("v_pub_url~v2.123456789");
    expect(rateLimitConsume).toHaveBeenCalledWith({
      action: "webhook.process",
      tenantKey: identity.tenantKey,
    });
    expect(replayClaim).toHaveBeenCalledWith(
      expect.stringMatching(/^[A-Za-z0-9_-]{43}$/u),
      259_200_000,
    );
    expect(outboxNudger).toHaveBeenCalledWith(
      attempt,
      new Date(NOW_EPOCH_MILLISECONDS),
    );
    expect(callOrder).toEqual(["rate-limit", "replay", "outbox"]);
  });

  it("returns 200 for a duplicate without nudging twice", async () => {
    replayClaim.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const body = createEnvelopeBody("post.publish.inbox_delivered", {
      publish_id: "v_inbox_file~v2.123456789",
      publish_type: "INBOX_SHARE",
    });

    await withServer(createHandler(), async (origin) => {
      expect((await postWebhook(origin, body)).status).toBe(200);
      expect((await postWebhook(origin, body)).status).toBe(200);
    });

    expect(outboxNudger).toHaveBeenCalledOnce();
  });

  it("rejects an invalid, stale, or wrong-client signature boundary", async () => {
    const body = createEnvelopeBody("post.publish.complete", {
      publish_id: "publish_123",
      publish_type: "DIRECT_POST",
    });
    const wrongClientBody = createEnvelopeBody(
      "post.publish.complete",
      { publish_id: "publish_123", publish_type: "DIRECT_POST" },
      "another-client",
    );

    await withServer(createHandler(), async (origin) => {
      expect(
        (await postWebhook(origin, body, `t=${TIMESTAMP},s=${"0".repeat(64)}`))
          .status,
      ).toBe(401);
      expect(
        (
          await postWebhook(
            origin,
            body,
            createSignature(body, TIMESTAMP - 301),
          )
        ).status,
      ).toBe(401);
      expect((await postWebhook(origin, wrongClientBody)).status).toBe(401);
    });

    expect(attemptResolver).not.toHaveBeenCalled();
    expect(outboxNudger).not.toHaveBeenCalled();
  });

  it("strictly rejects malformed content and bodies larger than 64 KiB", async () => {
    const malformedBody = JSON.stringify({
      client_key: CLIENT_KEY,
      event: "post.publish.complete",
      create_time: TIMESTAMP,
      user_openid: "act.creator-open-id",
      content: JSON.stringify({
        publish_id: "publish_123",
        publish_type: "DIRECT_POST",
        untrusted: true,
      }),
    });
    const oversizedBody = "x".repeat(65_537);

    await withServer(createHandler(), async (origin) => {
      expect((await postWebhook(origin, malformedBody)).status).toBe(400);
      expect((await postWebhook(origin, oversizedBody, "invalid")).status).toBe(
        413,
      );
    });

    expect(outboxNudger).not.toHaveBeenCalled();
  });

  it("safely acknowledges unknown events, unknown IDs, and authorization removal", async () => {
    const unknownEvent = createEnvelopeBody("video.publish.completed", {
      share_id: "video.123",
    });
    const unknownId = createEnvelopeBody("post.publish.failed", {
      publish_id: "unknown_publish_id",
      publish_type: "DIRECT_POST",
      reason: "internal",
    });
    const authorizationRemoved = createEnvelopeBody("authorization.removed", {
      reason: 1,
    });
    attemptResolver.mockResolvedValueOnce(null);

    await withServer(createHandler(), async (origin) => {
      for (const body of [unknownId, unknownEvent, authorizationRemoved]) {
        const response = await postWebhook(origin, body);
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ status: "accepted" });
      }
    });

    expect(attemptResolver).toHaveBeenCalledTimes(1);
    expect(outboxNudger).not.toHaveBeenCalled();
  });

  it("returns rate-limit retry timing before replay or PostgreSQL mutation", async () => {
    rateLimitConsume.mockImplementationOnce(async (request) => {
      callOrder.push("rate-limit");
      return createRateLimitDecision(request.action, false);
    });
    const body = createEnvelopeBody("post.publish.complete", {
      publish_id: "publish_123",
      publish_type: "DIRECT_POST",
    });

    await withServer(createHandler(), async (origin) => {
      const response = await postWebhook(origin, body);
      expect(response.status).toBe(429);
      expect(response.headers.get("retry-after")).toBe("17");
    });

    expect(callOrder).toEqual(["rate-limit"]);
    expect(replayClaim).not.toHaveBeenCalled();
    expect(outboxNudger).not.toHaveBeenCalled();
  });

  it("exposes only the exact public route and leaves other routes authenticated", async () => {
    const body = createEnvelopeBody("post.publish.complete", {
      publish_id: "publish_123",
      publish_type: "DIRECT_POST",
    });

    await withServer(createHandler(), async (origin) => {
      expect((await fetch(`${origin}/v1/private-test`)).status).toBe(400);
      expect((await fetch(`${origin}/v1/webhooks/tiktok`)).status).toBe(405);
      expect(
        (
          await fetch(`${origin}/v1/webhooks/tiktok?unexpected=true`, {
            body,
            headers: {
              "Content-Type": "application/json",
              "TikTok-Signature": createSignature(body),
            },
            method: "POST",
          })
        ).status,
      ).toBe(400);
      expect(
        (
          await fetch(`${origin}/v1/webhooks/tiktok/`, {
            body,
            headers: {
              "Content-Type": "application/json",
              "TikTok-Signature": createSignature(body),
            },
            method: "POST",
          })
        ).status,
      ).toBe(404);
    });
  });
});
