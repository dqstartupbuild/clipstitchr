import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";
import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";

type GetSwiprPostBridgeMediaKindOptions = {
  hasMusic: boolean;
  platforms: PostBridgePlatform[];
};

export function getSwiprPostBridgeMediaKind({
  hasMusic,
  platforms,
}: GetSwiprPostBridgeMediaKindOptions): PostBridgeMediaKind {
  return hasMusic || platforms.includes("youtube") ? "video" : "image";
}
