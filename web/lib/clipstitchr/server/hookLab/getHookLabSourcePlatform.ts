import type { HookLabPostPlatform } from "@/lib/clipstitchr/types/HookLabPostPlatform";

export function getHookLabSourcePlatform(
  input: string,
): HookLabPostPlatform | null {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:") {
    return null;
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const isTikTokHost = [
    "tiktok.com",
    "www.tiktok.com",
    "m.tiktok.com",
  ].includes(hostname);

  if (
    isTikTokHost &&
    pathSegments.length === 3 &&
    /^@[a-z0-9._-]+$/i.test(pathSegments[0] ?? "") &&
    (pathSegments[1] === "video" || pathSegments[1] === "photo") &&
    /^\d+$/.test(pathSegments[2] ?? "")
  ) {
    return "tiktok";
  }

  if (
    ((hostname === "vt.tiktok.com" || hostname === "vm.tiktok.com") &&
      pathSegments.length === 1 &&
      /^[a-z0-9_-]+$/i.test(pathSegments[0] ?? "")) ||
    (isTikTokHost &&
      pathSegments.length === 2 &&
      pathSegments[0] === "t" &&
      /^[a-z0-9_-]+$/i.test(pathSegments[1] ?? ""))
  ) {
    return "tiktok";
  }

  const isInstagramHost = [
    "instagram.com",
    "www.instagram.com",
    "instagr.am",
    "www.instagr.am",
  ].includes(hostname);

  if (
    isInstagramHost &&
    pathSegments.length === 2 &&
    (pathSegments[0] === "p" ||
      pathSegments[0] === "reel" ||
      pathSegments[0] === "reels" ||
      pathSegments[0] === "tv") &&
    /^[a-z0-9_-]+$/i.test(pathSegments[1] ?? "")
  ) {
    return "instagram";
  }

  if (
    isInstagramHost &&
    pathSegments[0] === "share" &&
    pathSegments.length >= 2 &&
    pathSegments.length <= 3 &&
    pathSegments.slice(1).every((segment) => /^[a-z0-9_-]+$/i.test(segment))
  ) {
    return "instagram";
  }

  return null;
}
