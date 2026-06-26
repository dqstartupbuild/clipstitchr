import { createTikTokScraperBaseInput } from "@/lib/clipstitchr/server/tiktok/createTikTokScraperBaseInput";

export function createTikTokScraperSearchInput(query: string, limit: number) {
  return {
    ...createTikTokScraperBaseInput(limit),
    searchQueries: [query],
    searchSection: "/video",
  };
}
