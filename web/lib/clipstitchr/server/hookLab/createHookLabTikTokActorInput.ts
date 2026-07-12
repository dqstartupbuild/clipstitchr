import { canonicalizeHookLabSourceUrl } from "@/lib/clipstitchr/server/hookLab/canonicalizeHookLabSourceUrl";
import { getHookLabSourcePlatform } from "@/lib/clipstitchr/server/hookLab/getHookLabSourcePlatform";
import { createTikTokScraperUrlInput } from "@/lib/clipstitchr/server/tiktok/createTikTokScraperUrlInput";

export function createHookLabTikTokActorInput(input: string) {
  const canonicalUrl = canonicalizeHookLabSourceUrl(input);

  if (getHookLabSourcePlatform(canonicalUrl) !== "tiktok") {
    throw new Error("Paste a public TikTok post link.");
  }

  return {
    ...createTikTokScraperUrlInput(canonicalUrl),
    maxItems: 1,
    resultsPerPage: 1,
  };
}
