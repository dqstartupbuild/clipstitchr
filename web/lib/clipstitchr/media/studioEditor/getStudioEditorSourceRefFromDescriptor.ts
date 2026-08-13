import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import type { StudioEditorSourceRef } from "@/lib/clipstitchr/types/studioEditor/StudioEditorSourceRef";

export function getStudioEditorSourceRefFromDescriptor(
  descriptor: StudioEditorMediaSourceDescriptor,
): StudioEditorSourceRef {
  return descriptor.kind === "videoClip"
    ? { kind: "videoClip", videoClipId: descriptor.id }
    : { kind: "stitch", stitchId: descriptor.id };
}
