import { describe, expect, it } from "vitest";
import { getVideoClipBadgeLabel } from "@/lib/clipstitchr/utils/getVideoClipBadgeLabel";

describe("getVideoClipBadgeLabel", () => {
  it("labels UGC clips", () => {
    expect(getVideoClipBadgeLabel({ clipType: "ugc" })).toBe("UGC");
  });

  it("labels demo clips", () => {
    expect(getVideoClipBadgeLabel({ clipType: "demo" })).toBe("DEMO");
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

  it("labels Clipr outputs as clips", () => {
    expect(
      getVideoClipBadgeLabel({
        clipType: "ugc",
        cliprMetadata: {
          jobId: "job-1",
          productId: "product-1",
          productName: "Product",
          avatarId: "avatar-1",
          avatarPhotoId: "photo-1",
          voiceId: "Zephyr (Female)",
          targetDurationSeconds: 30,
          hookStyleKey: "mystery_gap",
          hookTemplateId: "MG-001",
          filledHook: "The useful thing nobody tells you",
          variablesUsed: {},
          script: "Script",
          sceneCount: 2,
          finalDurationSeconds: 30,
          providerModels: ["model"],
          createdAt: "2026-05-11T00:00:00.000Z",
        },
      }),
    ).toBe("CLIP");
  });
});
