import { describe, expect, it } from "vitest";
import { getSocialPublishingPlatformLabel } from "@/lib/clipstitchr/utils/getSocialPublishingPlatformLabel";

describe("getSocialPublishingPlatformLabel", () => {
  it("uses readable labels for supported platforms", () => {
    expect(getSocialPublishingPlatformLabel("tiktok")).toBe("TikTok");
    expect(getSocialPublishingPlatformLabel("instagram")).toBe("Instagram");
    expect(getSocialPublishingPlatformLabel("youtube")).toBe("YouTube Shorts");
  });
});
