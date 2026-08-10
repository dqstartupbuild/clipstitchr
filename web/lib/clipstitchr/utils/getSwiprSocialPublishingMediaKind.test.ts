import { describe, expect, it } from "vitest";
import { getSwiprSocialPublishingMediaKind } from "@/lib/clipstitchr/utils/getSwiprSocialPublishingMediaKind";

describe("getSwiprSocialPublishingMediaKind", () => {
  it("uses images for silent TikTok and Instagram Swipe posts", () => {
    expect(
      getSwiprSocialPublishingMediaKind({
        hasMusic: false,
        platforms: ["tiktok", "instagram"],
      }),
    ).toBe("image");
  });

  it("uses video when sound or YouTube is selected", () => {
    expect(
      getSwiprSocialPublishingMediaKind({
        hasMusic: true,
        platforms: ["instagram"],
      }),
    ).toBe("video");
    expect(
      getSwiprSocialPublishingMediaKind({
        hasMusic: false,
        platforms: ["youtube"],
      }),
    ).toBe("video");
  });
});
