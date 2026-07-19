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

  if (
    (hostname === "tiktok.com" ||
      hostname === "www.tiktok.com" ||
      hostname === "m.tiktok.com") &&
    pathSegments.length === 3 &&
    /^@[a-z0-9._-]+$/i.test(pathSegments[0] ?? "") &&
    pathSegments[1] === "video" &&
    /^\d+$/.test(pathSegments[2] ?? "")
  ) {
    return "tiktok";
  }

  if (
    (hostname === "instagram.com" || hostname === "www.instagram.com") &&
    pathSegments.length === 2 &&
    (pathSegments[0] === "p" ||
      pathSegments[0] === "reel" ||
      pathSegments[0] === "reels") &&
    /^[a-z0-9_-]+$/i.test(pathSegments[1] ?? "")
  ) {
    return "instagram";
  }

  return null;
}
