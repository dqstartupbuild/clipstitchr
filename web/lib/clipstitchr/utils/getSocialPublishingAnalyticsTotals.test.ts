import { describe, expect, it } from "vitest";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";
import { getSocialPublishingAnalyticsTotals } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsTotals";

function createAnalytics(
  id: string,
  metrics: Pick<
    SocialPublishingAnalytics,
    "comment_count" | "like_count" | "share_count" | "view_count"
  >,
): SocialPublishingAnalytics {
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

describe("getSocialPublishingAnalyticsTotals", () => {
  it("splits views, likes, comments, and shares into separate totals", () => {
    expect(
      getSocialPublishingAnalyticsTotals([
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
