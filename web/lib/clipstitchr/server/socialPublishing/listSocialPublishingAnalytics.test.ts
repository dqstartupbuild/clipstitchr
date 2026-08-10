import { beforeEach, describe, expect, it, vi } from "vitest";
import { listSocialPublishingAnalytics } from "@/lib/clipstitchr/server/socialPublishing/listSocialPublishingAnalytics";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";

vi.mock("@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing", () => ({
  requestSocialPublishing: vi.fn(),
}));

const requestSocialPublishingMock = vi.mocked(requestSocialPublishing);

function createAnalyticsPost(id: string, platform = "tiktok") {
  return {
    _id: id,
    analytics: {
      comments: 3,
      lastUpdated: "2026-08-01T00:00:00.000Z",
      likes: 12,
      shares: 2,
      views: 300,
    },
    content: "Launch",
    latePostId: "late_" + id,
    platforms: [
      {
        accountId: "account_" + id,
        analytics: null,
        platform,
        platformPostId: "platform_" + id,
        platformPostUrl: "https://example.com/" + id,
      },
    ],
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

  it("loads and normalizes Zernio analytics", async () => {
    requestSocialPublishingMock.mockResolvedValue({
      posts: [createAnalyticsPost("post_1")],
      pagination: { pages: 1 },
    });

    const analytics = await listSocialPublishingAnalytics("zernio_key");

    expect(requestSocialPublishingMock).toHaveBeenCalledOnce();
    expect(readQuery(0).get("page")).toBe("1");
    expect(readQuery(0).get("limit")).toBe("100");
    expect(readQuery(0).get("source")).toBe("late");
    expect(readQuery(0).get("fromDate")).toMatch(/^20\d\d-\d\d-\d\d$/);
    expect(analytics).toEqual([
      expect.objectContaining({
        comment_count: 3,
        id: "post_1:tiktok:account_post_1",
        like_count: 12,
        platform: "tiktok",
        post_result_id: "late_post_1",
        share_count: 2,
        view_count: 300,
      }),
    ]);
  });

  it("loads every Zernio page and deduplicates posts", async () => {
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
      "late_post_1",
      "late_post_2",
    ]);
  });

  it("keeps mapped posts on supported platforms", async () => {
    requestSocialPublishingMock.mockResolvedValue({
      posts: [
        createAnalyticsPost("post_1"),
        createAnalyticsPost("post_2"),
        createAnalyticsPost("post_3", "myspace"),
      ],
      pagination: { pages: 1 },
    });

    const analytics = await listSocialPublishingAnalytics("zernio_key", [
      "late_post_1",
      "late_post_3",
    ]);

    expect(analytics.map((item) => item.post_result_id)).toEqual([
      "late_post_1",
    ]);
  });
});
