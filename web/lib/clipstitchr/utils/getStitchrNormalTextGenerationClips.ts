import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function getStitchrNormalTextGenerationClips(
  activeUgcClip: VideoClipMetadata | null,
  selectedDemoClip: VideoClipMetadata | null,
) {
  return [
    ...(activeUgcClip ? [activeUgcClip] : []),
    ...(selectedDemoClip ? [selectedDemoClip] : []),
  ];
}
