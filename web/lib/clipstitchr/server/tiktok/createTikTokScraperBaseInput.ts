export function createTikTokScraperBaseInput(limit: number) {
  return {
    excludePinnedPosts: false,
    maxProfilesPerQuery: 0,
    profileScrapeSections: ["videos"],
    profileSorting: "latest",
    proxyCountryCode: "None",
    resultsPerPage: Math.max(1, Math.min(20, Math.trunc(limit))),
    scrapeRelatedVideos: false,
    searchSection: "",
    shouldDownloadAvatars: false,
    shouldDownloadCovers: false,
    shouldDownloadMusicCovers: false,
    shouldDownloadSlideshowImages: false,
    shouldDownloadSubtitles: false,
    shouldDownloadVideos: false,
  };
}
