import type { StudioStitchAssetRef } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchAssetRef";
import type { StudioStitchRecipeV1 } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import { getStudioReelAssetIdentity } from "../security/getStudioReelAssetIdentity";

export function getStudioReelReactionRequiredEnd(
  recipe: StudioStitchRecipeV1,
  source: StudioStitchAssetRef,
) {
  const identity = getStudioReelAssetIdentity(source);
  return Math.max(
    0,
    ...recipe.segments
      .filter(
        (segment) =>
          getStudioReelAssetIdentity(segment.source) === identity,
      )
      .map(
        (segment) =>
          segment.sourceOffsetSeconds +
          segment.timelineDurationSeconds * segment.playbackRate,
      ),
  );
}
