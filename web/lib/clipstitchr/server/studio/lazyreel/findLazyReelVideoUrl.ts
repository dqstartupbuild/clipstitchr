const allowedLazyReelVideoHosts = new Set(["tiktok.com", "www.tiktok.com"]);

export function findLazyReelVideoUrl(input: string) {
  try {
    const url = new URL(input.trim());
    return url.protocol === "https:" && allowedLazyReelVideoHosts.has(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
