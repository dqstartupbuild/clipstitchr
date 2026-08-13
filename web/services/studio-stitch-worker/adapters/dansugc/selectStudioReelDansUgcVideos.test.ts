import { describe, expect, it } from "vitest";
import type { StudioStitchRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import { selectStudioReelDansUgcVideos } from "./selectStudioReelDansUgcVideos";

const recipe = {
  id: "recipe_1",
  segments: [
    { role: "reactionHook", source: { kind: "videoClip", videoClipId: "placeholder_1" } },
    { role: "reactionContext", source: { kind: "videoClip", videoClipId: "placeholder_2" } },
    { role: "demoProof", source: { kind: "videoClip", videoClipId: "demo" } },
  ],
} as unknown as StudioStitchRecipeV1;

describe("selectStudioReelDansUgcVideos", () => {
  it("deterministically selects enough clips from one creator", () => {
    const selected = selectStudioReelDansUgcVideos(recipe, [
      { id: "b", modelId: "model_1", price: 3, similarity: 0.8, title: "B", viralityScore: 90 },
      { id: "a", modelId: "model_1", price: 3, similarity: 0.8, title: "A", viralityScore: 90 },
      { id: "z", modelId: "model_2", price: 3, similarity: 0.9, title: "Z", viralityScore: 95 },
    ]);
    expect(selected.map(({ videoId }) => videoId)).toEqual(["a", "b"]);
    expect(new Set(selected.map(({ modelId }) => modelId))).toEqual(
      new Set(["model_1"]),
    );
  });
});
