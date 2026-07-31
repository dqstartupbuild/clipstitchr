import type { SocialAnalyticsSnapshot } from "../SocialAnalyticsSnapshot";

export function createApifySavesAnalyticsSnapshot(
  saves: number,
): SocialAnalyticsSnapshot {
  return {
    source: "apify_public",
    views: null,
    reach: null,
    likes: null,
    comments: null,
    shares: null,
    saves,
    watchTimeSeconds: null,
    availabilityJson: JSON.stringify({
      available: ["saves"],
      unavailable: [
        "views",
        "reach",
        "likes",
        "comments",
        "shares",
        "watchTimeSeconds",
      ],
      reason:
        "Only saves come from optional public-page enrichment. Official metrics remain authoritative.",
    }),
  };
}
