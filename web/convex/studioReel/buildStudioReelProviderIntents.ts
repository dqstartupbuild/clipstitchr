import type { StudioStitchRecipeV1 } from "../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { Infer } from "convex/values";
import { studioReelProviderIntentValidator } from "../validators/studioReelProviderIntent";
import { studioReelProviderReadinessValidator } from "../validators/studioReelProviderReadiness";

type StudioReelProviderIntent = Infer<typeof studioReelProviderIntentValidator>;
type StudioReelProviderReadiness = Infer<
  typeof studioReelProviderReadinessValidator
>;

export function buildStudioReelProviderIntents(
  recipes: readonly StudioStitchRecipeV1[],
  readiness: readonly StudioReelProviderReadiness[],
): StudioReelProviderIntent[] {
  return readiness.map((provider) => {
    const recipeCount = recipes.filter((recipe) =>
      recipe.providerRequirements.some(
        (requirement) =>
          requirement.capability === provider.capability &&
          !requirement.satisfiedByInput,
      ),
    ).length;
    if (recipeCount === 0) {
      return {
        provider: provider.provider,
        capability: provider.capability,
        state: "satisfiedByInput",
        recipeCount: 0,
        reason: null,
      };
    }
    if (provider.state === "unavailable") {
      return {
        provider: provider.provider,
        capability: provider.capability,
        state: "unavailable",
        recipeCount,
        reason: provider.reason,
      };
    }

    return {
      provider: provider.provider,
      capability: provider.capability,
      state: "intentReady",
      recipeCount,
      reason: null,
    };
  });
}
