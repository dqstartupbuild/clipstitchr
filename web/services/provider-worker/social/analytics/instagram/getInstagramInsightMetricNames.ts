import type { InstagramMediaMetadata } from "./fetchInstagramMediaMetadata";

export function getInstagramInsightMetricNames(
  metadata: InstagramMediaMetadata,
) {
  const common = ["views", "reach", "saved", "shares"] as const;

  return metadata.mediaType === "VIDEO" ||
    metadata.mediaProductType === "REELS"
    ? [...common, "ig_reels_video_view_total_time"]
    : [...common];
}
