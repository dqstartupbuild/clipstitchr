import { normalizeApifyProfileUsername } from "@/lib/clipstitchr/server/apify/normalizeApifyProfileUsername";

export function createTikTokProfileAnalyticsInput(username: string) {
  return {
    profiles: [normalizeApifyProfileUsername(username)],
    resultsPerPage: 30,
    shouldDownloadCovers: false,
    shouldDownloadSlideshowImages: false,
    shouldDownloadSubtitles: false,
    shouldDownloadVideos: false,
  };
}
