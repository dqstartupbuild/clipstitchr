import type { StudioStitchAssetRef } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchAssetRef";
import type { StudioStitchRecipeV1 } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import { getStudioReelAssetIdentity } from "../security/getStudioReelAssetIdentity";

const reactionRoles = new Set([
  "reactionHook",
  "reactionContext",
  "reactionBridge",
  "reactionSupport",
  "ctaReaction",
]);

export function getStudioReelReactionSources(recipe: StudioStitchRecipeV1) {
  const sources: StudioStitchAssetRef[] = [];
  for (const segment of recipe.segments) {
    if (
      reactionRoles.has(segment.role) &&
      !sources.some(
        (source) =>
          getStudioReelAssetIdentity(source) ===
          getStudioReelAssetIdentity(segment.source),
      )
    ) {
      sources.push(segment.source);
    }
  }
  return sources;
}
