import type { StudioStitchRecipeV1 } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { StudioStitchProviderCapability } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchProviderCapability";

export function getStudioReelProviderRequirement(
  recipe: StudioStitchRecipeV1,
  capability: StudioStitchProviderCapability,
) {
  const requirement = recipe.providerRequirements.find(
    (candidate) => candidate.capability === capability,
  );
  if (!requirement) {
    throw new Error(`Studio Stitch recipe is missing ${capability}.`);
  }
  return requirement;
}
