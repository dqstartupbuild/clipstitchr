import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/r2/upload-url/route";
import { api } from "@/convex/_generated/api";

const VIDEO_CLIP_KEY = "users/user_123/video-clips/clip_123/video.mp4";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };

  return {
    capturePostHogServerEvent: vi.fn(),
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    getR2UploadSignedUrl: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeR2Upload: "consumeR2Upload",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/analytics/capturePostHogServerEvent", () => ({
  capturePostHogServerEvent: mocks.capturePostHogServerEvent,
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

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock("@/lib/clipstitchr/server/r2/getR2UploadSignedUrl", () => ({
  getR2UploadSignedUrl: mocks.getR2UploadSignedUrl,
}));

function createUploadUrlRequest(body: object) {
  return new Request("https://clipstitchr.test/api/r2/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/r2/upload-url", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.getR2UploadSignedUrl.mockResolvedValue({
      expiresIn: 300,
      url: "https://r2.example/upload",
    });
  });

  it("returns 401 before creating a signed URL when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(
      createUploadUrlRequest({
        contentType: "video/mp4",
        kind: "video-clip-video",
        recordId: "clip_123",
        sizeBytes: 1024,
      }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.getR2UploadSignedUrl).not.toHaveBeenCalled();
  });

  it("returns 400 before consuming quota when the request body is invalid", async () => {
    const response = await POST(
      createUploadUrlRequest({
        contentType: "video/mp4",
        kind: "video-clip-video",
        recordId: "clip_123",
        sizeBytes: 0,
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Missing R2 upload size.",
    });
    expect(response.status).toBe(400);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.getR2UploadSignedUrl).not.toHaveBeenCalled();
  });

  it("returns 400 before consuming quota when a Convex auth token is unavailable", async () => {
    mocks.getAuthenticatedConvexToken.mockResolvedValue(null);

    const response = await POST(
      createUploadUrlRequest({
        contentType: "video/mp4",
        kind: "video-clip-video",
        recordId: "clip_123",
        sizeBytes: 1024,
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Unable to create a Convex auth token.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.getR2UploadSignedUrl).not.toHaveBeenCalled();
  });

  it("consumes upload quota before creating a signed upload URL", async () => {
    const response = await POST(
      createUploadUrlRequest({
        contentType: "video/mp4",
        kind: "video-clip-video",
        recordId: "clip_123",
        sizeBytes: 1024.2,
      }),
    );

    await expect(response.json()).resolves.toEqual({
      expiresIn: 300,
      key: VIDEO_CLIP_KEY,
      url: "https://r2.example/upload",
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeR2Upload,
      {
        secret: "rate-limit-secret",
        sizeBytes: 1025,
      },
    );
    expect(mocks.getR2UploadSignedUrl).toHaveBeenCalledWith({
      contentType: "video/mp4",
      key: VIDEO_CLIP_KEY,
    });
    expect(mocks.capturePostHogServerEvent).toHaveBeenCalledWith({
      distinctId: "user_123",
      event: "upload_url_requested",
      properties: {
        kind: "video-clip-video",
        content_type: "video/mp4",
        size_bytes: 1025,
      },
      request: expect.any(Request),
    });
  });

  it("returns 429 with retry timing when upload quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "r2UploadUrl",
        retryAfter: 2500,
      },
    });

    const response = await POST(
      createUploadUrlRequest({
        contentType: "video/mp4",
        kind: "video-clip-video",
        recordId: "clip_123",
        sizeBytes: 1024,
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Rate limit exceeded. Try again in 3 seconds.",
      message: "Rate limit exceeded. Try again in 3 seconds.",
      rateLimit: "r2UploadUrl",
      retryAfter: 2500,
      retryAfterSeconds: 3,
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("3");
    expect(mocks.getR2UploadSignedUrl).not.toHaveBeenCalled();
  });
});
