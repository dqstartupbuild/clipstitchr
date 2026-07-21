import { getHookLabSourcePlatform } from "@/lib/clipstitchr/server/hookLab/getHookLabSourcePlatform";
import { extractHookLabSourceUrl } from "@/lib/clipstitchr/server/hookLab/extractHookLabSourceUrl";

export function canonicalizeHookLabSourceUrl(input: string) {
  const trimmedInput = extractHookLabSourceUrl(input);
  const platform = getHookLabSourcePlatform(trimmedInput);

  if (!platform) {
    throw new Error("Paste a public TikTok or Instagram post link.");
  }

  const url = new URL(trimmedInput);
  const pathSegments = url.pathname.split("/").filter(Boolean);

  if (platform === "tiktok") {
    const hostname = url.hostname.toLowerCase();

    if (hostname === "vt.tiktok.com" || hostname === "vm.tiktok.com") {
      return `https://${hostname}/${pathSegments[0]}/`;
    }

    if (pathSegments[0] === "t") {
      return `https://www.tiktok.com/t/${pathSegments[1]}/`;
    }

    return `https://www.tiktok.com/${pathSegments[0].toLowerCase()}/${pathSegments[1]}/${pathSegments[2]}`;
  }

  if (pathSegments[0] === "share") {
    return `https://www.instagram.com/${pathSegments.join("/")}/`;
  }

  const postKind = pathSegments[0] === "p" ? "p" : pathSegments[0] === "tv" ? "tv" : "reel";

  return `https://www.instagram.com/${postKind}/${pathSegments[1]}/`;
}
