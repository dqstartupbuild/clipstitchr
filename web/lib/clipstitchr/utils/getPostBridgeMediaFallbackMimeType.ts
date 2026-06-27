import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";

export function getPostBridgeMediaFallbackMimeType(
  mediaKind: PostBridgeMediaKind,
) {
  return mediaKind === "image" ? "image/png" : "video/mp4";
}
