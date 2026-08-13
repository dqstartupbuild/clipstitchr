import { describe, expect, it } from "vitest";
import { parseStudioStitchRecipe } from "./parseStudioStitchRecipe";
import { planClassicStudioStitchRecipe } from "./planClassicStudioStitchRecipe";
import { serializeStudioStitchRecipe } from "./serializeStudioStitchRecipe";
import { createStudioStitchTestClassicInput } from "./test/createStudioStitchTestClassicInput";
import { validateStudioStitchRecipeV1 } from "./validateStudioStitchRecipeV1";

describe("Studio Stitch recipe snapshots", () => {
  it("serializes canonically and parses back into a deep-frozen recipe", () => {
    const recipe = planClassicStudioStitchRecipe(
      createStudioStitchTestClassicInput(),
    );
    const firstSnapshot = serializeStudioStitchRecipe(recipe);
    const secondSnapshot = serializeStudioStitchRecipe(recipe);
    const parsed = parseStudioStitchRecipe(firstSnapshot);

    expect(firstSnapshot).toBe(secondSnapshot);
    expect(serializeStudioStitchRecipe(parsed)).toBe(firstSnapshot);
    expect(parsed).toEqual(recipe);
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(parsed.grounding.claims)).toBe(true);
  });

  it("rejects non-JSON values, unexpected keys, and invalid source references", () => {
    const recipe = planClassicStudioStitchRecipe(
      createStudioStitchTestClassicInput(),
    );
    expect(validateStudioStitchRecipeV1({ ...recipe, remoteUrl: "https://x" })).toContainEqual({
      path: "remoteUrl",
      code: "unexpected_key",
      message: "This field is not part of Studio Stitch recipe version 1.",
    });
    expect(
      validateStudioStitchRecipeV1({ ...recipe, durationSeconds: Number.NaN }),
    ).toContainEqual(
      expect.objectContaining({ code: "not_json_safe" }),
    );
    const invalid = structuredClone(recipe) as unknown as {
      segments: Array<{ source: unknown }>;
    };
    invalid.segments[0].source = {
      kind: "studioUpload",
      objectKey: "https://example.com/private.mp4",
    };
    expect(validateStudioStitchRecipeV1(invalid)).toContainEqual(
      expect.objectContaining({ code: "invalid_source" }),
    );
  });
});
