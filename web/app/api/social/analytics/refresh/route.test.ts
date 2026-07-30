import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  assertInHouseSocialPublishingEnabled: vi.fn(),
  createAuthenticatedConvexHttpClient: vi.fn(),
  dispatchSocialProviderWorkerFromApi: vi.fn(),
  getAuthenticatedConvexToken: vi.fn(),
  getAuthenticatedUserId: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));
vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));
vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient:
      mocks.createAuthenticatedConvexHttpClient,
  }),
);
vi.mock(
  "@/lib/clipstitchr/server/social/dispatchSocialProviderWorkerFromApi",
  () => ({
    dispatchSocialProviderWorkerFromApi:
      mocks.dispatchSocialProviderWorkerFromApi,
  }),
);
vi.mock(
  "@/lib/clipstitchr/social/assertInHouseSocialPublishingEnabled",
  () => ({
    assertInHouseSocialPublishingEnabled:
      mocks.assertInHouseSocialPublishingEnabled,
  }),
);

describe("POST /api/social/analytics/refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("owner_1");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex_token");
  });

  it("returns 429 with retry timing when the refresh limit is reached", async () => {
    const mutation = vi.fn().mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "socialAnalyticsRefresh",
        retryAfter: 2_500,
      },
    });
    mocks.createAuthenticatedConvexHttpClient.mockReturnValue({ mutation });
    const response = await POST(
      new Request("https://app.example.com/api/social/analytics/refresh", {
        method: "POST",
        body: JSON.stringify({
          rangeStart: "2026-08-01T00:00:00.000Z",
          rangeEnd: "2026-08-02T00:00:00.000Z",
          includeTikTokSaves: false,
        }),
      }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("3");
    await expect(response.json()).resolves.toMatchObject({
      retryAfterSeconds: 3,
    });
  });
});
