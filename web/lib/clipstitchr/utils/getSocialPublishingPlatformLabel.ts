import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";

export function getSocialPublishingPlatformLabel(platform: SocialPublishingPlatform) {
  if (platform === "tiktok") {
    return "TikTok";
  }

  if (platform === "instagram") {
    return "Instagram";
  }

  return "YouTube Shorts";
}
