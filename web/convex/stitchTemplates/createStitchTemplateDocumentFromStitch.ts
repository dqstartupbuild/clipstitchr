import type { Doc } from "../_generated/dataModel";

type CreateStitchTemplateDocumentFromStitchOptions = {
  id: string;
  name: string;
  now: string;
  ownerId: string;
  stitch: Doc<"stitches">;
};

export function createStitchTemplateDocumentFromStitch({
  id,
  name,
  now,
  ownerId,
  stitch,
}: CreateStitchTemplateDocumentFromStitchOptions) {
  return {
    createdAt: now,
    demoClipId: stitch.demoClipId,
    demoClipName: stitch.demoClipName,
    demoPlaybackRate: stitch.demoPlaybackRate,
    demoTrimRange: stitch.demoTrimRange,
    duration: stitch.duration,
    height: stitch.height,
    id,
    includeDemoAudio: stitch.includeDemoAudio,
    includeUgcAudio: stitch.includeUgcAudio,
    mode: stitch.mode,
    name,
    ownerId,
    sequenceSegments: stitch.sequenceSegments,
    sourceStitchId: stitch.id,
    sourceStitchName: stitch.name,
    textOverlay: stitch.textOverlay,
    textOverlays: stitch.textOverlays,
    socialCaption: stitch.socialCaption,
    ugcClipId: stitch.ugcClipId,
    ugcClipName: stitch.ugcClipName,
    ugcPlaybackRate: stitch.ugcPlaybackRate,
    ugcTrimRange: stitch.ugcTrimRange,
    updatedAt: now,
    width: stitch.width,
  };
}
