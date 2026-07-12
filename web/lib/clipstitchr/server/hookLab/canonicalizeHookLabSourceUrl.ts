import { getHookLabSourcePlatform } from "@/lib/clipstitchr/server/hookLab/getHookLabSourcePlatform";

export function canonicalizeHookLabSourceUrl(input: string) {
  const trimmedInput = input.trim();
  const platform = getHookLabSourcePlatform(trimmedInput);

  if (!platform) {
    throw new Error("Paste a public TikTok or Instagram post link.");
  }

  const url = new URL(trimmedInput);
  const pathSegments = url.pathname.split("/").filter(Boolean);

  if (platform === "tiktok") {
    return `https://www.tiktok.com/${pathSegments[0].toLowerCase()}/video/${pathSegments[2]}`;
  }

  const postKind = pathSegments[0] === "p" ? "p" : "reel";

  return `https://www.instagram.com/${postKind}/${pathSegments[1]}/`;
}
