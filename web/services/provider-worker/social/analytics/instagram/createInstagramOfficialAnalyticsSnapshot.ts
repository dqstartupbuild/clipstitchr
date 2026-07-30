import type { SocialAnalyticsSnapshot } from "../SocialAnalyticsSnapshot";
import type { InstagramMediaMetadata } from "./fetchInstagramMediaMetadata";

export function createInstagramOfficialAnalyticsSnapshot({
  metadata,
  metrics,
  unavailableMetrics,
}: {
  metadata: InstagramMediaMetadata;
  metrics: Record<string, number | null>;
  unavailableMetrics: string[];
}): SocialAnalyticsSnapshot {
  const values = {
    views: metrics.views ?? null,
    reach: metrics.reach ?? null,
    likes: metadata.likeCount,
    comments: metadata.commentsCount,
    shares: metrics.shares ?? null,
    saves: metrics.saved ?? null,
    watchTimeSeconds:
      typeof metrics.ig_reels_video_view_total_time === "number"
        ? metrics.ig_reels_video_view_total_time / 1_000
        : null,
  };

  return {
    source: "instagram_official",
    ...values,
    availabilityJson: JSON.stringify({
      available: Object.entries(values)
        .filter(([, value]) => value !== null)
        .map(([name]) => name),
      unavailable: Array.from(
        new Set([
          ...Object.entries(values)
            .filter(([, value]) => value === null)
            .map(([name]) => name),
          ...unavailableMetrics,
        ]),
      ),
      mediaType: metadata.mediaType,
      mediaProductType: metadata.mediaProductType,
    }),
  };
}
