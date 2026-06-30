import type { PostBridgeUploadedMedia } from "@/lib/clipstitchr/types/PostBridgeUploadedMedia";

export function getPostBridgeUploadedMediaSizeBytes(
  mediaFiles: PostBridgeUploadedMedia[],
) {
  return mediaFiles.reduce((total, mediaFile) => total + mediaFile.sizeBytes, 0);
}
