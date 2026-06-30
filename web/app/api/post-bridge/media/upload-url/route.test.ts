import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/post-bridge/media/upload-url/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createPostBridgeUploadUrl: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    resolvePostBridgeApiKey: vi.fn(),
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

vi.mock("@/lib/clipstitchr/server/postBridge/createPostBridgeUploadUrl", () => ({
  createPostBridgeUploadUrl: mocks.createPostBridgeUploadUrl,
}));

vi.mock("@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey", () => ({
  resolvePostBridgeApiKey: mocks.resolvePostBridgeApiKey,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createUploadUrlRequest(body: object) {
  return new Request("https://clipstitchr.test/api/post-bridge/media/upload-url", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

describe("POST /api/post-bridge/media/upload-url", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.query.mockResolvedValue({ _id: "stitch_123" });
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.resolvePostBridgeApiKey.mockResolvedValue("pb_test_key");
    mocks.createPostBridgeUploadUrl.mockResolvedValue({
      media_id: "media_123",
      name: "Launch.mp4",
      upload_url: "https://uploads.example/media_123",
    });
  });

  it("returns 401 before preparing an upload when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(
      createUploadUrlRequest({
        mimeType: "video/mp4",
        name: "Launch.mp4",
        sizeBytes: 1024,
        sourceId: "stitch_123",
        sourceType: "stitch",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.createPostBridgeUploadUrl).not.toHaveBeenCalled();
  });

  it("consumes upload bytes before creating a Post Bridge upload URL", async () => {
    const response = await POST(
      createUploadUrlRequest({
        mimeType: "video/mp4",
        name: "Launch.mp4",
        sizeBytes: 1024.2,
        sourceId: "stitch_123",
        sourceType: "stitch",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      media: {
        mediaId: "media_123",
        mediaKind: "video",
        mimeType: "video/mp4",
        name: "Launch.mp4",
        sizeBytes: 1025,
      },
      uploadUrl: "https://uploads.example/media_123",
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
    expect(mocks.createPostBridgeUploadUrl).toHaveBeenCalledWith({
      apiKey: "pb_test_key",
      mimeType: "video/mp4",
      name: "Launch.mp4",
      sizeBytes: 1025,
    });
  });

  it("returns 400 before consuming quota when the source is missing", async () => {
    mocks.convex.query.mockResolvedValue(null);

    const response = await POST(
      createUploadUrlRequest({
        mimeType: "video/mp4",
        name: "Launch.mp4",
        sizeBytes: 1024,
        sourceId: "stitch_123",
        sourceType: "stitch",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "That saved post was not found.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.createPostBridgeUploadUrl).not.toHaveBeenCalled();
  });

  it("returns 429 with retry timing when upload bytes are rate-limited", async () => {
    mocks.convex.mutation.mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "postBridgeUploadBytesDaily",
        retryAfter: 2500,
      },
    });

    const response = await POST(
      createUploadUrlRequest({
        mimeType: "video/mp4",
        name: "Launch.mp4",
        sizeBytes: 1024,
        sourceId: "stitch_123",
        sourceType: "stitch",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Rate limit exceeded. Try again in 3 seconds.",
      message: "Rate limit exceeded. Try again in 3 seconds.",
      rateLimit: "postBridgeUploadBytesDaily",
      retryAfter: 2500,
      retryAfterSeconds: 3,
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("3");
    expect(mocks.createPostBridgeUploadUrl).not.toHaveBeenCalled();
  });
});
