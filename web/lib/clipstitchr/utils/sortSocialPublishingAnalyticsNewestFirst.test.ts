import { describe, expect, it } from "vitest";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";
import { sortSocialPublishingAnalyticsNewestFirst } from "@/lib/clipstitchr/utils/sortSocialPublishingAnalyticsNewestFirst";

function createAnalytics(
  id: string,
  platformCreatedAt: string | null,
): SocialPublishingAnalytics {
  return {
    account_id: null,
    account_username: null,
    click_count: 0,
    comment_count: 0,
    cover_image_url: null,
    duration: null,
    engagement_rate: 0,
    follow_count: 0,
    id,
    impression_count: 0,
    is_external: false,
    last_synced_at: "2026-07-19T12:00:00.000Z",
    like_count: 0,
    match_confidence: null,
    platform: "tiktok",
    platform_created_at: platformCreatedAt,
    platform_post_id: null,
    post_result_id: `result_${id}`,
    reach_count: 0,
    reels_average_watch_time: null,
    reels_total_watch_time: null,
    save_count: 0,
    share_count: 0,
    share_url: null,
    video_description: "",
    view_count: 0,
  };
}

describe("sortSocialPublishingAnalyticsNewestFirst", () => {
  it("puts the newest posts first and unknown dates last", () => {
    const analytics = [
      createAnalytics("older", "2026-07-01T12:00:00.000Z"),
      createAnalytics("unknown", null),
      createAnalytics("newest", "2026-07-19T12:00:00.000Z"),
    ];

    const sorted = sortSocialPublishingAnalyticsNewestFirst(analytics);

    expect(sorted.map((item) => item.id)).toEqual([
      "newest",
      "older",
      "unknown",
    ]);
    expect(analytics.map((item) => item.id)).toEqual([
      "older",
      "unknown",
      "newest",
    ]);
  });
});
