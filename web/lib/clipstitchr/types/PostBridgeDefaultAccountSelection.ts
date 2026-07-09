import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";

export type PostBridgeDefaultAccountSelection = {
  platforms: PostBridgePlatform[];
  socialAccountIds: number[];
};
