import { createHookLabInstagramActorInput } from "@/lib/clipstitchr/server/hookLab/createHookLabInstagramActorInput";
import { createHookLabTikTokActorInput } from "@/lib/clipstitchr/server/hookLab/createHookLabTikTokActorInput";
import type { HookLabSourcePlatform } from "@/lib/clipstitchr/types/HookLabSourcePlatform";

export function createHookLabApifyInput(
  platform: HookLabSourcePlatform,
  canonicalUrl: string,
) {
  return platform === "tiktok"
    ? createHookLabTikTokActorInput(canonicalUrl)
    : createHookLabInstagramActorInput(canonicalUrl);
}
