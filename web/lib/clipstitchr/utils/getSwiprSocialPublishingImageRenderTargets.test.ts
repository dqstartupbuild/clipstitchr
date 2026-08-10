import { describe, expect, it } from "vitest";
import { getSwiprSocialPublishingImageRenderTargets } from "@/lib/clipstitchr/utils/getSwiprSocialPublishingImageRenderTargets";

describe("getSwiprSocialPublishingImageRenderTargets", () => {
  it("uses Instagram's 4:5 feed size when Instagram is the only target", () => {
    expect(getSwiprSocialPublishingImageRenderTargets(["instagram"])).toEqual([
      { customPlatform: null, height: 1350, width: 1080 },
    ]);
  });

  it("keeps 9:16 defaults and adds Instagram media for cross-posts", () => {
    expect(
      getSwiprSocialPublishingImageRenderTargets(["tiktok", "instagram"]),
    ).toEqual([
      { customPlatform: null, height: 1920, width: 1080 },
      { customPlatform: "instagram", height: 1350, width: 1080 },
    ]);
  });
});
