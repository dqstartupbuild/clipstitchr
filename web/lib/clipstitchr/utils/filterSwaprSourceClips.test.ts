import { describe, expect, it } from "vitest";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { filterSwaprSourceClips } from "@/lib/clipstitchr/utils/filterSwaprSourceClips";

const clips = [
  {
    id: "ugc-1",
    clipType: "ugc",
  },
  {
    id: "demo-1",
    clipType: "demo",
  },
  {
    id: "swap-1",
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
  },
] as VideoClipMetadata[];

describe("filterSwaprSourceClips", () => {
  it("keeps UGC-style clips and removes demos", () => {
    expect(filterSwaprSourceClips(clips)).toEqual([clips[0], clips[2]]);
  });
});
