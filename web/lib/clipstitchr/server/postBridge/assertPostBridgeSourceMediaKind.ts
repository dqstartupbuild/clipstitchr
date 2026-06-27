import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";

export function assertPostBridgeSourceMediaKind(
  sourceType: PostBridgeSourceType,
  mediaKind: PostBridgeMediaKind,
) {
  if (sourceType === "stitch" && mediaKind !== "video") {
    throw new Error("Stitches need a finished video before scheduling.");
  }
}
