import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";
import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";

export function assertPostBridgePlatformMediaKind(
  mediaKind: PostBridgeMediaKind,
  platforms: PostBridgePlatform[],
) {
  if (mediaKind === "image" && platforms.includes("youtube")) {
    throw new Error(
      "YouTube Shorts needs a video. Remove YouTube or add a sound so this Swipe can be rendered as a video.",
    );
  }
}
