import { describe, expect, it } from "vitest";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import { createStitchrFallbackGenerationOutputText } from "@/lib/clipstitchr/server/createStitchrFallbackGenerationOutputText";
import { parseCliprTextGenerationOutput } from "@/lib/clipstitchr/server/parseCliprTextGenerationOutput";
import { selectStitchrHookCandidates } from "@/lib/clipstitchr/server/selectStitchrHookCandidates";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const product: ProductProfile = {
  audienceDetails: "People beginning calisthenics at home",
  cliprPlaceholderFillers: {
    habit: ["random workouts"],
    pain_point: ["not knowing which exercise comes next"],
    problem: ["unclear progress"],
    thing: ["random reps"],
    topic: ["calisthenics"],
    workflow: ["home training"],
  },
  createdAt: "2026-07-25T00:00:00.000Z",
  id: "guppy",
  inferredPainPoints: ["not knowing which exercise comes next"],
  inferredProblem: "calisthenics progress feels unclear",
  name: "Guppy",
  productDetails: "Guided calisthenics workouts and progress tracking.",
  updatedAt: "2026-07-25T00:00:00.000Z",
};

describe("createStitchrFallbackGenerationOutputText", () => {
  it("returns ten distinct, parseable Batch fallbacks", () => {
    const generations = Array.from({ length: 10 }, (_, index) => {
      const variationSeed = `stitchr-batch:run:${index + 1}`;
      const candidates = selectStitchrHookCandidates({
        clipContexts: [],
        product,
        templates: cliprHookTemplates,
        variationSeed,
      });

      return parseCliprTextGenerationOutput({
        candidates,
        durationSeconds: 30,
        outputText: createStitchrFallbackGenerationOutputText({
          candidates,
          product,
          variationSeed,
        }),
        product,
        providerModel: "anthropic/claude-sonnet-4.6",
        purpose: "stitchr",
        slideCount: 1,
        stitchrHookVariationSeed: variationSeed,
      });
    });

    expect(generations).toHaveLength(10);
    expect(
      new Set(generations.map((generation) => generation.filledHook)).size,
    ).toBe(10);
    expect(
      generations.every(
        (generation) =>
          generation.filledHook === generation.overlayText &&
          generation.hookOptions[0]?.text === generation.filledHook &&
          generation.scenePlan.length === 0 &&
          generation.script === "",
      ),
    ).toBe(true);
  });
});
