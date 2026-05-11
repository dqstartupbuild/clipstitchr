import { describe, expect, it } from "vitest";
import { getVideoClipBadgeLabel } from "@/lib/clipstitchr/utils/getVideoClipBadgeLabel";

describe("getVideoClipBadgeLabel", () => {
  it("labels UGC clips", () => {
    expect(getVideoClipBadgeLabel({ clipType: "ugc" })).toBe("UGC");
  });

  it("labels demo clips", () => {
    expect(getVideoClipBadgeLabel({ clipType: "demo" })).toBe("DEMO");
  });

  it("labels Clipr clips", () => {
    expect(getVideoClipBadgeLabel({ clipType: "ugc", tags: ["clipr"] })).toBe(
      "CLIPR",
    );
  });

  it("labels Swapr outputs as swaps", () => {
    expect(
      getVideoClipBadgeLabel({
        clipType: "ugc",
        swaprMetadata: {
          source: "swapr",
          sourcePhotoId: "photo-1",
          referenceUgcClipId: "ugc-1",
          replicatePredictionId: "prediction-1",
          modelId: "model-1",
          mode: "std",
          characterOrientation: "image",
          keepOriginalSound: true,
        },
      }),
    ).toBe("SWAP");
  });
});
