import type { StudioStitchSegmentPlan } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchSegmentPlan";

export function getStudioReelSegmentVideoFilter(
  segment: StudioStitchSegmentPlan,
) {
  const fit =
    segment.fit === "cover"
      ? "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
      : "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black";
  return [
    `setpts=(PTS-STARTPTS)/${segment.playbackRate.toFixed(8)}`,
    fit,
    "fps=30",
    "format=yuv420p",
  ].join(",");
}
