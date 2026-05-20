import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/r2/download-urls/route";
import { api } from "@/convex/_generated/api";

const POSTER_KEY = "users/user_123/video-clips/clip_123/poster.jpg";
const STITCH_POSTER_KEY = "users/user_123/stitches/stitch_123/poster.jpg";
const VIDEO_KEY = "users/user_123/video-clips/clip_123/video.mp4";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    getR2DownloadSignedUrl: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeR2Download: "consumeR2Download",
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

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));

function createDownloadUrlsRequest(body: object) {
  return new Request("https://clipstitchr.test/api/r2/download-urls", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/r2/download-urls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.getR2DownloadSignedUrl.mockImplementation(async (key: string) => ({
      expiresIn: 300,
      url: `https://r2.example/${encodeURIComponent(key)}`,
    }));
  });

  it("returns 401 before creating signed URLs when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(
      createDownloadUrlsRequest({
        keys: [POSTER_KEY],
      }),
    );

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.getR2DownloadSignedUrl).not.toHaveBeenCalled();
  });

  it("returns 400 before consuming quota when the request body is invalid", async () => {
    const response = await POST(createDownloadUrlsRequest({}));

    await expect(response.json()).resolves.toEqual({
      error: "Choose at least one R2 object key.",
    });
    expect(response.status).toBe(400);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.getR2DownloadSignedUrl).not.toHaveBeenCalled();
  });

  it("returns 400 before consuming quota when a Convex auth token is unavailable", async () => {
    mocks.getAuthenticatedConvexToken.mockResolvedValue(null);

    const response = await POST(
      createDownloadUrlsRequest({
        keys: [POSTER_KEY],
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Unable to create a Convex auth token.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.getR2DownloadSignedUrl).not.toHaveBeenCalled();
  });

  it("returns 400 before consuming quota when a key is outside the user scope", async () => {
    const response = await POST(
      createDownloadUrlsRequest({
        keys: ["users/other_user/video-clips/clip_123/poster.jpg"],
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "R2 object key is outside the authenticated user scope.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.getR2DownloadSignedUrl).not.toHaveBeenCalled();
  });

  it("returns 400 before consuming quota when a key is not a poster or thumbnail image", async () => {
    const response = await POST(
      createDownloadUrlsRequest({
        keys: [VIDEO_KEY],
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Batch R2 download URLs are limited to poster and thumbnail images.",
    });
    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.getR2DownloadSignedUrl).not.toHaveBeenCalled();
  });

  it("consumes download quota once before creating a batch of signed URLs", async () => {
    const response = await POST(
      createDownloadUrlsRequest({
        keys: [POSTER_KEY, STITCH_POSTER_KEY],
      }),
    );

    await expect(response.json()).resolves.toEqual({
      urls: [
        {
          expiresIn: 300,
          key: POSTER_KEY,
          url: `https://r2.example/${encodeURIComponent(POSTER_KEY)}`,
        },
        {
          expiresIn: 300,
          key: STITCH_POSTER_KEY,
          url: `https://r2.example/${encodeURIComponent(STITCH_POSTER_KEY)}`,
        },
      ],
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledTimes(1);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeR2Download,
      {
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.getR2DownloadSignedUrl).toHaveBeenCalledWith(POSTER_KEY);
    expect(mocks.getR2DownloadSignedUrl).toHaveBeenCalledWith(STITCH_POSTER_KEY);
  });

  it("deduplicates repeated keys before signing", async () => {
    const response = await POST(
      createDownloadUrlsRequest({
        keys: [POSTER_KEY, POSTER_KEY],
      }),
    );

    await expect(response.json()).resolves.toEqual({
      urls: [
        {
          expiresIn: 300,
          key: POSTER_KEY,
          url: `https://r2.example/${encodeURIComponent(POSTER_KEY)}`,
        },
      ],
    });
    expect(response.status).toBe(200);
    expect(mocks.getR2DownloadSignedUrl).toHaveBeenCalledTimes(1);
  });

  it("returns 429 with retry timing when download quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "r2DownloadUrl",
        retryAfter: 1200,
      },
    });

    const response = await POST(
      createDownloadUrlsRequest({
        keys: [POSTER_KEY],
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Rate limit exceeded. Try again in 2 seconds.",
      message: "Rate limit exceeded. Try again in 2 seconds.",
      rateLimit: "r2DownloadUrl",
      retryAfter: 1200,
      retryAfterSeconds: 2,
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("2");
    expect(mocks.getR2DownloadSignedUrl).not.toHaveBeenCalled();
  });
});
