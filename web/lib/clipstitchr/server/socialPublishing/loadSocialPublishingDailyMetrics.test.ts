import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadSocialPublishingDailyMetrics } from "@/lib/clipstitchr/server/socialPublishing/loadSocialPublishingDailyMetrics";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";

vi.mock("@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing", () => ({
  requestSocialPublishing: vi.fn(),
}));

const requestSocialPublishingMock = vi.mocked(requestSocialPublishing);

describe("loadSocialPublishingDailyMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("merges account scopes into one received-engagement timeline", async () => {
    requestSocialPublishingMock
      .mockResolvedValueOnce({
        dailyData: [
          {
            date: "2026-08-12",
            metrics: { likes: 4, views: 100 },
            postCount: 1,
          },
        ],
      })
      .mockResolvedValueOnce({
        daily_data: [
          {
            date: "2026-08-12",
            metrics: { comments: 2, likes: 3, views: 50 },
            post_count: 2,
          },
        ],
      });

    const result = await loadSocialPublishingDailyMetrics("key", [
      { accountId: "account_1" },
      { accountId: "account_2" },
    ]);

    expect(result).toEqual([
      {
        date: "2026-08-12",
        metrics: {
          clicks: 0,
          comments: 2,
          impressions: 0,
          likes: 7,
          reach: 0,
          saves: 0,
          shares: 0,
          views: 150,
        },
        postCount: 3,
      },
    ]);
    const firstQuery = requestSocialPublishingMock.mock.calls[0][1]
      ?.query as URLSearchParams;
    expect(firstQuery.get("source")).toBe("all");
    expect(firstQuery.get("attribution")).toBe("received");
  });
});
