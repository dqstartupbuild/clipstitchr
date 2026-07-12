import type { Doc } from "../_generated/dataModel";

export function createHookLabStitchRecipeFromStitch(
  stitch: Doc<"stitches">,
) {
  return {
    demoClipId: stitch.demoClipId,
    demoClipName: stitch.demoClipName,
    demoPlaybackRate: stitch.demoPlaybackRate,
    demoQuickEdit: stitch.demoQuickEdit,
    demoTrimRange: stitch.demoTrimRange,
    duration: stitch.duration,
    height: stitch.height,
    includeDemoAudio: stitch.includeDemoAudio,
    includeUgcAudio: stitch.includeUgcAudio,
    mode: stitch.mode,
    music: stitch.music,
    sequenceSegments: stitch.sequenceSegments,
    socialCaption: stitch.socialCaption,
    textOverlay: stitch.textOverlay,
    textOverlays: stitch.textOverlays,
    ugcClipId: stitch.ugcClipId,
    ugcClipName: stitch.ugcClipName,
    ugcPlaybackRate: stitch.ugcPlaybackRate,
    ugcQuickEdit: stitch.ugcQuickEdit,
    ugcTrimRange: stitch.ugcTrimRange,
    width: stitch.width,
  };
}
