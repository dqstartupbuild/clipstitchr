import { beforeEach, describe, expect, it, vi } from "vitest";
import { listPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/listPostBridgeAnalytics";
import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

vi.mock("@/lib/clipstitchr/server/postBridge/requestPostBridge", () => ({
  requestPostBridge: vi.fn(),
}));

const requestPostBridgeMock = vi.mocked(requestPostBridge);

function createAnalytics(
  id: string,
  platform: string = "tiktok",
): PostBridgeAnalytics {
  return {
    comment_count: 0,
    cover_image_url: null,
    duration: null,
    id,
    last_synced_at: "2026-07-01T00:00:00.000Z",
    like_count: 0,
    match_confidence: null,
    platform: platform as PostBridgeAnalytics["platform"],
    platform_created_at: null,
    platform_post_id: null,
    post_result_id: `result_${id}`,
    share_count: 0,
    share_url: null,
    video_description: null,
    view_count: 0,
  };
}

function readQuery(callIndex: number) {
  return requestPostBridgeMock.mock.calls[callIndex]?.[1]
    ?.query as URLSearchParams;
}

describe("listPostBridgeAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests analytics without post result filters when no ids are given", async () => {
    requestPostBridgeMock.mockResolvedValue({
      data: [createAnalytics("analytics_1")],
      meta: { total: 1 },
    });

    const analytics = await listPostBridgeAnalytics("pb_key");

    expect(requestPostBridgeMock).toHaveBeenCalledOnce();
    expect(readQuery(0).getAll("post_result_id")).toEqual([]);
    expect(readQuery(0).get("offset")).toBe("0");
    expect(readQuery(0).get("timeframe")).toBe("all");
    expect(analytics.map((item) => item.id)).toEqual(["analytics_1"]);
  });

  it("loads all analytics pages before calculating totals", async () => {
    requestPostBridgeMock
      .mockResolvedValueOnce({
        data: Array.from({ length: 100 }, (_, index) =>
          createAnalytics(`analytics_${index}`),
        ),
        meta: { total: 101 },
      })
      .mockResolvedValueOnce({
        data: [createAnalytics("analytics_100")],
        meta: { total: 101 },
      });

    const analytics = await listPostBridgeAnalytics("pb_key");

    expect(requestPostBridgeMock).toHaveBeenCalledTimes(2);
    expect(readQuery(1).get("offset")).toBe("100");
    expect(analytics).toHaveLength(101);
  });

  it("chunks post result ids into groups of 100 and dedupes by id", async () => {
    const postResultIds = Array.from(
      { length: 120 },
      (_, index) => `result_${index}`,
    );

    requestPostBridgeMock
      .mockResolvedValueOnce({
        data: [createAnalytics("analytics_1"), createAnalytics("analytics_2")],
      })
      .mockResolvedValueOnce({
        data: [createAnalytics("analytics_2"), createAnalytics("analytics_3")],
      });

    const analytics = await listPostBridgeAnalytics("pb_key", postResultIds);

    expect(requestPostBridgeMock).toHaveBeenCalledTimes(2);
    expect(readQuery(0).getAll("post_result_id")).toHaveLength(100);
    expect(readQuery(1).getAll("post_result_id")).toHaveLength(20);
    expect(readQuery(0).get("timeframe")).toBe("all");
    expect(analytics.map((item) => item.id)).toEqual([
      "analytics_1",
      "analytics_2",
      "analytics_3",
    ]);
  });

  it("filters unsupported platforms from chunked responses", async () => {
    requestPostBridgeMock.mockResolvedValue({
      data: [
        createAnalytics("analytics_1", "tiktok"),
        createAnalytics("analytics_2", "myspace"),
      ],
    });

    const analytics = await listPostBridgeAnalytics("pb_key", ["result_1"]);

    expect(analytics.map((item) => item.id)).toEqual(["analytics_1"]);
  });
});
