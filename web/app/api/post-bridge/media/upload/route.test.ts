import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/post-bridge/media/upload/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    resolvePostBridgeApiKey: vi.fn(),
    uploadPostBridgeMediaFromR2Object: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumePostBridgeMediaUpload: "consumePostBridgeMediaUpload",
    },
    stitches: {
      get: "stitches.get",
    },
    swipes: {
      get: "swipes.get",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient: mocks.createAuthenticatedConvexHttpClient,
  }),
);

vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey", () => ({
  resolvePostBridgeApiKey: mocks.resolvePostBridgeApiKey,
}));

vi.mock(
  "@/lib/clipstitchr/server/postBridge/uploadPostBridgeMediaFromR2Object",
  () => ({
    uploadPostBridgeMediaFromR2Object: mocks.uploadPostBridgeMediaFromR2Object,
  }),
);

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createUploadRequest(body: object) {
  return new Request("https://clipstitchr.test/api/post-bridge/media/upload", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

function createRequestBody(overrides: Record<string, unknown> = {}) {
  return {
    mimeType: "video/mp4",
    name: "Launch.mp4",
    sizeBytes: 1024.2,
    sourceId: "stitch_123",
    sourceObject: {
      contentType: "video/mp4",
      key: "users/user_123/post-bridge-media/stitch_123/media.mp4",
      size: 1025,
    },
    sourceType: "stitch",
    ...overrides,
  };
}

describe("POST /api/post-bridge/media/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.query.mockResolvedValue({ _id: "stitch_123" });
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.resolvePostBridgeApiKey.mockResolvedValue("pb_test_key");
    mocks.uploadPostBridgeMediaFromR2Object.mockResolvedValue({
      mediaId: "media_123",
      mediaKind: "video",
      mimeType: "video/mp4",
      name: "Launch.mp4",
      sizeBytes: 1025,
    });
  });

  it("returns 401 before uploading when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createUploadRequest(createRequestBody()));

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.uploadPostBridgeMediaFromR2Object).not.toHaveBeenCalled();
  });

  it("consumes upload bytes before copying the R2 object to Post Bridge", async () => {
    const response = await POST(createUploadRequest(createRequestBody()));

    await expect(response.json()).resolves.toEqual({
      media: {
        mediaId: "media_123",
        mediaKind: "video",
        mimeType: "video/mp4",
        name: "Launch.mp4",
        sizeBytes: 1025,
      },
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.query).toHaveBeenCalledWith(api.stitches.get, {
      id: "stitch_123",
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumePostBridgeMediaUpload,
      {
        mediaSizeBytes: 1025,
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.uploadPostBridgeMediaFromR2Object).toHaveBeenCalledWith({
      apiKey: "pb_test_key",
      media: {
        mediaKind: "video",
        mimeType: "video/mp4",
        name: "Launch.mp4",
        sizeBytes: 1025,
      },
      sourceObject: {
        contentType: "video/mp4",
        key: "users/user_123/post-bridge-media/stitch_123/media.mp4",
        size: 1025,
      },
      userId: "user_123",
    });
  });

  it("returns 400 before consuming quota when the source is missing", async () => {
    mocks.convex.query.mockResolvedValue(null);

    const response = await POST(createUploadRequest(createRequestBody()));

    await expect(response.json()).resolves.toEqual({
      error: "That saved post was not found.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.uploadPostBridgeMediaFromR2Object).not.toHaveBeenCalled();
  });

  it("returns 429 with retry timing when upload bytes are rate-limited", async () => {
    mocks.convex.mutation.mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "postBridgeUploadBytesDaily",
        retryAfter: 2500,
      },
    });

    const response = await POST(createUploadRequest(createRequestBody()));

    await expect(response.json()).resolves.toEqual({
      error: "Rate limit exceeded. Try again in 3 seconds.",
      message: "Rate limit exceeded. Try again in 3 seconds.",
      rateLimit: "postBridgeUploadBytesDaily",
      retryAfter: 2500,
      retryAfterSeconds: 3,
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("3");
    expect(mocks.uploadPostBridgeMediaFromR2Object).not.toHaveBeenCalled();
  });
});
