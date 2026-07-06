import { describe, expect, it } from "vitest";
import { filterPostBridgeAnalyticsByPostResultIds } from "@/lib/clipstitchr/server/postBridge/filterPostBridgeAnalyticsByPostResultIds";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

function createAnalytics(id: string, postResultId: string): PostBridgeAnalytics {
  return {
    comment_count: 0,
    cover_image_url: null,
    duration: null,
    id,
    last_synced_at: "2026-06-20T00:00:00.000Z",
    like_count: 0,
    match_confidence: null,
    platform: "tiktok",
    platform_created_at: "2026-06-20T00:00:00.000Z",
    platform_post_id: null,
    post_result_id: postResultId,
    share_count: 0,
    share_url: null,
    video_description: null,
    view_count: 0,
  };
}

describe("filterPostBridgeAnalyticsByPostResultIds", () => {
  it("keeps only analytics rows for mapped post results", () => {
    expect(
      filterPostBridgeAnalyticsByPostResultIds(
        [
          createAnalytics("analytics_1", "result_1"),
          createAnalytics("analytics_2", "result_2"),
        ],
        ["result_2"],
      ).map((item) => item.id),
    ).toEqual(["analytics_2"]);
  });
});
