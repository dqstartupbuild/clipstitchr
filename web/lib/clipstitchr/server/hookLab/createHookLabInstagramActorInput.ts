import { canonicalizeHookLabSourceUrl } from "@/lib/clipstitchr/server/hookLab/canonicalizeHookLabSourceUrl";
import { getHookLabSourcePlatform } from "@/lib/clipstitchr/server/hookLab/getHookLabSourcePlatform";

export function createHookLabInstagramActorInput(input: string) {
  const canonicalUrl = canonicalizeHookLabSourceUrl(input);

  if (getHookLabSourcePlatform(canonicalUrl) !== "instagram") {
    throw new Error("Paste a public Instagram post link.");
  }

  return {
    addParentData: false,
    directUrls: [canonicalUrl],
    maxItems: 1,
    resultsLimit: 1,
    resultsType: "posts",
  };
}
