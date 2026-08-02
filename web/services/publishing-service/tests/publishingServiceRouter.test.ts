import { once } from "node:events";
import { createServer } from "node:http";

import { describe, expect, it, vi } from "vitest";

import { InMemoryServiceAssertionReplayProtector } from "../src/assertions/InMemoryServiceAssertionReplayProtector.js";
import { createServiceAssertionSigningKey } from "../src/assertions/createServiceAssertionSigningKey.js";
import { issueServiceAssertion } from "../src/assertions/issueServiceAssertion.js";
import { resolveClerkTenantIdentity } from "../src/identity/resolveClerkTenantIdentity.js";
import type { PublishingRateLimiter } from "../src/rate-limits/PublishingRateLimiter.js";
import type { PublishingRateLimitAction } from "../src/rate-limits/PublishingRateLimitAction.js";
import { createExactPublishingServiceRouteMatcher } from "../src/server/createExactPublishingServiceRouteMatcher.js";
import { createPublishingServiceRequestHandler } from "../src/server/createPublishingServiceRequestHandler.js";

const signingKey = createServiceAssertionSigningKey(
  Buffer.alloc(32, 12).toString("base64"),
);
const identity = resolveClerkTenantIdentity({ actorUserId: "user_router" });

const createRateLimitDecision = (
  action: PublishingRateLimitAction,
  allowed: boolean,
  retryAfterSeconds: number,
) => ({
  action,
  allowed,
  observedAtEpochMilliseconds: 1_785_600_000_000,
  retryAfterSeconds,
  global: {
    remaining: allowed ? 9 : 0,
    resetAtEpochMilliseconds: 1_785_600_060_000,
  },
  tenant: {
    remaining: allowed ? 4 : 0,
    resetAtEpochMilliseconds: 1_785_600_060_000,
  },
});

const issueAssertion = (requestId: string) =>
  issueServiceAssertion({
    action: "publishing.posts.publish",
    audience: "publishing-service",
    identity,
    issuer: "clipstitchr-web",
    requestId,
    signingKey,
  });

const withServer = async (
  limiter: PublishingRateLimiter,
  callback: (origin: string) => Promise<void>,
) => {
  const handle = vi.fn(async ({ body }: { body: unknown }) => ({
    status: 200,
    body: { received: body },
  }));
  const server = createServer(
    createPublishingServiceRequestHandler({
      authentication: {
        audience: "publishing-service",
        issuer: "clipstitchr-web",
        replayProtector: new InMemoryServiceAssertionReplayProtector(),
        signingKey,
      },
      rateLimiter: limiter,
      readinessDependencies: [],
      routes: [
        {
          action: "publishing.posts.publish",
          body: "json",
          handle,
          match: createExactPublishingServiceRouteMatcher("/v1/posts"),
          maximumBodyBytes: 1_024,
          method: "POST",
          rateLimitAction: "publish.create",
        },
      ],
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

  return handle;
};

describe("publishing service router", () => {
  it("authenticates and rate-limits before delivering bounded JSON", async () => {
    const consume = vi.fn(async (request) =>
      createRateLimitDecision(request.action, true, 0),
    );
    const handle = await withServer({ consume }, async (origin) => {
      const requestId = "request-router-123";
      const response = await fetch(`${origin}/v1/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${issueAssertion(requestId)}`,
          "Content-Type": "application/json",
          "X-ClipStitchr-Request-Id": requestId,
        },
        body: JSON.stringify({ caption: "Ready" }),
      });

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        received: { caption: "Ready" },
      });
    });

    expect(consume).toHaveBeenCalledWith({
      action: "publish.create",
      tenantKey: "clerk-personal:user_router",
    });
    expect(handle).toHaveBeenCalledOnce();
  });

  it("returns retry timing and never invokes work when the limit is exhausted", async () => {
    const handle = await withServer(
      {
        consume: vi.fn(async (request) =>
          createRateLimitDecision(request.action, false, 37),
        ),
      },
      async (origin) => {
        const requestId = "request-limited-123";
        const response = await fetch(`${origin}/v1/posts`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${issueAssertion(requestId)}`,
            "Content-Type": "application/json",
            "X-ClipStitchr-Request-Id": requestId,
          },
          body: JSON.stringify({ caption: "Blocked before work" }),
        });

        expect(response.status).toBe(429);
        expect(response.headers.get("retry-after")).toBe("37");
        await expect(response.json()).resolves.toMatchObject({
          code: "rate_limited",
          retryAfterSeconds: 37,
        });
      },
    );

    expect(handle).not.toHaveBeenCalled();
  });

  it("rejects wrong methods and unauthenticated requests", async () => {
    const handle = await withServer(
      {
        consume: vi.fn(async (request) =>
          createRateLimitDecision(request.action, true, 0),
        ),
      },
      async (origin) => {
        expect((await fetch(`${origin}/v1/posts`)).status).toBe(405);
        expect(
          (
            await fetch(`${origin}/v1/posts`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-ClipStitchr-Request-Id": "request-missing-auth-123",
              },
              body: "{}",
            })
          ).status,
        ).toBe(401);
      },
    );

    expect(handle).not.toHaveBeenCalled();
  });
});
