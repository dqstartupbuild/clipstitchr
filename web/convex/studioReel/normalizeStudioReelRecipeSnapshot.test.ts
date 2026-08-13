import { describe, expect, it } from "vitest";
import { planClassicStudioStitchRecipe } from "../../lib/clipstitchr/studio/stitch/planClassicStudioStitchRecipe";
import { serializeStudioStitchRecipe } from "../../lib/clipstitchr/studio/stitch/serializeStudioStitchRecipe";
import { createStudioStitchTestClassicInput } from "../../lib/clipstitchr/studio/stitch/test/createStudioStitchTestClassicInput";
import { normalizeStudioReelRecipeSnapshot } from "./normalizeStudioReelRecipeSnapshot";

describe("normalizeStudioReelRecipeSnapshot", () => {
  it("canonicalizes a bounded immutable recipe for its Product record", () => {
    const recipe = planClassicStudioStitchRecipe(
      createStudioStitchTestClassicInput(),
    );
    const normalized = normalizeStudioReelRecipeSnapshot(
      JSON.stringify(recipe, null, 2),
      {
        id: recipe.id,
        productId: recipe.productId,
        pipeline: recipe.pipeline,
      },
    );

    expect(normalized.recipeJson).toBe(serializeStudioStitchRecipe(recipe));
    expect(normalized.byteLength).toBe(
      new TextEncoder().encode(normalized.recipeJson).byteLength,
    );
    expect(Object.isFrozen(normalized.recipe)).toBe(true);
  });

  it("rejects cross-Product identity and oversized snapshots", () => {
    const recipe = planClassicStudioStitchRecipe(
      createStudioStitchTestClassicInput(),
    );
    expect(() =>
      normalizeStudioReelRecipeSnapshot(serializeStudioStitchRecipe(recipe), {
        id: recipe.id,
        productId: "another_product",
        pipeline: recipe.pipeline,
      }),
    ).toThrow(/identity/);
    expect(() =>
      normalizeStudioReelRecipeSnapshot("x".repeat(256 * 1024 + 1), {
        id: recipe.id,
        productId: recipe.productId,
        pipeline: recipe.pipeline,
      }),
    ).toThrow(/256 KiB/);
  });
});
