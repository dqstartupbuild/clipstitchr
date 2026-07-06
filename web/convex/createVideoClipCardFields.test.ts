import { describe, expect, it } from "vitest";
import type { Doc } from "./_generated/dataModel";
import { createVideoClipCardFields } from "./createVideoClipCardFields";

function createClip(overrides: Partial<Doc<"videoClips">> = {}) {
  return {
    _creationTime: 0,
    _id: "videoClips:clip_1",
    aspectRatio: 9 / 16,
    clipType: "ugc",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 8,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "Clip",
    originalName: "clip.mp4",
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    tags: ["ugc"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_123/video.mp4",
      size: 100,
    },
    width: 1080,
    ...overrides,
  } as Doc<"videoClips">;
}

describe("createVideoClipCardFields", () => {
  it("derives the library kind for older clip rows", () => {
    expect(createVideoClipCardFields(createClip()).libraryKind).toBe("ugc");
    expect(
      createVideoClipCardFields(
        createClip({
          clipType: "demo",
          productId: "product_1",
          tags: ["demo"],
        }),
      ).libraryKind,
    ).toBe("demo");
    expect(
      createVideoClipCardFields(
        createClip({
          swaprMetadata: {
            characterOrientation: "image",
            keepOriginalSound: false,
            mode: "std",
            modelId: "model_1",
            referenceUgcClipId: "clip_1",
            replicatePredictionId: "prediction_1",
            source: "swapr",
            sourcePhotoId: "photo_1",
          },
          tags: ["ugc"],
        }),
      ).libraryKind,
    ).toBe("swapr");
  });

  it("keeps the stored library kind when present", () => {
    expect(
      createVideoClipCardFields(
        createClip({
          libraryKind: "ugc",
        }),
      ).libraryKind,
    ).toBe("ugc");
  });
});
