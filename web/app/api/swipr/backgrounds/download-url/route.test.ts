import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/swipr/backgrounds/download-url/route";
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
    readSwiprBackgroundDownloadUrlRequest: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeR2Download: "rateLimits.consumeR2Download",
    },
    swiprBackgrounds: {
      get: "swiprBackgrounds.get",
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

vi.mock(
  "@/lib/clipstitchr/server/r2/readSwiprBackgroundDownloadUrlRequest",
  () => ({
    readSwiprBackgroundDownloadUrlRequest:
      mocks.readSwiprBackgroundDownloadUrlRequest,
  }),
);

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest() {
  return new Request(
    "https://clipstitchr.test/api/swipr/backgrounds/download-url",
    { body: "{}", method: "POST" },
  );
}

describe("POST /api/swipr/backgrounds/download-url", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.readSwiprBackgroundDownloadUrlRequest.mockResolvedValue({
      id: "background_1",
    });
    mocks.convex.query.mockResolvedValue({
      imageObject: {
        key: "users/user_123/swipr-backgrounds/background_1/image.jpg",
      },
    });
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      expiresIn: 300,
      url: "https://r2.example/background",
    });
  });

  it("returns 401 before parsing when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.readSwiprBackgroundDownloadUrlRequest).not.toHaveBeenCalled();
  });

  it("loads the background, consumes quota, and returns a signed download URL", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      expiresIn: 300,
      url: "https://r2.example/background",
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.query).toHaveBeenCalledWith(
      api.swiprBackgrounds.get,
      { id: "background_1" },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeR2Download,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.getR2DownloadSignedUrl).toHaveBeenCalledWith(
      "users/user_123/swipr-backgrounds/background_1/image.jpg",
    );
  });

  it("returns missing-background and rate-limit errors", async () => {
    mocks.convex.query.mockResolvedValueOnce(null);

    const missingResponse = await POST(createRequest());

    expect(missingResponse.status).toBe(400);
    await expect(missingResponse.json()).resolves.toEqual({
      error: "Swipr background not found.",
    });

    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "swiprBackgroundDownload",
        retryAfter: 1000,
      },
    });

    const rateLimitResponse = await POST(createRequest());

    expect(rateLimitResponse.status).toBe(429);
  });
});
