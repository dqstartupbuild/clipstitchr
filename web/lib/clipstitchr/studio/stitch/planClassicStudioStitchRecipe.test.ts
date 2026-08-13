import { describe, expect, it } from "vitest";
import { createStudioStitchTestClassicInput } from "./test/createStudioStitchTestClassicInput";
import { planClassicStudioStitchRecipe } from "./planClassicStudioStitchRecipe";

describe("planClassicStudioStitchRecipe", () => {
  it("plans an immutable reaction-demo-cutaway reel with grounded green-zone copy", () => {
    const recipe = planClassicStudioStitchRecipe(
      createStudioStitchTestClassicInput(),
    );

    expect(recipe.pipeline).toBe("classicReel");
    expect(recipe.durationSeconds).toBe(15);
    expect(recipe.segments.map((segment) => segment.role)).toEqual([
      "reactionHook",
      "demoProof",
      "cutaway",
    ]);
    expect(recipe.segments.map((segment) => segment.timelineDurationSeconds)).toEqual([
      5,
      200 / 30,
      100 / 30,
    ]);
    expect(
      recipe.segments.reduce(
        (duration, segment) => duration + segment.timelineDurationSeconds,
        0,
      ),
    ).toBeCloseTo(15, 10);
    expect(recipe.textOverlays.map((overlay) => overlay.centerYPixels)).toEqual([
      310,
      390,
      1380,
    ]);
    expect(recipe.grounding.claims).toContainEqual(
      expect.objectContaining({
        id: "claim_product_proof",
        text: "Records a concise, visible product demonstration.",
        source: {
          kind: "hookLabCreativeBrief",
          field: "productProof",
          sourceIndex: null,
        },
      }),
    );
    expect(recipe.providerRequirements.slice(0, 2)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ satisfiedByInput: true, blocking: false }),
      ]),
    );
    expect(recipe.availability).toEqual({
      state: "ready",
      unavailableCapabilities: [],
    });
    expect(Object.isFrozen(recipe)).toBe(true);
    expect(Object.isFrozen(recipe.segments)).toBe(true);
    expect(recipe.voice).toBeNull();
    expect(recipe.captions).toBeNull();
  });

  it("rejects off-frame durations and source overruns", () => {
    const input = createStudioStitchTestClassicInput();
    expect(() =>
      planClassicStudioStitchRecipe({ ...input, targetDurationSeconds: 10.01 }),
    ).toThrow(/frame-aligned/);
    expect(() =>
      planClassicStudioStitchRecipe({
        ...input,
        reaction: { ...input.reaction, sourceDurationSeconds: 2 },
      }),
    ).toThrow(/too short/);
  });
});
