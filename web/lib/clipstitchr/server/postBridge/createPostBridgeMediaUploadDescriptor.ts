import { getPostBridgeMaxMediaBytes } from "@/lib/clipstitchr/server/postBridge/getPostBridgeMaxMediaBytes";
import { getPostBridgeMediaKindFromMimeType } from "@/lib/clipstitchr/server/postBridge/getPostBridgeMediaKindFromMimeType";
import { normalizePostBridgeMediaMimeType } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeMediaMimeType";
import type { PostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/types/PostBridgeMediaUploadDescriptor";

type CreatePostBridgeMediaUploadDescriptorOptions = {
  mimeType: string;
  name: string;
  sizeBytes: number;
};

export function createPostBridgeMediaUploadDescriptor({
  mimeType,
  name,
  sizeBytes,
}: CreatePostBridgeMediaUploadDescriptorOptions): PostBridgeMediaUploadDescriptor {
  const normalizedMimeType = normalizePostBridgeMediaMimeType(mimeType);
  const mediaKind = getPostBridgeMediaKindFromMimeType(normalizedMimeType);
  const roundedSizeBytes = Math.ceil(sizeBytes);

  if (!mediaKind) {
    throw new Error("Post Bridge supports PNG, JPEG, MP4, or MOV media.");
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    throw new Error("Choose media before scheduling.");
  }

  if (roundedSizeBytes > getPostBridgeMaxMediaBytes()) {
    throw new Error("That media file is too large to schedule.");
  }

  return {
    mediaKind,
    mimeType: normalizedMimeType,
    name: name.trim() || "clipstitchr-post",
    sizeBytes: roundedSizeBytes,
  };
}
