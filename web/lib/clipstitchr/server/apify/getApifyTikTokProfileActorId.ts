import { tiktokScraperActorId } from "@/lib/clipstitchr/server/tiktok/tiktokScraperActorId";

export function getApifyTikTokProfileActorId() {
  return process.env.APIFY_TIKTOK_PROFILE_ACTOR_ID?.trim() || tiktokScraperActorId;
}
