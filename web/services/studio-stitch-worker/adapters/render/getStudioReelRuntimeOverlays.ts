import type { StudioStitchRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { StudioStitchWordTiming } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchWordTiming";
import { createStudioStitchCaptionOverlays } from "../../../../lib/clipstitchr/studio/stitch/createStudioStitchCaptionOverlays";

export function getStudioReelRuntimeOverlays(
  recipe: StudioStitchRecipeV1,
  timelineWordTimings?: readonly StudioStitchWordTiming[],
) {
  if (recipe.pipeline !== "talkingVideo" || !timelineWordTimings) {
    return [...recipe.textOverlays];
  }
  const existingCaptions = recipe.textOverlays.filter(
    (overlay) => overlay.role === "caption",
  );
  const emphasisWords = existingCaptions
    .filter((overlay) => overlay.emphasis)
    .flatMap((overlay) => overlay.text.split(/\s+/u));
  const captions = createStudioStitchCaptionOverlays({
    captionCutoffSeconds: recipe.captions.timingContract.captionCutoffSeconds,
    emphasisWords,
    groundingClaimIds: recipe.voice.groundingClaimIds,
    wordTimings: timelineWordTimings,
  });
  return [
    ...recipe.textOverlays.filter((overlay) => overlay.role !== "caption"),
    ...captions,
  ];
}
