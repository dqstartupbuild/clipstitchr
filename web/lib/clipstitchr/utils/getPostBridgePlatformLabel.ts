import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";

export function getPostBridgePlatformLabel(platform: PostBridgePlatform) {
  if (platform === "tiktok") {
    return "TikTok";
  }

  if (platform === "instagram") {
    return "Instagram";
  }

  return "YouTube Shorts";
}
