import { describe, expect, it } from "vitest";
import { createHookLabTikTokActorInput } from "@/lib/clipstitchr/server/hookLab/createHookLabTikTokActorInput";

describe("createHookLabTikTokActorInput", () => {
  it("creates a one-post video-download input from a canonical URL", () => {
    expect(
      createHookLabTikTokActorInput(
        "https://m.tiktok.com/@Creator/video/7412345678901234567?lang=en",
      ),
    ).toEqual(
      expect.objectContaining({
        maxItems: 1,
        postURLs: [
          "https://www.tiktok.com/@creator/video/7412345678901234567",
        ],
        resultsPerPage: 1,
        shouldDownloadSlideshowImages: true,
        shouldDownloadVideos: true,
      }),
    );
  });

  it("accepts a mobile short share URL", () => {
    expect(
      createHookLabTikTokActorInput("https://vt.tiktok.com/ZSHared123/?_r=1"),
    ).toEqual(
      expect.objectContaining({
        postURLs: ["https://vt.tiktok.com/ZSHared123/"],
      }),
    );
  });

  it("rejects an Instagram URL", () => {
    expect(() =>
      createHookLabTikTokActorInput("https://www.instagram.com/reel/ABC123/"),
    ).toThrow("TikTok post link");
  });
});
