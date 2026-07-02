import { describe, expect, it } from "vitest";
import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import { mergeSyncedContentAnalytics } from "@/lib/clipstitchr/utils/mergeSyncedContentAnalytics";

const currentDuplicateManualAnalytics: ContentAnalytics = {
  account_username: "creator",
  analytics_source: "manual",
  comment_count: 1,
  cover_image_url: null,
  duration: null,
  id: "manual:tiktok:17:735",
  last_synced_at: "2026-01-01T00:00:00.000Z",
  like_count: 2,
  match_confidence: null,
  platform: "tiktok",
  platform_created_at: "2026-01-01T00:00:00.000Z",
  platform_post_id: "735",
  post_result_id: "manual:tiktok:17:735",
  share_count: 3,
  share_url: "https://www.tiktok.com/@creator/video/735",
  video_description: "Manual duplicate",
  view_count: 4,
};
const currentUniqueManualAnalytics: ContentAnalytics = {
  account_username: "creator",
  analytics_source: "manual",
  comment_count: 5,
  cover_image_url: null,
  duration: null,
  id: "manual:tiktok:17:999",
  last_synced_at: "2026-01-02T00:00:00.000Z",
  like_count: 6,
  match_confidence: null,
  platform: "tiktok",
  platform_created_at: "2026-01-02T00:00:00.000Z",
  platform_post_id: "999",
  post_result_id: "manual:tiktok:17:999",
  share_count: 7,
  share_url: "https://www.tiktok.com/@creator/video/999",
  video_description: "Manual unique",
  view_count: 8,
};
const syncedPostBridgeAnalytics: ContentAnalytics = {
  analytics_source: "post_bridge",
  comment_count: 10,
  cover_image_url: null,
  duration: null,
  id: "post_bridge:735",
  last_synced_at: "2026-01-03T00:00:00.000Z",
  like_count: 11,
  match_confidence: null,
  platform: "tiktok",
  platform_created_at: "2026-01-03T00:00:00.000Z",
  platform_post_id: "735",
  post_result_id: "post_bridge:735",
  share_count: 12,
  share_url: "https://www.tiktok.com/@creator/video/735",
  video_description: "Post Bridge row",
  view_count: 13,
};

describe("mergeSyncedContentAnalytics", () => {
  it("keeps last known manual rows during partial sync without duplicating fresh Post Bridge rows", () => {
    const result = mergeSyncedContentAnalytics({
      currentAnalytics: [
        currentDuplicateManualAnalytics,
        currentUniqueManualAnalytics,
      ],
      keepCurrentManualAnalytics: true,
      syncedAnalytics: [syncedPostBridgeAnalytics],
    });

    expect(result.map((item) => item.id)).toEqual([
      "post_bridge:735",
      "manual:tiktok:17:999",
    ]);
  });

  it("uses the fresh sync response as the source of truth after a clean manual sync", () => {
    const result = mergeSyncedContentAnalytics({
      currentAnalytics: [currentUniqueManualAnalytics],
      keepCurrentManualAnalytics: false,
      syncedAnalytics: [syncedPostBridgeAnalytics],
    });

    expect(result.map((item) => item.id)).toEqual(["post_bridge:735"]);
  });
});
