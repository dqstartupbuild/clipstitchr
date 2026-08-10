import { describe, expect, it } from "vitest";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";
import { filterSocialPublishingAnalyticsByTimeRange } from "@/lib/clipstitchr/utils/filterSocialPublishingAnalyticsByTimeRange";

function createAnalytics(
  id: string,
  platformCreatedAt: unknown,
): SocialPublishingAnalytics {
  return {
    comment_count: 1,
    cover_image_url: null,
    duration: null,
    id,
    last_synced_at: "2026-06-28T12:00:00.000Z",
    like_count: 2,
    match_confidence: null,
    platform: "tiktok",
    platform_created_at: platformCreatedAt,
    platform_post_id: null,
    post_result_id: `result_${id}`,
    share_count: 3,
    share_url: null,
    video_description: null,
    view_count: 4,
  };
}

describe("filterSocialPublishingAnalyticsByTimeRange", () => {
  const nowMs = Date.parse("2026-06-28T12:00:00.000Z");
  const analytics = [
    createAnalytics("fresh", "2026-06-28T00:30:00.000Z"),
    createAnalytics("week", "2026-06-24T12:00:00.000Z"),
    createAnalytics("month", "2026-06-01T12:00:00.000Z"),
    createAnalytics("quarter", "2026-04-01T12:00:00.000Z"),
    createAnalytics("year", "2025-08-01T12:00:00.000Z"),
    createAnalytics("older", "2024-06-01T12:00:00.000Z"),
    createAnalytics("unknown", null),
  ];

  it("keeps every row for all time", () => {
    expect(
      filterSocialPublishingAnalyticsByTimeRange(analytics, "all_time", nowMs).map(
        (item) => item.id,
      ),
    ).toEqual(["fresh", "week", "month", "quarter", "year", "older", "unknown"]);
  });

  it("defaults cleanly to the last 30 days range", () => {
    expect(
      filterSocialPublishingAnalyticsByTimeRange(analytics, "last_30_days", nowMs).map(
        (item) => item.id,
      ),
    ).toEqual(["fresh", "week", "month"]);
  });

  it("supports short and long custom ranges", () => {
    expect(
      filterSocialPublishingAnalyticsByTimeRange(
        analytics,
        "last_24_hours",
        nowMs,
      ).map((item) => item.id),
    ).toEqual(["fresh"]);
    expect(
      filterSocialPublishingAnalyticsByTimeRange(
        analytics,
        "last_12_months",
        nowMs,
      ).map((item) => item.id),
    ).toEqual(["fresh", "week", "month", "quarter", "year"]);
  });
});
