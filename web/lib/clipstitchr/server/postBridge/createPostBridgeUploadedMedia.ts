import { createPostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/server/postBridge/createPostBridgeMediaUploadDescriptor";
import type { PostBridgeUploadedMedia } from "@/lib/clipstitchr/types/PostBridgeUploadedMedia";

type CreatePostBridgeUploadedMediaOptions = {
  mediaId: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
};

export function createPostBridgeUploadedMedia({
  mediaId,
  mimeType,
  name,
  sizeBytes,
}: CreatePostBridgeUploadedMediaOptions): PostBridgeUploadedMedia {
  const normalizedMediaId = mediaId.trim();

  if (!normalizedMediaId) {
    throw new Error("Unable to prepare this media upload.");
  }

  return {
    ...createPostBridgeMediaUploadDescriptor({
      mimeType,
      name,
      sizeBytes,
    }),
    mediaId: normalizedMediaId,
  };
}
