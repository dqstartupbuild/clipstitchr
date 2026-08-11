import { describe, expect, it } from "vitest";
import { normalizeSocialPublishingTikTokPhotoTitle } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingTikTokPhotoTitle";

describe("normalizeSocialPublishingTikTokPhotoTitle", () => {
  it("trims and limits a TikTok photo title to 90 characters", () => {
    expect(
      normalizeSocialPublishingTikTokPhotoTitle(`  ${"a".repeat(95)}  `),
    ).toBe("a".repeat(90));
  });
});
