import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET as getPublishingAnalytics } from "@/app/api/studio/publishing/analytics/route";
import { GET as getPublishingCalendar } from "@/app/api/studio/publishing/calendar/route";
import { POST as checkPublishingCompatibility } from "@/app/api/studio/publishing/media/compatibility/route";
import { POST as cancelPublishingPost } from "@/app/api/studio/publishing/posts/[postId]/cancel/route";
import { POST as retryPublishingPost } from "@/app/api/studio/publishing/posts/[postId]/retry/route";
import { GET as getPublishingPost } from "@/app/api/studio/publishing/posts/[postId]/route";
import {
  GET as getPublishingPosts,
  POST as createPublishingPost,
} from "@/app/api/studio/publishing/posts/route";
import { PublishingAuthenticationError } from "@/lib/clipstitchr/publishing/identity/PublishingAuthenticationError";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";
import { PublishingServiceResponseError } from "@/lib/clipstitchr/publishing/service/PublishingServiceResponseError";

const mocks = vi.hoisted(() => ({
  convex: { mutation: vi.fn() },
  requestPublishingService: vi.fn(),
  requirePublishingProxyAuthentication: vi.fn(),
  resolvePublishingApiMedia: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/publishing/service/requestPublishingService",
  () => ({ requestPublishingService: mocks.requestPublishingService }),
);
vi.mock(
  "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication",
  () => ({
    requirePublishingProxyAuthentication:
      mocks.requirePublishingProxyAuthentication,
  }),
);
vi.mock(
  "@/lib/clipstitchr/publishing/api/resolvePublishingApiMedia",
  () => ({ resolvePublishingApiMedia: mocks.resolvePublishingApiMedia }),
);

const mediaRevision = "a".repeat(64);
const contentChecksum = "b".repeat(64);
const objectChecksum = "c".repeat(64);
const productId = "product_123";
const media = { kind: "stitch" as const, recordId: "stitch_123" };
const manifest = Object.freeze({
  contentChecksum,
  objects: Object.freeze([
    Object.freeze({
      byteLength: 1_024,
      checksum: objectChecksum,
      contentType: "image/png",
      height: 1_920,
      objectKey: "users/user_123/stitches/stitch_123/result.png",
      objectVersion: 'etag:"durable-etag"',
      orderedIndex: 0,
      width: 1_080,
    }),
  ]),
  sourceKind: "stitch" as const,
  sourceRecordId: "stitch_123",
  sourceRevision: mediaRevision,
});
const mediaObjects = Object.freeze([
  Object.freeze({
    checksum: "sha256:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    contentType: "image/png",
    height: 1_920,
    objectKey: "users/user_123/stitches/stitch_123/result.png",
    sizeBytes: 1_024,
    version: 'etag:"durable-etag"',
    width: 1_080,
  }),
]);
const createRequest = {
  caption: "A finished clip",
  destinations: [
    {
      integrationId: "integration_123",
      provider: "instagram" as const,
      settings: { placement: "feed" as const },
    },
  ],
  idempotencyKey: "publish_123",
  intent: "publish-now" as const,
  media,
  mediaRevision,
};

const jsonRequest = (url: string, body: unknown) =>
  new Request(url, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

const serviceResponse = (body: unknown, status = 200) => ({
  body,
  retryAfterSeconds: undefined,
  status,
});

describe("publishing post API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePublishingProxyAuthentication.mockResolvedValue({
      convex: mocks.convex,
      identity: { tenantId: "tenant_123", userId: "user_123" },
      ownerId: "user_123",
      productId,
      productName: "Sample product",
      userId: "user_123",
    });
    mocks.resolvePublishingApiMedia.mockResolvedValue({ manifest, mediaObjects });
    mocks.requestPublishingService.mockResolvedValue(
      serviceResponse({ ok: true }),
    );
  });

  it("requires Clerk authentication before reading a compatibility body", async () => {
    mocks.requirePublishingProxyAuthentication.mockRejectedValueOnce(
      new PublishingAuthenticationError(),
    );

    const response = await checkPublishingCompatibility(
      new Request(
        "https://clipstitchr.test/api/studio/publishing/media/compatibility",
        { method: "POST" },
      ),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: "authentication_required",
    });
    expect(mocks.resolvePublishingApiMedia).not.toHaveBeenCalled();
    expect(mocks.requestPublishingService).not.toHaveBeenCalled();
  });

  it("fails closed when owner-scoped durable media resolution finds nothing", async () => {
    mocks.resolvePublishingApiMedia.mockRejectedValueOnce(
      new PublishingProxyRequestError(404, "publishing_media_not_found"),
    );

    const response = await checkPublishingCompatibility(
      jsonRequest(
        "https://clipstitchr.test/api/studio/publishing/media/compatibility",
        {
          destinations: [
            { integrationId: "integration_123", provider: "instagram" },
          ],
          media,
        },
      ),
    );

    expect(mocks.resolvePublishingApiMedia).toHaveBeenCalledWith({
      convex: mocks.convex,
      descriptor: media,
      productId,
    });
    expect(response.status).toBe(404);
    expect(mocks.requestPublishingService).not.toHaveBeenCalled();
  });

  it("sends compatibility only immutable server-resolved media facts", async () => {
    const responseBody = {
      destinations: [
        { integrationId: "integration_123", issues: [], status: "ready" },
      ],
      mediaRevision,
    };
    mocks.requestPublishingService.mockResolvedValueOnce(
      serviceResponse(responseBody),
    );

    const response = await checkPublishingCompatibility(
      jsonRequest(
        "https://clipstitchr.test/api/studio/publishing/media/compatibility",
        {
          destinations: [
            { integrationId: "integration_123", provider: "instagram" },
          ],
          media,
        },
      ),
    );

    expect(mocks.requestPublishingService).toHaveBeenCalledWith({
      action: "publishing.media.read",
      body: {
        destinations: [
          { integrationId: "integration_123", provider: "instagram" },
        ],
        media: manifest,
        mediaRevision,
      },
      method: "POST",
      path: "/v1/media/compatibility",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(responseBody);
  });

  it("rejects a stale client media revision before creating service work", async () => {
    const response = await createPublishingPost(
      jsonRequest("https://clipstitchr.test/api/studio/publishing/posts", {
        ...createRequest,
        mediaRevision: "d".repeat(64),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "stale_media_revision",
    });
    expect(mocks.requestPublishingService).not.toHaveBeenCalled();
  });

  it("rejects destination media errors before creating service work", async () => {
    mocks.resolvePublishingApiMedia.mockResolvedValueOnce({
      manifest,
      mediaObjects: [
        {
          contentType: "application/pdf",
          objectKey: "users/user_123/stitches/stitch_123/result.pdf",
          sizeBytes: 1_024,
        },
      ],
    });

    const response = await createPublishingPost(
      jsonRequest(
        "https://clipstitchr.test/api/studio/publishing/posts",
        createRequest,
      ),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      code: "incompatible_media",
    });
    expect(mocks.requestPublishingService).not.toHaveBeenCalled();
  });

  it("forwards the safe post request with its exact immutable manifest and no URL", async () => {
    const responseBody = {
      destinations: [
        {
          integrationId: "integration_123",
          message: null,
          postId: "post_123",
          status: "processing",
        },
      ],
      requestId: "request_123",
    };
    mocks.requestPublishingService.mockResolvedValueOnce(
      serviceResponse(responseBody, 202),
    );

    const response = await createPublishingPost(
      jsonRequest(
        "https://clipstitchr.test/api/studio/publishing/posts",
        createRequest,
      ),
    );

    const forwarded = mocks.requestPublishingService.mock.calls[0]?.[0];
    expect(forwarded).toEqual({
      action: "publishing.posts.publish",
      body: { ...createRequest, productId, resolvedMedia: manifest },
      method: "POST",
      path: "/v1/posts",
    });
    const encodedForwarded = JSON.stringify(forwarded);
    expect(encodedForwarded).not.toContain("ownerId");
    expect(encodedForwarded).not.toContain("signedUrl");
    expect(encodedForwarded).not.toContain("https://");
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual(responseBody);
  });

  it("rejects unknown client media fields instead of trusting object keys", async () => {
    const response = await createPublishingPost(
      jsonRequest("https://clipstitchr.test/api/studio/publishing/posts", {
        ...createRequest,
        media: {
          ...media,
          objectKey: "users/another-user/private.mp4",
          ownerId: "another-user",
        },
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.resolvePublishingApiMedia).not.toHaveBeenCalled();
    expect(mocks.requestPublishingService).not.toHaveBeenCalled();
  });

  it("bounds list, calendar, and analytics queries before proxying", async () => {
    const invalidPosts = await getPublishingPosts(
      new Request(
        "https://clipstitchr.test/api/studio/publishing/posts?status=failed&status=queued",
      ),
    );
    const invalidCalendar = await getPublishingCalendar(
      new Request(
        "https://clipstitchr.test/api/studio/publishing/calendar?from=2026-08-01T00%3A00%3A00.000Z&to=2026-08-08T00%3A00%3A00.000Z&timeZone=Not%2FAZone",
      ),
    );
    const invalidAnalytics = await getPublishingAnalytics(
      new Request(
        "https://clipstitchr.test/api/studio/publishing/analytics?range=365d",
      ),
    );

    expect(invalidPosts.status).toBe(400);
    expect(invalidCalendar.status).toBe(400);
    expect(invalidAnalytics.status).toBe(400);
    expect(mocks.requestPublishingService).not.toHaveBeenCalled();
  });

  it("preserves service rate-limit status and retry timing", async () => {
    mocks.requestPublishingService.mockRejectedValueOnce(
      new PublishingServiceResponseError(429, 23),
    );

    const response = await getPublishingAnalytics(
      new Request(
        "https://clipstitchr.test/api/studio/publishing/analytics?range=7d",
      ),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("23");
    await expect(response.json()).resolves.toMatchObject({
      code: "rate_limited",
      retryAfterSeconds: 23,
    });
  });

  it("proxies bounded reads, retry, and cancel with exact service actions", async () => {
    await getPublishingPosts(
      new Request(
        "https://clipstitchr.test/api/studio/publishing/posts?status=failed",
      ),
    );
    await getPublishingPost(
      new Request("https://clipstitchr.test/api/studio/publishing/posts/post_123"),
      { params: Promise.resolve({ postId: "post_123" }) },
    );
    await retryPublishingPost(
      new Request("https://clipstitchr.test", { method: "POST" }),
      { params: Promise.resolve({ postId: "post_123" }) },
    );
    await cancelPublishingPost(
      new Request("https://clipstitchr.test", { method: "POST" }),
      { params: Promise.resolve({ postId: "post_123" }) },
    );
    await getPublishingCalendar(
      new Request(
        "https://clipstitchr.test/api/studio/publishing/calendar?from=2026-08-01T00%3A00%3A00.000Z&to=2026-08-08T00%3A00%3A00.000Z&timeZone=America%2FDetroit",
      ),
    );
    await getPublishingAnalytics(
      new Request(
        "https://clipstitchr.test/api/studio/publishing/analytics?range=30d",
      ),
    );

    expect(mocks.requestPublishingService.mock.calls).toEqual([
      [
        {
          action: "publishing.posts.read",
          method: "GET",
          path: "/v1/posts",
          searchParams: { productId, status: "failed" },
        },
      ],
      [
        {
          action: "publishing.posts.read",
          method: "GET",
          path: "/v1/posts/post_123",
          searchParams: { productId },
        },
      ],
      [
        {
          action: "publishing.posts.retry",
          body: { productId },
          method: "POST",
          path: "/v1/posts/post_123/retry",
        },
      ],
      [
        {
          action: "publishing.posts.cancel",
          body: { productId },
          method: "POST",
          path: "/v1/posts/post_123/cancel",
        },
      ],
      [
        {
          action: "publishing.posts.read",
          method: "GET",
          path: "/v1/calendar",
          searchParams: {
            from: "2026-08-01T00:00:00.000Z",
            productId,
            timeZone: "America/Detroit",
            to: "2026-08-08T00:00:00.000Z",
          },
        },
      ],
      [
        {
          action: "publishing.analytics.read",
          method: "GET",
          path: "/v1/analytics",
          searchParams: { productId, range: "30d" },
        },
      ],
    ]);
  });
});
