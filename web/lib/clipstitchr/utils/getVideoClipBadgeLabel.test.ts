import { describe, expect, it } from "vitest";
import { getVideoClipBadgeLabel } from "@/lib/clipstitchr/utils/getVideoClipBadgeLabel";

describe("getVideoClipBadgeLabel", () => {
  it("labels UGC clips", () => {
    expect(getVideoClipBadgeLabel({ clipType: "ugc" })).toBe("UGC");
  });

  it("labels demo clips", () => {
    expect(getVideoClipBadgeLabel({ clipType: "demo" })).toBe("DEMO");
  });

  it("labels posted script clips before source type", () => {
    expect(
      getVideoClipBadgeLabel({
        cliprMetadata: {
          avatarId: "avatar-1",
          avatarPhotoId: "photo-1",
          createdAt: "2026-05-11T00:00:00.000Z",
          filledHook: "The useful thing nobody tells you",
          finalDurationSeconds: 30,
          hookStyleKey: "mystery_gap",
          hookTemplateId: "MG-001",
          jobId: "job-1",
          productId: "product-1",
          productName: "Product",
          providerModels: ["model"],
          sceneCount: 2,
          script: "Script",
          targetDurationSeconds: 30,
          variablesUsed: {},
          voiceId: "Rachel",
        },
        clipType: "ugc",
        isPosted: true,
      }),
    ).toBe("POSTED");
  });

  it("ignores stale posted metadata on non-script clips", () => {
    expect(
      getVideoClipBadgeLabel({
        clipType: "ugc",
        isPosted: true,
      }),
    ).toBe("UGC");
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
          voiceId: "Rachel",
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
