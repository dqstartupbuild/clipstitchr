import { describe, expect, it } from "vitest";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import { getPostBridgeAnalyticsTotals } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsTotals";

function createAnalytics(
  id: string,
  metrics: Pick<
    PostBridgeAnalytics,
    "comment_count" | "like_count" | "share_count" | "view_count"
  >,
): PostBridgeAnalytics {
  return {
    ...metrics,
    cover_image_url: null,
    duration: null,
    id,
    last_synced_at: "2026-06-28T12:00:00.000Z",
    match_confidence: null,
    platform: "instagram",
    platform_created_at: "2026-06-28T12:00:00.000Z",
    platform_post_id: null,
    post_result_id: `result_${id}`,
    share_url: null,
    video_description: null,
  };
}

describe("getPostBridgeAnalyticsTotals", () => {
  it("splits views, likes, comments, and shares into separate totals", () => {
    expect(
      getPostBridgeAnalyticsTotals([
        createAnalytics("one", {
          comment_count: 3,
          like_count: 20,
          share_count: 2,
          view_count: 100,
        }),
        createAnalytics("two", {
          comment_count: 4,
          like_count: 30,
          share_count: 5,
          view_count: 200,
        }),
      ]),
    ).toEqual({
      comments: 7,
      likes: 50,
      shares: 7,
      views: 300,
    });
  });
});
