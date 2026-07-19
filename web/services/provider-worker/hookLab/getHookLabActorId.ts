import type { HookLabPostPlatform } from "@/lib/clipstitchr/types/HookLabPostPlatform";

export function getHookLabActorId(platform: HookLabPostPlatform) {
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
