import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";

export type PostBridgeSocialAccount = {
  id: number;
  platform: PostBridgePlatform;
  username: string;
};
