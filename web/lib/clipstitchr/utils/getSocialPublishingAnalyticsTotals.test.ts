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
    account_id: null,
    account_username: null,
    click_count: 0,
    cover_image_url: null,
    duration: null,
    engagement_rate: 0,
    follow_count: 0,
    id,
    impression_count: 0,
    is_external: false,
    last_synced_at: "2026-06-28T12:00:00.000Z",
    match_confidence: null,
    platform: "instagram",
    platform_created_at: "2026-06-28T12:00:00.000Z",
    platform_post_id: null,
    post_result_id: `result_${id}`,
    reach_count: 0,
    reels_average_watch_time: null,
    reels_total_watch_time: null,
    save_count: 0,
    share_url: null,
    video_description: "",
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
      averageEngagementRate: 0,
      clicks: 0,
      comments: 7,
      follows: 0,
      impressions: 0,
      likes: 50,
      reach: 0,
      saves: 0,
      shares: 7,
      views: 300,
    });
  });
});
