import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/swipr/backgrounds/upload-url/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

    return {
      convex,
      createAuthenticatedConvexHttpClient: vi.fn(() => convex),
      getAuthenticatedConvexToken: vi.fn(),
      getAuthenticatedUserId: vi.fn(),
      getR2UploadSignedUrl: vi.fn(),
    readSwiprBackgroundUploadUrlRequest: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeR2Upload: "rateLimits.consumeR2Upload",
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

vi.mock("@/lib/clipstitchr/server/r2/getR2UploadSignedUrl", () => ({
  getR2UploadSignedUrl: mocks.getR2UploadSignedUrl,
}));

vi.mock(
  "@/lib/clipstitchr/server/r2/readSwiprBackgroundUploadUrlRequest",
  () => ({
    readSwiprBackgroundUploadUrlRequest:
      mocks.readSwiprBackgroundUploadUrlRequest,
  }),
);

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest() {
  return new Request(
    "https://clipstitchr.test/api/swipr/backgrounds/upload-url",
    { body: "{}", method: "POST" },
  );
}

describe("POST /api/swipr/backgrounds/upload-url", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.readSwiprBackgroundUploadUrlRequest.mockResolvedValue({
      contentType: "image/jpeg",
      recordId: "background_1",
      sizeBytes: 123,
    });
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.getR2UploadSignedUrl.mockResolvedValue({
      expiresIn: 300,
      url: "https://r2.example/upload",
    });
  });

  it("returns 401 before parsing when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.readSwiprBackgroundUploadUrlRequest).not.toHaveBeenCalled();
  });

  it("consumes upload quota before returning a signed upload URL", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      expiresIn: 300,
      key: "users/user_123/swipr-backgrounds/background_1/image.jpg",
      url: "https://r2.example/upload",
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeR2Upload,
      {
        secret: "rate-limit-secret",
        sizeBytes: 123,
      },
    );
    expect(mocks.getR2UploadSignedUrl).toHaveBeenCalledWith({
      contentType: "image/jpeg",
      key: "users/user_123/swipr-backgrounds/background_1/image.jpg",
    });
  });

  it("returns parser and rate-limit errors", async () => {
    mocks.readSwiprBackgroundUploadUrlRequest.mockRejectedValueOnce(
      new Error("Missing Swipr background upload size."),
    );

    const invalidResponse = await POST(createRequest());

    expect(invalidResponse.status).toBe(400);

    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "swiprBackgroundUpload",
        retryAfter: 1000,
      },
    });

    const rateLimitResponse = await POST(createRequest());

    expect(rateLimitResponse.status).toBe(429);
  });
});
