import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function createVideoClipMetadataFromClip(
  clip: VideoClip,
): VideoClipMetadata {
  const metadata = { ...clip } as Partial<VideoClip>;

  delete metadata.blob;

  return metadata as VideoClipMetadata;
}
