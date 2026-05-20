import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/music/download-url/route";
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
    getR2DownloadSignedUrl: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeR2Download: "rateLimits.consumeR2Download",
    },
    sharedMusicTracks: {
      get: "sharedMusicTracks.get",
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

vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/music/download-url", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

describe("POST /api/music/download-url", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.query.mockResolvedValue({
      audioObject: { key: "shared/music/track_1.mp3" },
      id: "track_1",
    });
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      expiresIn: 300,
      url: "https://r2.example/music",
    });
  });

  it("returns 401 before parsing when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest({ id: "track_1" }));

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("creates a signed URL after loading the track and consuming quota", async () => {
    const response = await POST(createRequest({ id: " track_1 " }));

    await expect(response.json()).resolves.toEqual({
      expiresIn: 300,
      url: "https://r2.example/music",
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.query).toHaveBeenCalledWith(
      api.sharedMusicTracks.get,
      { id: "track_1" },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeR2Download,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.getR2DownloadSignedUrl).toHaveBeenCalledWith(
      "shared/music/track_1.mp3",
    );
  });

  it("returns validation and rate-limit responses", async () => {
    const missingId = await POST(createRequest({ id: " " }));

    expect(missingId.status).toBe(400);

    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "musicDownload",
        retryAfter: 1000,
      },
    });

    const rateLimitResponse = await POST(createRequest({ id: "track_1" }));

    expect(rateLimitResponse.status).toBe(429);
  });
});
