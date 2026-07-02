import { getApifyInstagramProfileActorId } from "@/lib/clipstitchr/server/apify/getApifyInstagramProfileActorId";
import { getApifyTikTokProfileActorId } from "@/lib/clipstitchr/server/apify/getApifyTikTokProfileActorId";
import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";

export function getApifyProfileActorIdForPlatform(
  platform: PostBridgePlatform,
) {
  if (platform === "tiktok") {
    return getApifyTikTokProfileActorId();
  }

  if (platform === "instagram") {
    return getApifyInstagramProfileActorId();
  }

  return null;
}
