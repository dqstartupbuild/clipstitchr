import { beforeEach, describe, expect, it, vi } from "vitest";
import { listSocialPublishingAnalytics } from "@/lib/clipstitchr/server/socialPublishing/listSocialPublishingAnalytics";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";

vi.mock("@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing", () => ({
  requestSocialPublishing: vi.fn(),
}));

const requestSocialPublishingMock = vi.mocked(requestSocialPublishing);

function createAnalyticsPost(
  id: string,
  accountId = `account_${id}`,
  platform = "tiktok",
) {
  return {
    analytics: {
      clicks: 6,
      comments: 3,
      engagementRate: 4.2,
      follows: 1,
      impressions: 480,
      lastUpdated: "2026-08-01T00:00:00.000Z",
      likes: 12,
      reach: 390,
      saves: 4,
      shares: 2,
      views: 300,
    },
    content: "Launch",
    isExternal: true,
    latePostId: null,
    platformAnalytics: [
      {
        accountId,
        accountUsername: "@launch",
        analytics: null,
        platform,
        platformPostId: `platform_${id}`,
        platformPostUrl: `https://example.com/${id}`,
      },
    ],
    postId: id,
    publishedAt: "2026-08-01T00:00:00.000Z",
  };
}

function readQuery(callIndex: number) {
  return requestSocialPublishingMock.mock.calls[callIndex]?.[1]
    ?.query as URLSearchParams;
}

describe("listSocialPublishingAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads external and Zernio posts with the full metric set", async () => {
    requestSocialPublishingMock.mockResolvedValue({
      posts: [createAnalyticsPost("post_1")],
      pagination: { pages: 1 },
    });

    const analytics = await listSocialPublishingAnalytics("zernio_key");

    expect(requestSocialPublishingMock).toHaveBeenCalledOnce();
    expect(readQuery(0).get("page")).toBe("1");
    expect(readQuery(0).get("limit")).toBe("100");
    expect(readQuery(0).get("source")).toBe("all");
    expect(readQuery(0).get("fromDate")).toMatch(/^20\d\d-\d\d-\d\d$/);
    expect(analytics).toEqual([
      expect.objectContaining({
        account_id: "account_post_1",
        account_username: "@launch",
        click_count: 6,
        comment_count: 3,
        engagement_rate: 4.2,
        follow_count: 1,
        id: "post_1:tiktok:account_post_1",
        impression_count: 480,
        is_external: true,
        like_count: 12,
        platform: "tiktok",
        post_result_id: "post_1",
        reach_count: 390,
        save_count: 4,
        share_count: 2,
        view_count: 300,
      }),
    ]);
  });

  it("loads every Zernio page and deduplicates documented postId values", async () => {
    requestSocialPublishingMock
      .mockResolvedValueOnce({
        posts: [createAnalyticsPost("post_1")],
        pagination: { pages: 2 },
      })
      .mockResolvedValueOnce({
        posts: [
          createAnalyticsPost("post_1"),
          createAnalyticsPost("post_2"),
        ],
        pagination: { pages: 2 },
      });

    const analytics = await listSocialPublishingAnalytics("zernio_key");

    expect(requestSocialPublishingMock).toHaveBeenCalledTimes(2);
    expect(readQuery(1).get("page")).toBe("2");
    expect(analytics.map((item) => item.post_result_id)).toEqual([
      "post_1",
      "post_2",
    ]);
  });

  it("keeps every post from the selected connected accounts", async () => {
    requestSocialPublishingMock.mockResolvedValue({
      posts: [
        createAnalyticsPost("post_1", "selected"),
        createAnalyticsPost("post_2", "other"),
        createAnalyticsPost("post_3", "selected", "myspace"),
      ],
      pagination: { pages: 1 },
    });

    const analytics = await listSocialPublishingAnalytics("zernio_key", [
      "selected",
    ]);

    expect(analytics.map((item) => item.post_result_id)).toEqual(["post_1"]);
  });
});
