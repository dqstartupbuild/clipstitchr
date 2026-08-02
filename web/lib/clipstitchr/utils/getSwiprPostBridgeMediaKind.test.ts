import { describe, expect, it } from "vitest";
import { getSwiprPostBridgeMediaKind } from "@/lib/clipstitchr/utils/getSwiprPostBridgeMediaKind";

describe("getSwiprPostBridgeMediaKind", () => {
  it("uses images for silent TikTok and Instagram Swipe posts", () => {
    expect(
      getSwiprPostBridgeMediaKind({
        hasMusic: false,
        platforms: ["tiktok", "instagram"],
      }),
    ).toBe("image");
  });

  it("uses video when sound or YouTube is selected", () => {
    expect(
      getSwiprPostBridgeMediaKind({
        hasMusic: true,
        platforms: ["instagram"],
      }),
    ).toBe("video");
    expect(
      getSwiprPostBridgeMediaKind({
        hasMusic: false,
        platforms: ["youtube"],
      }),
    ).toBe("video");
  });
});
