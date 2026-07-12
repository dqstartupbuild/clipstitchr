import { describe, expect, it } from "vitest";
import { createHookLabInstagramActorInput } from "@/lib/clipstitchr/server/hookLab/createHookLabInstagramActorInput";

describe("createHookLabInstagramActorInput", () => {
  it("creates a one-post direct URL input", () => {
    expect(
      createHookLabInstagramActorInput(
        "https://instagram.com/reels/ABC123/?utm_source=ig_web",
      ),
    ).toEqual({
      addParentData: false,
      directUrls: ["https://www.instagram.com/reel/ABC123/"],
      maxItems: 1,
      resultsLimit: 1,
      resultsType: "posts",
    });
  });

  it("rejects a TikTok URL", () => {
    expect(() =>
      createHookLabInstagramActorInput(
        "https://www.tiktok.com/@creator/video/7412345678901234567",
      ),
    ).toThrow("Instagram post link");
  });
});
