import type { SocialAnalyticsSnapshot } from "../SocialAnalyticsSnapshot";
import type { TikTokVideoAnalytics } from "./queryTikTokVideoAnalytics";

export function createTikTokOfficialAnalyticsSnapshot(
  analytics: TikTokVideoAnalytics,
): SocialAnalyticsSnapshot {
  const values = {
    views: analytics.viewCount,
    likes: analytics.likeCount,
    comments: analytics.commentCount,
    shares: analytics.shareCount,
  };
  const available = Object.entries(values)
    .filter(([, value]) => value !== null)
    .map(([name]) => name);

  return {
    source: "tiktok_official",
    views: analytics.viewCount,
    reach: null,
    likes: analytics.likeCount,
    comments: analytics.commentCount,
    shares: analytics.shareCount,
    saves: null,
    watchTimeSeconds: null,
    availabilityJson: JSON.stringify({
      available,
      unavailable: [
        ...Object.entries(values)
          .filter(([, value]) => value === null)
          .map(([name]) => name),
        "reach",
        "saves",
        "watchTimeSeconds",
      ],
      reason:
        "TikTok does not provide saves, reach, or watch time through this endpoint.",
    }),
  };
}
