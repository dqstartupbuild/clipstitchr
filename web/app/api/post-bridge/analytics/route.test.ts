import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  createAuthenticatedConvexHttpClient: vi.fn(),
  getAuthenticatedConvexToken: vi.fn(),
  getAuthenticatedUserId: vi.fn(),
  getLatestPostBridgeAnalyticsSyncedAtMs: vi.fn(),
  listPostBridgeAnalytics: vi.fn(),
  resolvePostBridgeApiKey: vi.fn(),
  waitForPostBridgeAnalyticsSync: vi.fn(),
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
  "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret",
  () => ({ getRateLimitApiSecret: () => "rate-limit-secret" }),
);
vi.mock(
  "@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey",
  () => ({ resolvePostBridgeApiKey: mocks.resolvePostBridgeApiKey }),
);
vi.mock(
  "@/lib/clipstitchr/server/postBridge/listPostBridgeAnalytics",
  () => ({ listPostBridgeAnalytics: mocks.listPostBridgeAnalytics }),
);
vi.mock(
  "@/lib/clipstitchr/server/postBridge/getLatestPostBridgeAnalyticsSyncedAtMs",
  () => ({
    getLatestPostBridgeAnalyticsSyncedAtMs:
      mocks.getLatestPostBridgeAnalyticsSyncedAtMs,
  }),
);
vi.mock(
  "@/lib/clipstitchr/server/postBridge/waitForPostBridgeAnalyticsSync",
  () => ({
    waitForPostBridgeAnalyticsSync:
      mocks.waitForPostBridgeAnalyticsSync,
  }),
);

describe("legacy Post Bridge analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("owner_1");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex_token");
    mocks.resolvePostBridgeApiKey.mockResolvedValue("post_bridge_key");
    mocks.listPostBridgeAnalytics.mockResolvedValue([
      { id: "analytics_1" },
    ]);
    mocks.getLatestPostBridgeAnalyticsSyncedAtMs.mockReturnValue(1);
  });

  it("does not trigger a provider sync in read-only migration mode", async () => {
    const mutation = vi.fn().mockResolvedValue(undefined);
    mocks.createAuthenticatedConvexHttpClient.mockReturnValue({ mutation });

    const response = await GET(
      new Request(
        "https://app.example.com/api/post-bridge/analytics?readOnly=1",
      ),
    );

    expect(response.status).toBe(200);
    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mocks.waitForPostBridgeAnalyticsSync).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      syncTriggered: false,
    });
  });
});
