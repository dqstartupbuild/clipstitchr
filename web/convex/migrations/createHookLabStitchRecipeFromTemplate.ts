import type { Doc } from "../_generated/dataModel";

export function createHookLabStitchRecipeFromTemplate({
  sourceStitch,
  template,
}: {
  sourceStitch: Doc<"stitches"> | null;
  template: Doc<"stitchTemplates">;
}) {
  return {
    demoClipId: template.demoClipId,
    demoClipName: template.demoClipName,
    demoPlaybackRate: template.demoPlaybackRate,
    demoQuickEdit: sourceStitch?.demoQuickEdit,
    demoTrimRange: template.demoTrimRange,
    duration: template.duration,
    height: template.height,
    includeDemoAudio: template.includeDemoAudio,
    includeUgcAudio: template.includeUgcAudio,
    mode: template.mode,
    music: sourceStitch?.music,
    sequenceSegments: template.sequenceSegments,
    socialCaption: template.socialCaption,
    textOverlay: template.textOverlay,
    textOverlays: template.textOverlays,
    ugcClipId: template.ugcClipId,
    ugcClipName: template.ugcClipName,
    ugcPlaybackRate: template.ugcPlaybackRate,
    ugcQuickEdit: sourceStitch?.ugcQuickEdit,
    ugcTrimRange: template.ugcTrimRange,
    width: template.width,
  };
}
