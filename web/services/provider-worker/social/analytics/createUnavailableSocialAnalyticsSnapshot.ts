import type { SocialAnalyticsSnapshot } from "./SocialAnalyticsSnapshot";

export function createUnavailableSocialAnalyticsSnapshot(
  source: SocialAnalyticsSnapshot["source"],
  reason: string,
): SocialAnalyticsSnapshot {
  return {
    source,
    views: null,
    reach: null,
    likes: null,
    comments: null,
    shares: null,
    saves: null,
    watchTimeSeconds: null,
    availabilityJson: JSON.stringify({
      available: [],
      unavailable: [
        "views",
        "reach",
        "likes",
        "comments",
        "shares",
        "saves",
        "watchTimeSeconds",
      ],
      reason,
    }),
  };
}
