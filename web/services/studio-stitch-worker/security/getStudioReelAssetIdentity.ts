import type { StudioStitchAssetRef } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchAssetRef";

export function getStudioReelAssetIdentity(source: StudioStitchAssetRef) {
  switch (source.kind) {
    case "videoClip":
      return `videoClip:${source.videoClipId}`;
    case "stitch":
      return `stitch:${source.stitchId}`;
    case "studioOutput":
      return `studioOutput:${source.outputId}`;
    case "studioUpload":
      return `studioUpload:${source.objectKey}`;
  }
}
