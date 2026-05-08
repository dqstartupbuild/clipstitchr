import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipBlob } from "@/lib/clipstitchr/types/VideoClipBlob";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function createHydratedVideoClip(
  metadata: VideoClipMetadata,
  blobRecord: VideoClipBlob,
): VideoClip {
  return {
    ...metadata,
    blob: blobRecord.blob,
  };
}
