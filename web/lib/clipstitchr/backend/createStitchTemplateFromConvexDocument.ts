import type { Doc } from "@/convex/_generated/dataModel";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";

export function createStitchTemplateFromConvexDocument(
  template: Doc<"stitchTemplates">,
): StitchTemplate {
  return {
    createdAt: template.createdAt,
    demoClipId: template.demoClipId,
    demoClipName: template.demoClipName,
    demoPlaybackRate: template.demoPlaybackRate,
    demoTrimRange: template.demoTrimRange,
    duration: template.duration,
    height: template.height,
    id: template.id,
    includeDemoAudio: template.includeDemoAudio,
    includeUgcAudio: template.includeUgcAudio,
    mode: template.mode,
    name: template.name,
    sequenceSegments: template.sequenceSegments,
    sourceStitchId: template.sourceStitchId,
    sourceStitchName: template.sourceStitchName,
    textOverlay: template.textOverlay,
    textOverlays: template.textOverlays,
    socialCaption: template.socialCaption,
    ugcClipId: template.ugcClipId,
    ugcClipName: template.ugcClipName,
    ugcPlaybackRate: template.ugcPlaybackRate,
    ugcTrimRange: template.ugcTrimRange,
    updatedAt: template.updatedAt,
    width: template.width,
  };
}
