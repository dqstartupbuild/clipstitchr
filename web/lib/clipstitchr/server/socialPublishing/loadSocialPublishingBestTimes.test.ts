import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadSocialPublishingBestTimes } from "@/lib/clipstitchr/server/socialPublishing/loadSocialPublishingBestTimes";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";

vi.mock("@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing", () => ({
  requestSocialPublishing: vi.fn(),
}));

const requestSocialPublishingMock = vi.mocked(requestSocialPublishing);

describe("loadSocialPublishingBestTimes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("weights matching slots by the number of observed posts", async () => {
    requestSocialPublishingMock
      .mockResolvedValueOnce({
        slots: [
          { avg_engagement: 100, day_of_week: 1, hour: 18, post_count: 2 },
        ],
      })
      .mockResolvedValueOnce({
        slots: [
          { avg_engagement: 200, day_of_week: 1, hour: 18, post_count: 1 },
        ],
      });

    const result = await loadSocialPublishingBestTimes("key", [
      { accountId: "account_1" },
      { accountId: "account_2" },
    ]);

    expect(result).toEqual([
      {
        averageEngagement: 400 / 3,
        dayOfWeek: 1,
        hour: 18,
        postCount: 3,
      },
    ]);
  });
});
