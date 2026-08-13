import type { Doc } from "../_generated/dataModel";
import type { StudioEditorMediaSourceDescriptor } from "../../lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";

export function toStudioEditorStitchSourceDescriptor(
  stitch: Doc<"stitchCards"> & {
    stitchObject: NonNullable<Doc<"stitchCards">["stitchObject"]>;
  },
): StudioEditorMediaSourceDescriptor {
  return {
    kind: "stitch",
    id: stitch.id,
    name: stitch.name,
    durationSeconds: stitch.duration,
    width: stitch.width,
    height: stitch.height,
    hasAudio:
      (stitch.includeDemoAudio ?? true) ||
      (stitch.includeUgcAudio ?? true) ||
      stitch.music !== undefined,
    objectKey: stitch.stitchObject.key,
    ...(stitch.posterObject ? { posterKey: stitch.posterObject.key } : {}),
  };
}
