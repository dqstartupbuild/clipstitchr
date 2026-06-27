import { describe, expect, it } from "vitest";
import { getPostBridgePlatformLabel } from "@/lib/clipstitchr/utils/getPostBridgePlatformLabel";

describe("getPostBridgePlatformLabel", () => {
  it("uses readable labels for supported platforms", () => {
    expect(getPostBridgePlatformLabel("tiktok")).toBe("TikTok");
    expect(getPostBridgePlatformLabel("instagram")).toBe("Instagram");
    expect(getPostBridgePlatformLabel("youtube")).toBe("YouTube Shorts");
  });
});
