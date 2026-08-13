export function getLazyReelSafeExternalUrl(value: string) {
  try {
    const url = new URL(value);

    const hostname = url.hostname.toLowerCase();
    const isSupportedHost =
      hostname === "tiktok.com" ||
      hostname.endsWith(".tiktok.com") ||
      hostname === "instagram.com" ||
      hostname.endsWith(".instagram.com");

    return url.protocol === "https:" && isSupportedHost ? url.toString() : null;
  } catch {
    return null;
  }
}
