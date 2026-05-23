import type { Doc } from "@/convex/_generated/dataModel";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

type CreateStitchFromConvexDocumentOptions = {
  stitch: Doc<"stitches">;
  blob?: Blob;
  posterBlob?: Blob;
};

export function createStitchFromConvexDocument({
  stitch,
  blob,
  posterBlob,
}: CreateStitchFromConvexDocumentOptions): Stitch {
  return {
    id: stitch.id,
    name: stitch.name,
    ugcClipId: stitch.ugcClipId,
    demoClipId: stitch.demoClipId,
    ugcClipName: stitch.ugcClipName,
    demoClipName: stitch.demoClipName,
    ugcTrimRange: stitch.ugcTrimRange,
    demoTrimRange: stitch.demoTrimRange,
    stitchObject: stitch.stitchObject,
    blob,
    posterObject: stitch.posterObject,
    posterBlob,
    posterVersion: stitch.posterVersion,
    mimeType: stitch.mimeType,
    size: stitch.size,
    width: stitch.width,
    height: stitch.height,
    duration: stitch.duration,
    includeDemoAudio: stitch.includeDemoAudio,
    includeUgcAudio: stitch.includeUgcAudio,
    demoPlaybackRate: stitch.demoPlaybackRate,
    ugcPlaybackRate: stitch.ugcPlaybackRate,
    music: stitch.music,
    textOverlay: stitch.textOverlay,
    createdAt: stitch.createdAt,
  };
}
