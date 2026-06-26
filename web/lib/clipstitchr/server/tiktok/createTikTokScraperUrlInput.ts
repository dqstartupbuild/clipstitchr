import { createTikTokScraperBaseInput } from "@/lib/clipstitchr/server/tiktok/createTikTokScraperBaseInput";

export function createTikTokScraperUrlInput(url: string) {
  return {
    ...createTikTokScraperBaseInput(1),
    postURLs: [url],
    shouldDownloadVideos: true,
  };
}
