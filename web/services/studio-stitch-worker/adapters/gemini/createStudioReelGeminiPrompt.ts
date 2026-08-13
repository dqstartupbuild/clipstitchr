import type { StudioStitchRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";

export function createStudioReelGeminiPrompt(recipe: StudioStitchRecipeV1) {
  const claims = recipe.grounding.claims.map((claim) => ({
    id: claim.id,
    text: claim.text,
  }));
  return JSON.stringify({
    instruction:
      "Inspect only the supplied demo video. Identify moments that visibly support the frozen product claims. Do not invent a feature, result, quote, or timestamp. Return strict JSON.",
    productName: recipe.grounding.productName,
    frozenClaims: claims,
    output: {
      selectedMoments: [
        { endSeconds: "number", reason: "visible evidence", startSeconds: "number" },
      ],
      summary: "short grounded summary",
    },
  });
}
