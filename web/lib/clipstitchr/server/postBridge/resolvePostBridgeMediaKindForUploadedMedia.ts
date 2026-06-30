import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";
import type { PostBridgeUploadedMedia } from "@/lib/clipstitchr/types/PostBridgeUploadedMedia";

export function resolvePostBridgeMediaKindForUploadedMedia(
  mediaFiles: PostBridgeUploadedMedia[],
): PostBridgeMediaKind {
  const mediaKind = mediaFiles[0]?.mediaKind;

  if (!mediaKind || mediaFiles.some((mediaFile) => mediaFile.mediaKind !== mediaKind)) {
    throw new Error("Schedule either images or one video, not both.");
  }

  if (mediaKind === "video" && mediaFiles.length > 1) {
    throw new Error("Schedule one video at a time.");
  }

  return mediaKind;
}
