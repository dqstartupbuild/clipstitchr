import { describe, expect, it } from "vitest";
import { planClassicStudioStitchRecipe } from "./planClassicStudioStitchRecipe";
import { planStudioStitchBatchReviewSubset } from "./planStudioStitchBatchReviewSubset";
import { planTalkingStudioStitchRecipe } from "./planTalkingStudioStitchRecipe";
import { createStudioStitchTestClassicInput } from "./test/createStudioStitchTestClassicInput";
import { createStudioStitchTestTalkingInput } from "./test/createStudioStitchTestTalkingInput";

describe("planStudioStitchBatchReviewSubset", () => {
  it("selects deterministic hook-family coverage before recipe ID fill", () => {
    const classicA = planClassicStudioStitchRecipe(
      createStudioStitchTestClassicInput("classic_b"),
    );
    const classicB = planClassicStudioStitchRecipe({
      ...createStudioStitchTestClassicInput("classic_a"),
      hookFamily: "question",
    });
    const classicDuplicateFamily = planClassicStudioStitchRecipe(
      createStudioStitchTestClassicInput("classic_c"),
    );
    const talking = planTalkingStudioStitchRecipe(
      createStudioStitchTestTalkingInput("talking_a"),
    );
    const plan = planStudioStitchBatchReviewSubset({
      recipes: [classicDuplicateFamily, talking, classicA, classicB],
      requestedCount: 3,
    });

    expect(plan.selectedRecipeIds).toEqual([
      "classic_a",
      "classic_b",
      "talking_a",
    ]);
    expect(plan.remainingRecipeIds).toEqual(["classic_c"]);
    expect(plan.coverageKeys).toEqual([
      "classicReel:question",
      "classicReel:whenRelatable",
      "talkingVideo:genuineShock",
    ]);
    expect(Object.isFrozen(plan.selectedRecipeIds)).toBe(true);
  });

  it("rejects duplicate recipe IDs and oversized review requests", () => {
    const recipe = planClassicStudioStitchRecipe(
      createStudioStitchTestClassicInput(),
    );
    expect(() =>
      planStudioStitchBatchReviewSubset({ recipes: [recipe, recipe] }),
    ).toThrow(/unique/);
    expect(() =>
      planStudioStitchBatchReviewSubset({ recipes: [recipe], requestedCount: 2 }),
    ).toThrow(/fit inside/);
  });
});
