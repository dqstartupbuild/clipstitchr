import { describe, expect, it } from "vitest";
import { createTikTokScraperSearchInput } from "@/lib/clipstitchr/server/tiktok/createTikTokScraperSearchInput";

describe("createTikTokScraperSearchInput", () => {
  it("uses the current Apify video search fields", () => {
    expect(createTikTokScraperSearchInput("skincare", 10)).toEqual(
      expect.objectContaining({
        resultsPerPage: 10,
        searchQueries: ["skincare"],
        searchSection: "/video",
      }),
    );
  });
});
