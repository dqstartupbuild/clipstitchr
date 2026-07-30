import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createConvexHttpClient: vi.fn(() => convex),
    getR2DownloadSignedUrl: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeSocialMediaFetch: "consumeSocialMediaFetch",
    },
    socialMedia: {
      getSocialMediaAccessGrant: {
        getSocialMediaAccessGrant: "getSocialMediaAccessGrant",
      },
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

describe("GET /api/social/media/[token]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.convex.mutation.mockResolvedValue(undefined);
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      url: "https://r2.example/signed-media",
    });
  });

  it("does not sign an R2 URL for an unknown or expired grant", async () => {
    mocks.convex.query.mockResolvedValue(null);

    const response = await GET(
      new Request("https://clipstitchr.com/api/social/media/opaque-token"),
      { params: Promise.resolve({ token: "opaque-token" }) },
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.getR2DownloadSignedUrl).not.toHaveBeenCalled();
  });

  it("rate-limits the owning grant before signing its exact object key", async () => {
    mocks.convex.query.mockResolvedValue({
      objectKey: "users/owner_1/social-post-assets/asset_1/media.mp4",
      ownerId: "owner_1",
    });

    const response = await GET(
      new Request("https://clipstitchr.com/api/social/media/opaque-token"),
      { params: Promise.resolve({ token: "opaque-token" }) },
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://r2.example/signed-media",
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      "consumeSocialMediaFetch",
      {
        ownerId: "owner_1",
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.getR2DownloadSignedUrl).toHaveBeenCalledWith(
      "users/owner_1/social-post-assets/asset_1/media.mp4",
    );
    expect(mocks.convex.mutation.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.getR2DownloadSignedUrl.mock.invocationCallOrder[0],
    );
  });

  it("returns retry timing without signing an R2 URL when limited", async () => {
    mocks.convex.query.mockResolvedValue({
      objectKey: "users/owner_1/social-post-assets/asset_1/media.mp4",
      ownerId: "owner_1",
    });
    mocks.convex.mutation.mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "socialMediaFetch",
        retryAfter: 2_500,
      },
    });

    const response = await GET(
      new Request("https://clipstitchr.com/api/social/media/opaque-token"),
      { params: Promise.resolve({ token: "opaque-token" }) },
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("3");
    expect(mocks.getR2DownloadSignedUrl).not.toHaveBeenCalled();
  });
});
