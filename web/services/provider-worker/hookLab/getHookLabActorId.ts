import type { HookLabSourcePlatform } from "@/lib/clipstitchr/types/HookLabSourcePlatform";

export function getHookLabActorId(platform: HookLabSourcePlatform) {
  const value =
    platform === "tiktok"
      ? process.env.HOOK_LAB_TIKTOK_ACTOR_ID?.trim() ||
        "clockworks/tiktok-scraper"
      : process.env.HOOK_LAB_INSTAGRAM_ACTOR_ID?.trim() ||
        "apify/instagram-scraper";

  if (!value) {
    throw new Error(`Hook Lab ${platform} import is not configured.`);
  }

  return value;
}
