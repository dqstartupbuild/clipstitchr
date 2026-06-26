import { describe, expect, it } from "vitest";
import { createTikTokScraperBaseInput } from "@/lib/clipstitchr/server/tiktok/createTikTokScraperBaseInput";

describe("createTikTokScraperBaseInput", () => {
  it("creates a schema-compatible base input", () => {
    expect(createTikTokScraperBaseInput(50)).toEqual({
      excludePinnedPosts: false,
      profileScrapeSections: ["videos"],
      profileSorting: "latest",
      proxyCountryCode: "None",
      resultsPerPage: 20,
      scrapeRelatedVideos: false,
      shouldDownloadAvatars: false,
      shouldDownloadCovers: false,
      shouldDownloadMusicCovers: false,
      shouldDownloadSlideshowImages: false,
      shouldDownloadVideos: false,
    });
  });
});
