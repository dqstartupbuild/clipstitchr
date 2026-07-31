import type { TikTokCapabilitySnapshot } from "./types/TikTokCapabilitySnapshot";

export function readTikTokCapabilitySnapshot(
  value?: string,
): TikTokCapabilitySnapshot | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<TikTokCapabilitySnapshot>;

    if (
      !Array.isArray(parsed.privacy_level_options) ||
      typeof parsed.comment_disabled !== "boolean" ||
      typeof parsed.duet_disabled !== "boolean" ||
      typeof parsed.stitch_disabled !== "boolean" ||
      typeof parsed.max_video_post_duration_sec !== "number"
    ) {
      return null;
    }

    return parsed as TikTokCapabilitySnapshot;
  } catch {
    return null;
  }
}
