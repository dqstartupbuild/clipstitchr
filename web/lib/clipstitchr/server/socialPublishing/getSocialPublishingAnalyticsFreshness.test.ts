import { describe, expect, it } from "vitest";
import { getSocialPublishingAnalyticsFreshness } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAnalyticsFreshness";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

function createAnalytics(lastSyncedAt: string): SocialPublishingAnalytics {
  return {
    account_id: null,
    account_username: null,
    click_count: 0,
    comment_count: 0,
    cover_image_url: null,
    duration: null,
    engagement_rate: 0,
    follow_count: 0,
    id: "analytics_1",
    impression_count: 0,
    is_external: false,
    last_synced_at: lastSyncedAt,
    like_count: 0,
    match_confidence: null,
    platform: "tiktok",
    platform_created_at: null,
    platform_post_id: null,
    post_result_id: "post_1",
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

describe("getSocialPublishingAnalyticsFreshness", () => {
  it("uses Zernio's 60-minute analytics cache window", () => {
    const nowMs = Date.parse("2026-08-10T12:00:00.000Z");

    expect(
      getSocialPublishingAnalyticsFreshness(
        [createAnalytics("2026-08-10T11:30:00.000Z")],
        nowMs,
      ).stale,
    ).toBe(false);
    expect(
      getSocialPublishingAnalyticsFreshness(
        [createAnalytics("2026-08-10T10:30:00.000Z")],
        nowMs,
      ).stale,
    ).toBe(true);
  });
});
