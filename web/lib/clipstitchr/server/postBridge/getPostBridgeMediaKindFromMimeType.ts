import { normalizePostBridgeMediaMimeType } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeMediaMimeType";
import { postBridgeImageMimeTypes } from "@/lib/clipstitchr/server/postBridge/postBridgeImageMimeTypes";
import { postBridgeVideoMimeTypes } from "@/lib/clipstitchr/server/postBridge/postBridgeVideoMimeTypes";
import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";

export function getPostBridgeMediaKindFromMimeType(
  mimeType: string,
): PostBridgeMediaKind | null {
  const normalizedMimeType = normalizePostBridgeMediaMimeType(mimeType);

  if (postBridgeImageMimeTypes.includes(normalizedMimeType)) {
    return "image";
  }

  if (postBridgeVideoMimeTypes.includes(normalizedMimeType)) {
    return "video";
  }

  return null;
}
