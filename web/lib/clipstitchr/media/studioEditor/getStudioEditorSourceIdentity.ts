import type { StudioEditorSourceRef } from "@/lib/clipstitchr/types/studioEditor/StudioEditorSourceRef";

export function getStudioEditorSourceIdentity(source: StudioEditorSourceRef) {
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
