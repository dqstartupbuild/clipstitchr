import type { HookLabSourcePlatform } from "@/lib/clipstitchr/types/HookLabSourcePlatform";

export function normalizeHookLabAuthorProfileUrl(
  input: string | undefined,
  platform: HookLabSourcePlatform,
) {
  if (!input) {
    return undefined;
  }

  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    return undefined;
  }

  if (url.protocol !== "https:") {
    return undefined;
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  const pathSegments = url.pathname.split("/").filter(Boolean);

  if (
    platform === "tiktok" &&
    ["tiktok.com", "www.tiktok.com", "m.tiktok.com"].includes(hostname) &&
    pathSegments.length === 1 &&
    /^@[a-z0-9._-]+$/i.test(pathSegments[0] ?? "")
  ) {
    return `https://www.tiktok.com/${pathSegments[0].toLowerCase()}`;
  }

  if (
    platform === "instagram" &&
    ["instagram.com", "www.instagram.com"].includes(hostname) &&
    pathSegments.length === 1 &&
    /^[a-z0-9._]+$/i.test(pathSegments[0] ?? "")
  ) {
    return `https://www.instagram.com/${pathSegments[0].toLowerCase()}/`;
  }

  return undefined;
}
