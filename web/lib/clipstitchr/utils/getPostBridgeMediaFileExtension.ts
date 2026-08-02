import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";

export function getPostBridgeMediaFileExtension(
  mediaKind: PostBridgeMediaKind,
) {
  return mediaKind === "image" ? "png" : "mp4";
}
