import { createHookLabInstagramActorInput } from "@/lib/clipstitchr/server/hookLab/createHookLabInstagramActorInput";
import { createHookLabTikTokActorInput } from "@/lib/clipstitchr/server/hookLab/createHookLabTikTokActorInput";
import type { HookLabPostPlatform } from "@/lib/clipstitchr/types/HookLabPostPlatform";

export function createHookLabApifyInput(
  platform: HookLabPostPlatform,
  canonicalUrl: string,
) {
  return platform === "tiktok"
    ? createHookLabTikTokActorInput(canonicalUrl)
    : createHookLabInstagramActorInput(canonicalUrl);
}
