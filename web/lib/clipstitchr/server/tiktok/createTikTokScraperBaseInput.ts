export function createTikTokScraperBaseInput(limit: number) {
  return {
    excludePinnedPosts: false,
    profileScrapeSections: ["videos"],
    profileSorting: "latest",
    proxyCountryCode: "None",
    resultsPerPage: Math.max(1, Math.min(20, Math.trunc(limit))),
    scrapeRelatedVideos: false,
    shouldDownloadAvatars: false,
    shouldDownloadCovers: false,
    shouldDownloadMusicCovers: false,
    shouldDownloadSlideshowImages: false,
    shouldDownloadVideos: false,
  };
}
